import { Modal } from "@arco-design/web-vue";

type ConfirmButtonProps = {
  status?: "normal" | "warning" | "success" | "danger";
  [key: string]: unknown;
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
      modalClass: mergeClassName(
        dialogOptions.modalClass || dialogOptions.className,
      ),
      okButtonProps: {
        ...(dialogOptions.confirmButtonColor
          ? { status: "danger" }
          : undefined),
        ...(dialogOptions.okButtonProps || {}),
      },
      onOk: () => resolve(true),
      onCancel: () => reject(new Error("cancel")),
      onClose: () => reject(new Error("close")),
    });
  });
}

export { PRIMARY_CONFIRM_CLASS };
