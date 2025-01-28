import './App.css';

function Login() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center"> 
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
                <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-600">LOGO</span>
                    </div>
                </div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">LOG IN TO YOUR ACCOUNT</h2>
            <form className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="mail@abc.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm text-gray-600">
                  <input type="checkbox" className="h-4 w-4" />
                  <span className="ml-2">Remember Me</span>
                </label>
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition-all">
                LOG IN
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600">
              Not Registered Yet?{' '}
              <a href="/signup" className="text-blue-600 hover:underline">
                Create an account
              </a>
            </p>
          </div>
        </div>
      );
    }

export default Login;