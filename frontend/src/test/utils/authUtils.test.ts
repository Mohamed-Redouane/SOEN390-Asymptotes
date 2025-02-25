import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handlerRequestPasswordReset, handlerResetPassword } from '../../utils/authUtils';

describe('authUtils', () => {
  beforeEach(() => {
    vi.useFakeTimers(); // Mock timers before each test, otherwise setTimeout won't work
  });

  afterEach(() => {
    vi.useRealTimers(); // Restore real timers after each test
  });

  // This tests the first function in authUtils.ts
  describe('handlerRequestPasswordReset', () => {
    it('should handle successful password reset request', async () => {
      const mockHandler = vi.fn().mockResolvedValue({ message: 'Reset instructions sent!' });
      const setError = vi.fn();
      const setMessage = vi.fn();
      const navigate = vi.fn();

      await handlerRequestPasswordReset(mockHandler, 'test@example.com', setError, setMessage, navigate);

      expect(mockHandler).toHaveBeenCalledWith('test@example.com');
      expect(setMessage).toHaveBeenCalledWith('Reset instructions sent!');
      expect(setError).not.toHaveBeenCalled();

      // Fast-forward the timer
      vi.runAllTimers();

      expect(navigate).toHaveBeenCalledWith('/reset-password');
    });

    it('should handle Axios error', async () => {
      const mockHandler = vi.fn().mockRejectedValue({
        isAxiosError: true,
        response: { data: { error: 'User not found' } },
      });
      const setError = vi.fn();
      const setMessage = vi.fn();
      const navigate = vi.fn();

      await handlerRequestPasswordReset(mockHandler, 'test@example.com', setError, setMessage, navigate);

      expect(setError).toHaveBeenCalledWith('User not found');
      expect(setMessage).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
    });

    it('should handle generic error', async () => {
      const mockHandler = vi.fn().mockRejectedValue(new Error('Network error'));
      const setError = vi.fn();
      const setMessage = vi.fn();
      const navigate = vi.fn();

      await handlerRequestPasswordReset(mockHandler, 'test@example.com', setError, setMessage, navigate);

      expect(setError).toHaveBeenCalledWith('Network error');
      expect(setMessage).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
    });

    it('should handle unknown error', async () => {
      const mockHandler = vi.fn().mockRejectedValue('Unknown error');
      const setError = vi.fn();
      const setMessage = vi.fn();
      const navigate = vi.fn();

      await handlerRequestPasswordReset(mockHandler, 'test@example.com', setError, setMessage, navigate);

      expect(setError).toHaveBeenCalledWith('An unknown error occurred.');
      expect(setMessage).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  // This tests the second function in authUtils.ts
  describe('handlerResetPassword', () => {
    it('should handle successful password reset', async () => {
      const mockHandler = vi.fn().mockResolvedValue({ message: 'Password reset successful!' });
      const setError = vi.fn();
      const setMessage = vi.fn();
      const navigate = vi.fn();

      await handlerResetPassword(mockHandler, '123456', 'newpassword', setError, setMessage, navigate);

      expect(mockHandler).toHaveBeenCalledWith('123456', 'newpassword');
      expect(setMessage).toHaveBeenCalledWith('Password reset successful!');
      expect(setError).not.toHaveBeenCalled();

      // Fast-forward the timer
      vi.runAllTimers();

      expect(navigate).toHaveBeenCalledWith('/login');
    });

    it('should handle Axios error', async () => {
      const mockHandler = vi.fn().mockRejectedValue({
        isAxiosError: true,
        response: { data: { error: 'Invalid reset code' } },
      });
      const setError = vi.fn();
      const setMessage = vi.fn();
      const navigate = vi.fn();

      await handlerResetPassword(mockHandler, '123456', 'newpassword', setError, setMessage, navigate);

      expect(setError).toHaveBeenCalledWith('Invalid reset code');
      expect(setMessage).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
    });

    it('should handle generic error', async () => {
      const mockHandler = vi.fn().mockRejectedValue(new Error('Network error'));
      const setError = vi.fn();
      const setMessage = vi.fn();
      const navigate = vi.fn();

      await handlerResetPassword(mockHandler, '123456', 'newpassword', setError, setMessage, navigate);

      expect(setError).toHaveBeenCalledWith('Network error');
      expect(setMessage).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
    });

    it('should handle unknown error', async () => {
      const mockHandler = vi.fn().mockRejectedValue('Unknown error');
      const setError = vi.fn();
      const setMessage = vi.fn();
      const navigate = vi.fn();

      await handlerResetPassword(mockHandler, '123456', 'newpassword', setError, setMessage, navigate);

      expect(setError).toHaveBeenCalledWith('An unknown error occurred');
      expect(setMessage).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
    });
  });
});