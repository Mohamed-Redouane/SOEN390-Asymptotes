import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LoginForm.css';
import videoSrc from "../../assets/concordiaa.mp4";

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
    <div className="min-h-screen flex items-center justify-center w-full px-4 py-8">
      <video autoPlay muted loop className="background-video">
        <source src={videoSrc} type="video/mp4" />
        Not supported
      </video>
      <div className="background-overlay"></div>
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6 animate-fade-in relative z-10">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Create an account
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-4 animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 bg-white text-black"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="user-email" className="text-gray-800 text-sm font-semibold">
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
              className="block w-full px-4 py-2 border border-gray-400 rounded-lg shadow-sm 
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                disabled:opacity-60 disabled:cursor-not-allowed transition-all bg-gray-50 text-gray-900"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="user-password" className="text-gray-800 text-sm font-semibold">
              Secure Password
            </label>
            <div className="flex items-center border border-gray-400 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-indigo-500">
              <input
                id="user-password"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="flex-grow px-4 py-2 focus:outline-none bg-gray-50 text-gray-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 text-indigo-600 hover:text-indigo-800 transition-all duration-300 bg-transparent"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>


          <div className="text-sm text-blue-600 text-center">
            Already have an account? <Link to="/login" className="hover:underline transition-all duration-300">Log in</Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}