import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthService } from '../../services/authService';
import { handlerRequestPasswordReset } from '../../utils/authUtils';
import videoSrc from '../../assets/concordiaa.mp4'; 
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

export function RequestPasswordResetPage() {
  const { handleRequestPasswordReset } = useAuthService();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    await handlerRequestPasswordReset(handleRequestPasswordReset, email, setError, setMessage, navigate);
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
          Request Password Reset
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
            <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-purple-300/30 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 
                         bg-purple-400/20 text-white placeholder:text-purple-200/70"
            />
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
                Sending...
              </span>
            ) : (
              'Send Reset Instructions'
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
