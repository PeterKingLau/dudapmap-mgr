import { Modal, type ButtonProps } from "antd";

type ConfirmButtonProps = ButtonProps & {
  status?: "normal" | "warning" | "success" | "danger";
};

type PrimaryConfirmOptions = {
  cancelButtonText?: string;
  cancelText?: string;
  className?: string;
  confirmButtonColor?: string;
  confirmButtonText?: string;
  content?: string;
  message?: string;
  modalClass?: string;
  okButtonProps?: ConfirmButtonProps;
  okText?: string;
  title?: string;
};

type PrimaryConfirmInput = PrimaryConfirmOptions | string;

const PRIMARY_CONFIRM_CLASS = "primary-confirm-dialog";

function mergeClassName(className?: string): string {
  return [PRIMARY_CONFIRM_CLASS, className].filter(Boolean).join(" ");
}

function normalizeOkButtonProps(
  options: PrimaryConfirmOptions,
): ButtonProps | undefined {
  const { status: _status, ...okButtonProps } = options.okButtonProps || {};

  return {
    ...(options.confirmButtonColor || options.okButtonProps?.status === "danger"
      ? { danger: true }
      : undefined),
    ...okButtonProps,
  };
}

export function showPrimaryConfirmDialog(
  options: PrimaryConfirmInput = {},
): Promise<true> {
  const dialogOptions =
    typeof options === "string" ? { message: options } : options;

  return new Promise((resolve, reject) => {
    Modal.confirm({
      title: dialogOptions.title || "确认操作",
      content: dialogOptions.content || dialogOptions.message || "",
      okText: dialogOptions.okText || dialogOptions.confirmButtonText || "确定",
      cancelText:
        dialogOptions.cancelText || dialogOptions.cancelButtonText || "取消",
      className: mergeClassName(
        dialogOptions.modalClass || dialogOptions.className,
      ),
      okButtonProps: normalizeOkButtonProps(dialogOptions),
      onOk: () => {
        resolve(true);
      },
      onCancel: () => {
        reject(new Error("cancel"));
      },
    });
  });
}

export { PRIMARY_CONFIRM_CLASS };
