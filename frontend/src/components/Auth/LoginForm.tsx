import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LoginForm.css';
import videoSrc from "../../assets/concordiaa.mp4";
import { Eye, EyeOff, Loader, AlertCircle, CheckCircle } from 'lucide-react'; 
import { motion } from 'framer-motion';

interface LoginFormProps {
  readonly onSubmit: (email: string, password: string) => Promise<void>;
  readonly error?: string;
  readonly isLoading?: boolean;
  readonly successMessage?: string; // <-- NEW
}

export function LoginForm({ onSubmit, error, isLoading, successMessage }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(email, password);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      {/* Video Background */}
      <video autoPlay muted loop className="background-video">
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Glass Card */}
      <div className="purple-glass-card w-full max-w-md p-8 animate-fade-in relative z-10">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          Sign in to your account
        </h2>

        {/* Animated error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center bg-red-50 border border-red-300 text-red-700 
                       px-4 py-3 rounded-lg mb-4"
          >
            <AlertCircle className="mr-2" />
            {error}
          </motion.div>
        )}

        {/* Animated success message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center bg-green-50 border border-green-300 text-green-700 
                       px-4 py-3 rounded-lg mb-4"
          >
            <CheckCircle className="mr-2" />
            {successMessage}
          </motion.div>
        )}

        {/* Only show form if there's no success message */}
        {!successMessage && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="w-full px-4 py-3 border border-purple-300/30 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400
                           disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 
                           bg-purple-400/20 text-white placeholder:text-purple-200/70"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full px-4 py-3 border border-purple-300/30 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400
                             disabled:opacity-50 disabled:cursor-not-allowed pr-12 transition-all duration-300 
                             bg-purple-400/20 text-white placeholder:text-purple-200/70"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 
                             text-purple-200 hover:text-white transition-all duration-300 
                             bg-transparent p-1 rounded"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <Link 
                to="/forgot-password"
                className="text-blue-300 hover:text-blue-200 transition-all duration-300"
              >
                Forgot password?
              </Link>
              <Link 
                to="/register"
                className="text-blue-300 hover:text-blue-200 transition-all duration-300"
              >
                Create an account
              </Link>
            </div>

            {/* Animated button with spinner */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300
                         text-lg font-semibold"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader className="animate-spin mr-2" size={20} />
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>
        )}
      </div>
    </div>
  );
}
