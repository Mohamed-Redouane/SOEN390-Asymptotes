import { isAxiosError, ErrorResponse } from './axiosUtils';

// Function for handling the "request password reset" flow
export async function handlerRequestPasswordReset(
  handler: (email: string) => Promise<any>,
  email: string,
  setError: (error: string) => void,
  setMessage: (message: string) => void,
  navigate: (path: string) => void
) {
  try {
    const data = await handler(email);
    setMessage(data.message || 'Reset instructions sent!');
    setTimeout(() => navigate('/reset-password'), 2000);
  } catch (err: unknown) {
    if (isAxiosError<ErrorResponse>(err)) {
      setError(err.response?.data?.error || 'Request failed');
    } else if (err instanceof Error) {
      setError(err.message);
    } else {
      setError('An unknown error occurred.');
    }
  }
}

// Function for handling the "reset password" flow
export async function handlerResetPassword(
  handler: (code: string, newPassword: string) => Promise<any>,
  code: string,
  newPassword: string,
  setError: (error: string) => void,
  setMessage: (message: string) => void,
  navigate: (path: string) => void
) {
  try {
    const data = await handler(code, newPassword);
    setMessage(data.message || 'Password reset successful!');
    setTimeout(() => navigate('/login'), 2000); // Redirect to login after reset
  } catch (err: unknown) {
    if (isAxiosError<ErrorResponse>(err)) {
      setError(err.response?.data?.error || 'Request failed');
    } else if (err instanceof Error) {
      setError(err.message);
    } else {
      setError('An unknown error occurred');
    }
  }
}