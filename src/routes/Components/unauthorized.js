import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Unauthorized = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('worker'); // Track selected user type

  const handleGoBack = () => {
    navigate('/'); // Redirect to the home page
  };

  const handleLogin = () => {
    // Navigate to appropriate login based on user type
    const loginRoute = userType === 'worker' ? '/login' : '/login-manager';
    navigate(loginRoute);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <svg
            className="h-6 w-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        
        <h1 className="mt-3 text-2xl font-semibold text-gray-900">Unauthorized Access</h1>
        <p className="mt-2 text-gray-600">
          You don't have permission to access this page.
        </p>
        
        <div className="mt-6">
          <label htmlFor="user-type" className="block text-sm font-medium text-gray-700 mb-1">
            Select your role:
          </label>
          <select
            id="user-type"
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="worker">Worker</option>
            <option value="manager">Manager</option>
          </select>
        </div>

        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {userType === 'worker' ? 'Worker Login' : 'Manager Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;