import { useCallback, useEffect, useRef } from "react";

type SafeAsyncOptions<T> = {
  onError?: (error: unknown) => void;
  onFinally?: () => void;
  onSuccess?: (result: T) => void;
};

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException ||
    (Boolean(error) && typeof error === "object" && "name" in error)
    ? (error as { name?: string }).name === "AbortError"
    : false;
}

export function useSafeAsync() {
  const controllersRef = useRef(new Set<AbortController>());
  const mountedRef = useRef(false);

  const cancelAll = useCallback(() => {
    controllersRef.current.forEach((controller) => {
      controller.abort();
    });
    controllersRef.current.clear();
  }, []);

  const isMounted = useCallback(() => mountedRef.current, []);

  const run = useCallback(
    async <T>(
      task: (signal: AbortSignal) => Promise<T>,
      options: SafeAsyncOptions<T> = {},
    ): Promise<T | undefined> => {
      const controller = new AbortController();

      controllersRef.current.add(controller);

      try {
        const result = await task(controller.signal);

        if (!mountedRef.current || controller.signal.aborted) {
          return undefined;
        }

        options.onSuccess?.(result);

        return result;
      } catch (error) {
        if (
          !mountedRef.current ||
          controller.signal.aborted ||
          isAbortError(error)
        ) {
          return undefined;
        }

        options.onError?.(error);

        return undefined;
      } finally {
        controllersRef.current.delete(controller);

        if (mountedRef.current && !controller.signal.aborted) {
          options.onFinally?.();
        }
      }
    },
    [],
  );

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      cancelAll();
    };
  }, [cancelAll]);

  return {
    cancelAll,
    isMounted,
    run,
  };
}
