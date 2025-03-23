import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LoginForm.css'; 
import videoSrc from '../../assets/concordiaa.mp4';
import { motion } from 'framer-motion';
import { AlertCircle, Eye, EyeOff, Loader } from 'lucide-react';

interface RegisterFormProps {
  onSubmit: (username: string, email: string, password: string) => Promise<void>;
  error?: string;
  isLoading?: boolean;
}

export function RegisterForm({ onSubmit, error, isLoading }: RegisterFormProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(username, email, password);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative">
      {/* Background Video */}
      <video autoPlay muted loop className="background-video">
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Glass Card */}
      <div className="purple-glass-card w-full max-w-md p-8 animate-fade-in relative z-10">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          Create an account
        </h2>

        {/* Animated Error Message */}
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

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-200 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
              className="w-full px-4 py-3 border border-purple-300/30 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 
                         bg-purple-400/20 text-white placeholder:text-purple-200/70"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="user-email" className="block text-sm font-medium text-gray-200 mb-1">
              Email Address
            </label>
            <input
              id="user-email"
              type="email"
              placeholder="yourname@example.com"
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

          {/* Password */}
          <div>
            <label htmlFor="user-password" className="block text-sm font-medium text-gray-200 mb-1">
              Secure Password
            </label>
            <div className="relative">
              <input
                id="user-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="********"
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
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Already have an account? */}
          <div className="text-sm text-center text-blue-100">
            Already have an account?{' '}
            <Link to="/login" className="underline hover:text-white transition-all duration-300">
              Log in
            </Link>
          </div>

          {/* Register Button with Spinner */}
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
                Registering...
              </span>
            ) : (
              'Register'
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
