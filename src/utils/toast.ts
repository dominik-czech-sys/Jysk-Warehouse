import { toast } from "sonner";
import i18n from "@/i18n"; // Import i18n instance

export const showSuccess = (message: string) => {
  toast.success(i18n.t(message));
};

export const showError = (message: string) => {
  toast.error(i18n.t(message));
};

export const showLoading = (message: string) => {
  return toast.loading(i18n.t(message));
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};