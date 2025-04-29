import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/LaborSynclogo.png";
import Notification from "../Components/Notification"; // Import Notification component
import { logout } from "../../endpoints/api";

const ManagerProfilePage = () => {
  const { managerProfile, fetchManagerProfile, updateManagerProfileData, loading } = useAuth();
  const [profileData, setProfileData] = useState({
    user: {
      username: "",
      email: "",
      first_name: "",
      last_name: ""
    },
    company_name: "",
    work_location: ""
  });
  // Add notification state
  const [notification, setNotification] = useState({
    message: "",
    show: false,
    type: "success"
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchManagerProfile();
  }, [fetchManagerProfile]);

  useEffect(() => {
    if (!loading && managerProfile) {
      setProfileData({
        user: {
          username: managerProfile.user?.username || "",
          email: managerProfile.user?.email || "",
          first_name: managerProfile.user?.first_name || "",
          last_name: managerProfile.user?.last_name || ""
        },
        company_name: managerProfile.company_name || "",
        work_location: managerProfile.work_location || ""
      });
    }
  }, [loading, managerProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateManagerProfileData(profileData);
      // Show success notification instead of alert
      setNotification({
        message: "Profile updated successfully!",
        show: true,
        type: "success"
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      // Show error notification instead of alert
      if (error.response && error.response.data && error.response.data.user && error.response.data.user.username) {
        setNotification({
          message: error.response.data.user.username[0],
          show: true,
          type: "error"
        });
      } else {
        setNotification({
          message: "Error updating profile. Please try again.",
          show: true,
          type: "error"
        });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('user.')) {
      const userField = name.split('.')[1];
      setProfileData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          [userField]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Function to close notification
  const closeNotification = () => {
    setNotification({ ...notification, show: false });
  };

  if (loading) return <div className="text-center text-gray-600">Loading...</div>;
  if (!managerProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 max-w-md w-full rounded-md shadow-md">
          <p className="font-semibold text-center">
            Please log in as Manager to View.
          </p>
        </div>
      </div>
    );
  }

  
    const handleLogout = async () => {
           try {
              await logout();
              navigate('/login-manager');
           } catch (error) {
              console.error("Error during logout:", error);
             
           }
         };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 font-['Poppins']">
      {/* Notification Component */}
      {notification.show && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={closeNotification} 
        />
      )}
      
    
        {/* Sidebar */}
        <div className="w-full md:w-1/6 bg-white shadow-md flex flex-col">
        <div className="flex items-center justify-center py-4 border-b">
          <img src={logo} alt="LaborSync Logo" className="w-28 md:w-36 h-auto" />
        </div>
        <nav className="flex-grow overflow-y-auto">
          <ul className="flex flex-col py-4">
            {[
              { path: '/manager-dashboard', label: 'Dashboard' },
              { path: '/create-project', label: 'Project' },
              { path: '/assign-task', label: 'Assign Tasks' },
              { path: '/manager-rewards', label: 'Rewards' },
              { path: '/reports', label: 'Reports' },
              { path: '/manager-profile', label: 'Manager Details' }
            ].map((item, index) => (
              <li 
                key={index}
                className={`px-4 md:px-6 py-2 hover:bg-gray-200 cursor-pointer transition-colors duration-200 ${
                  window.location.pathname === item.path ? 'bg-gray-100 font-medium' : ''
                }`}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full bg-gray-200 text-gray-600 py-2 rounded hover:bg-gray-300 transition duration-200 font-medium"
          >
            Logout
          </button>
        </div>
      </div>
      
      {/* Main Content with Form */}
      <div className="flex-grow p-6 md:p-10">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Manager Profile</h2>
            <p className="text-gray-500 mb-6">Update your personal and company information</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Username", name: "user.username", type: "text", icon: "👤" },
                  { label: "Email", name: "user.email", type: "email", icon: "✉️" },
                  { label: "First Name", name: "user.first_name", type: "text", icon: "📝" },
                  { label: "Last Name", name: "user.last_name", type: "text", icon: "📝" },
                  { label: "Company Name", name: "company_name", type: "text", icon: "🏢" },
                  { label: "Work Location", name: "work_location", type: "text", icon: "📍" }
                ].map((field, index) => (
                  <div key={index} className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                      <span className="mr-2">{field.icon}</span>{field.label}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={
                        field.name.startsWith('user.') 
                          ? profileData.user[field.name.split('.')[1]]
                          : profileData[field.name]
                      }
                      onChange={handleChange}
                      disabled={field.disabled}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                        field.disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "hover:border-indigo-400 group-hover:shadow-md"
                      }`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium shadow-sm hover:shadow-md flex items-center"
                  onClick={() => setProfileData({
                    user: {
                      username: managerProfile.user.username,
                      email: managerProfile.user.email,
                      first_name: managerProfile.user.first_name,
                      last_name: managerProfile.user.last_name,
                    },
                    company_name: managerProfile.company_name,
                    work_location: managerProfile.work_location,
                  })}
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium shadow-sm hover:shadow-md flex items-center"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerProfilePage;