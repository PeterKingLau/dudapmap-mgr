import { App as AntdApp, message as staticMessage } from "antd";
import { useEffect } from "react";

type MessageApi = ReturnType<typeof AntdApp.useApp>["message"];

let contextualMessage: MessageApi | null = null;

export function AntdMessageBridge() {
  const { message } = AntdApp.useApp();

  useEffect(() => {
    contextualMessage = message;

    return () => {
      if (contextualMessage === message) {
        contextualMessage = null;
      }
    };
  }, [message]);

  return null;
}

function getMessage() {
  return contextualMessage || staticMessage;
}

export const message = {
  destroy: (...args: Parameters<MessageApi["destroy"]>) =>
    getMessage().destroy(...args),
  error: (...args: Parameters<MessageApi["error"]>) =>
    getMessage().error(...args),
  info: (...args: Parameters<MessageApi["info"]>) => getMessage().info(...args),
  loading: (...args: Parameters<MessageApi["loading"]>) =>
    getMessage().loading(...args),
  open: (...args: Parameters<MessageApi["open"]>) => getMessage().open(...args),
  success: (...args: Parameters<MessageApi["success"]>) =>
    getMessage().success(...args),
  warning: (...args: Parameters<MessageApi["warning"]>) =>
    getMessage().warning(...args),
};
