import toast from 'react-hot-toast';

type ApiError = {
  data?: { message?: string | string[]; error?: string };
  response?: { data?: { message?: string | string[]; error?: string } };
  message?: string;
};

export const toastSuccess = (message: string) => toast.success(message);

export const getErrorMessage = (error: unknown, fallback = 'Something went wrong') => {
  const apiError = error as ApiError | undefined;
  const message =
    apiError?.data?.message ??
    apiError?.response?.data?.message ??
    apiError?.data?.error ??
    apiError?.response?.data?.error ??
    apiError?.message;

  return Array.isArray(message) ? message.join(', ') : message || fallback;
};

export const toastError = (error: unknown, fallback?: string) =>
  toast.error(getErrorMessage(error, fallback));
