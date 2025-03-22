import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthService } from '../../services/authService';
import { handlerResetPassword } from '../../utils/authUtils';
import videoSrc from '../../assets/concordiaa.mp4';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Loader, Eye, EyeOff } from 'lucide-react';

export function ResetPasswordPage() {
  const { handleResetPassword } = useAuthService();
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    await handlerResetPassword(
      handleResetPassword,
      code,
      newPassword,
      setError,
      setMessage,
      navigate
    );
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative">

      <video autoPlay muted loop className="background-video">
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>


      <div className="purple-glass-card w-full max-w-md p-8 animate-fade-in relative z-10">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          Reset Password
        </h2>


        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center bg-red-500/20 border border-red-500/30 
                       text-red-100 px-4 py-3 rounded mb-4 animate-shake"
          >
            <AlertCircle className="mr-2" />
            {error}
          </motion.div>
        )}


        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center bg-green-500/20 border border-green-500/30 
                       text-green-100 px-4 py-3 rounded mb-4"
          >
            <CheckCircle className="mr-2" />
            {message}
          </motion.div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">

          <div>
            <label htmlFor="reset-code" className="block text-sm font-medium text-gray-200 mb-1">
              Reset Code
            </label>
            <input
              id="reset-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading}
              required
              placeholder="Enter reset code"
              className="w-full px-4 py-3 border border-purple-300/30 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 
                         bg-purple-400/20 text-white placeholder:text-purple-200/70"
            />
          </div>


          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-200 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                required
                placeholder="Enter new password"
                className="w-full px-4 py-3 border border-purple-300/30 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400
                           disabled:opacity-50 disabled:cursor-not-allowed pr-12 transition-all duration-300
                           bg-purple-400/20 text-white placeholder:text-purple-200/70"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 
                           text-purple-200 hover:text-white transition-all duration-300 
                           bg-transparent p-1 rounded"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>


          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-200 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={loading}
                required
                placeholder="Confirm new password"
                className="w-full px-4 py-3 border border-purple-300/30 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400
                           disabled:opacity-50 disabled:cursor-not-allowed pr-12 transition-all duration-300
                           bg-purple-400/20 text-white placeholder:text-purple-200/70"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 
                           text-purple-200 hover:text-white transition-all duration-300 
                           bg-transparent p-1 rounded"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-blue-600 text-white py-3 rounded-lg 
                       hover:bg-blue-700 focus:outline-none focus:ring-2 
                       focus:ring-blue-500 focus:ring-offset-2 
                       disabled:opacity-50 disabled:cursor-not-allowed 
                       transition-colors duration-300 text-lg font-semibold"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader className="animate-spin mr-2" size={20} />
                Resetting...
              </span>
            ) : (
              'Reset Password'
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
