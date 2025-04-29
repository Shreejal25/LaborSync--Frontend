import React, { useState } from 'react';
import { formButton } from '../../Style/tailwindStyles'; 
import { useAuth } from '../../context/useAuth'; 
import { useNavigate } from 'react-router-dom'; 
import logo from '../../assets/images/LaborSynclogo.png'; 
import Notification from '../Components/Notification'; 

const ManagerLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); 
  const [showPassword, setShowPassword] = useState(false); 
  const [notification, setNotification] = useState({
    message: '',
    show: false,
    type: ''
  });
  const navigate = useNavigate(); 
  const { loginUser } = useAuth(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await loginUser(username, password);
      console.log('Login Response:', response);
  
      if (response && response.data && response.data.dashboard_type) {
        if (response.data.dashboard_type === 'Managers') {
          navigate('/manager-dashboard');
        } else {
          navigate('/menu'); 
        }
      } else {
        console.error('Dashboard type missing from login response');
        
        navigate('/manager-dashboard'); 
      }
    } catch (error) {
      console.error('Login error:', error);
      setNotification({
        message: 'Login failed. Please check your credentials.',
        show: true,
        type: 'error',
      });
     
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleNav = () => {
    navigate('/register'); // Navigate to register page
  };

  const closeNotification = () => {
    setNotification({ ...notification, show: false });
  };

  return (
    <div className="h-screen flex items-center justify-center bg-white"> 
      <div className="flex w-full max-w-4xl items-center">
        {/* Logo Section */}
        <div className="hidden md:block w-1/2 h-full flex items-center justify-center">
          <img
            src={logo} 
            alt="Logo"
            className="w-full max-w-[300px] object-contain"
          />
        </div>

        {/* Login Form Section */}
        <div className="w-full md:w-1/2 px-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <h2 className="text-left text-4xl font-bold font-poppins mb-4">
              Log In for Managers
            </h2>
            <p className="text-left text-sm font-poppins text-gray-600 mb-6">
              Please enter your contact details to manage.
            </p>
            <div>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" // Larger padding and font size
                placeholder="Username"
                required
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" // Larger padding and font size
                placeholder="Password"
                required
              />
              {password.length > 0 && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right mb-4">
              <span
                className="text-blue-500 hover:underline cursor-pointer"
                onClick={() => navigate('/forgot-password')}
              >
                Forgot Password?
              </span>
            </div>

            <button
              type="submit"
              className={`${formButton} w-1/2 mx-auto`} 
              disabled={loading} 
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            {/* Sign Up Link */}
            <div className="text-center mt-4">
              <span className="text-black">
                Don't have an account?{' '}
              </span>
              <span
                onClick={handleNav}
                className="cursor-pointer text-red-500 hover:underline"
              >
                Sign up
              </span>
            </div>
          </form>
          {notification.show && (
            <Notification message={notification.message} onClose={closeNotification} type={notification.type} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerLogin;