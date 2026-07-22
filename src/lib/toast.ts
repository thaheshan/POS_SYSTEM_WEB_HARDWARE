import { toast } from "react-hot-toast";

export function toastSuccess(message: string) {
  return toast.success(message);
}

export function toastError(error: unknown, fallback = "Something went wrong. Please try again.") {
  const responseMessage = (error as { response?: { data?: { message?: string | string[] } } })
    ?.response?.data?.message;
  const message = Array.isArray(responseMessage)
    ? responseMessage.join(" ")
    : responseMessage || (error instanceof Error ? error.message : fallback);

  return toast.error(message);
}
