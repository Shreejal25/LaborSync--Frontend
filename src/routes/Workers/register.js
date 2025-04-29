import React, { useState } from "react";
import { formInput, formButton } from "../../Style/tailwindStyles";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/LaborSynclogo.png";
import Notification from "../Components/Notification";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [CPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [notification, setNotification] = useState({
    message: "",
    show: false,
    type: ""
  });
  const [loading, setLoading] = useState(false);


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const navigate = useNavigate();
  const { registerUser } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Check if all fields are filled
    if (!username || !email || !password || !CPassword || !firstName || !lastName) {
      setNotification({
        message: "All fields are required",
        show: true,
        type: "error"
      });
      setLoading(false);
      return;
    }

    try {
      const result = await registerUser(username, email, password, CPassword, firstName, lastName);

      if (result && result.success) {
        setNotification({
          message: "Registration successful! Redirecting to login...",
          show: true,
          type: "success"
        });

        // Clear form fields after successful registration
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setFirstName("");
        setLastName("");

        // Delay navigation to allow notification to be seen
        setTimeout(() => {
          navigate('/login');
        }, 3000); // 3 seconds delay
      } else {
        setNotification({
          message: result?.message || "Registration failed. Please try again.",
          show: true,
          type: "error"
        });
      }
    } catch (error) {
      setNotification({
        message: error.message || "Registration failed. Please try again.",
        show: true,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const closeNotification = () => {
    setNotification({ ...notification, show: false });
  };

  return (
    <div className="h-screen flex items-center justify-center bg-white">
      {/* Left Section for Logo */}
      <div className="w-1/3 flex flex-col items-center justify-center">
        <img src={logo} alt="LaborSync Logo" className="w-80 h-auto mb-8 ml-52" />
      </div>

      {/* Right Section for Form */}
      <div className="w-2/3 flex flex-col items-center relative">
        <h2 className="text-4xl font-bold mb-6">Sign up</h2>
        <p className="text-lg text-gray-600 mb-10">
          Lets get you all set up so you can access your personal account.
        </p>
        <form
          className="w-full max-w-lg grid grid-cols-2 gap-6"
          onSubmit={handleRegister}
        >
          <div className="col-span-1 relative">
            <input
              name="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              type="text"
              className={`${formInput} text-base py-3 w-full`}
              placeholder="First Name"
              required
            />
          </div>
          <div className="col-span-1 relative">
            <input
              name="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              type="text"
              className={`${formInput} text-base py-3 w-full`}
              placeholder="Last Name"
              required
            />
          </div>
          <div className="col-span-1 relative">
            <input
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              className={`${formInput} text-base py-3 w-full`}
              placeholder="Username"
              required
            />
          </div>
          <div className="col-span-1 relative">
            <input
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className={`${formInput} text-base py-3 w-full`}
              placeholder="Email"
              required
            />
          </div>
          <div className="col-span-1 relative">
            <input
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              className={`${formInput} text-base py-3 w-full`}
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
          <div className="col-span-1 relative">
            <input
              name="confirmPassword"
              value={CPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              className={`${formInput} text-base py-3 w-full`}
              placeholder="Confirm Password"
              required
            />
            {CPassword.length > 0 && (
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            )}
          </div>
          <div className="col-span-2 text-center mt-6">
            <button
              type="submit"
              disabled={loading}
              className={`${formButton} w-1/2 mx-auto`}>
              {loading ? "Processing..." : "Sign up"}
            </button>
          </div>
        </form>
        <p className="mt-6 text-lg text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-red-500 hover:underline">
            Login
          </a>
        </p>
      </div>

      {/* Make sure notification is visible with fixed positioning */}
      {notification.show && (
        <div className="fixed top-5 right-5 z-50">
          <Notification
            message={notification.message}
            onClose={closeNotification}
            type={notification.type}
          />
        </div>
      )}
    </div>
  );  
};

export default Register;