import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/LaborSynclogo.png";
import { updateUserProfile, getUserProfile, logout } from "../../endpoints/api";
import Notification from '../Components/Notification';

const UserProfilePage = () => {
  const { userProfile, fetchUserProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);

  const initialFormState = {
    user: {
      username: "",
      email: "",
      first_name: "",
      last_name: "",
    },
    profile_image: null,
    phone_number: "",
    gender: "",
    current_address: "",
    permanent_address: "",
    city_town: "",
    state_province: "",
    education_level: "",
    certifications: "",
    skills: "",
    languages_spoken: "",
    work_availability: "",
    work_schedule_preference: "",
  };

  const [profileData, setProfileData] = useState(initialFormState);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Work availability options
  const workAvailabilityOptions = [
    { value: '', label: '---------' },
    { value: 'fulltime', label: 'Fulltime' },
    { value: 'parttime', label: 'Part-time' },
    { value: 'freelance', label: 'Freelance' }
  ];

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (!loading && userProfile) {
      setProfileData({
        user: {
          username: userProfile.user?.username || "",
          email: userProfile.user?.email || "",
          first_name: userProfile.user?.first_name || "",
          last_name: userProfile.user?.last_name || "",
        },
        profile_image: userProfile.profile_image || null,
        phone_number: userProfile.phone_number || "",
        gender: userProfile.gender || "",
        current_address: userProfile.current_address || "",
        permanent_address: userProfile.permanent_address || "",
        city_town: userProfile.city_town || "",
        state_province: userProfile.state_province || "",
        education_level: userProfile.education_level || "",
        certifications: userProfile.certifications || "",
        skills: userProfile.skills || "",
        languages_spoken: userProfile.languages_spoken || "",
        work_availability: userProfile.work_availability || "",
        work_schedule_preference: userProfile.work_schedule_preference || "",
      });
    }
  }, [loading, userProfile]);

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === "profile_image") {
      setSelectedImage(files[0]);
      setImageError(false);
      return;
    }

    if (['username', 'email', 'first_name', 'last_name'].includes(name)) {
      setProfileData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          [name]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleRemovePicture = () => {
    setSelectedImage(null);
    setProfileData(prev => ({
      ...prev,
      profile_image: null
    }));
    setImageError(true);
  };

  const handleClearAll = () => {
    setProfileData(initialFormState);
    setSelectedImage(null);
    setImageError(true);
    showNotification("All fields cleared", "info");
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Error during logout:", error);
      showNotification("Error during logout", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    
    formData.append('user.email', profileData.user.email);
    formData.append('user.first_name', profileData.user.first_name);
    formData.append('user.last_name', profileData.user.last_name);

    formData.append('phone_number', profileData.phone_number);
    formData.append('gender', profileData.gender);
    formData.append('current_address', profileData.current_address);
    formData.append('permanent_address', profileData.permanent_address);
    formData.append('city_town', profileData.city_town);
    formData.append('state_province', profileData.state_province);
    formData.append('education_level', profileData.education_level);
    formData.append('certifications', profileData.certifications);
    formData.append('skills', profileData.skills);
    formData.append('languages_spoken', profileData.languages_spoken);
    formData.append('work_availability', profileData.work_availability);
    formData.append('work_schedule_preference', profileData.work_schedule_preference);
    
    if (selectedImage) {
      formData.append('profile_image', selectedImage);
    } else if (profileData.profile_image === null) {
      formData.append('profile_image', '');
    }

    try {
      await updateUserProfile(formData);
      await fetchUserProfile();
      setSelectedImage(null);
      showNotification("Profile updated successfully!", "success");
    } catch (error) {
      console.error("Update failed:", error);
      showNotification("Failed to update profile", "error");
    }
  };

  if (loading) {
    return <div className="text-center text-gray-600">Loading...</div>;
  }

  if (!userProfile) {
    return (
      <div className="text-center text-gray-600">
        Please log in to view and update your profile.
      </div>
    );
  }

  const BASE_URL = "http://127.0.0.1:8000";
  const imageUrl = profileData.profile_image && typeof profileData.profile_image === 'string'
    ? profileData.profile_image.startsWith('http://') || profileData.profile_image.startsWith('https://')
      ? profileData.profile_image
      : `${BASE_URL}${profileData.profile_image.startsWith('/') ? '' : '/'}${profileData.profile_image}`
    : null;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-1/6 bg-white shadow-md flex flex-col sticky top-0 h-screen font-['Poppins']">
        <div className="flex items-center justify-center py-4 border-b">
          <img src={logo} alt="LaborSync Logo" className="w-36 h-auto" />
        </div>
        <nav className="flex-grow overflow-y-auto">
          <ul className="flex flex-col py-4">
            {[
              { label: "Dashboard", route: "/menu" },
              { label: "Timesheets", route: "/timesheets" },
              { label: "View Project", route: "/view-project" },
              { label: "View Tasks", route: "/view-task" },
              { label: "Rewards", route: "/worker-rewards" },
              { label: "Worker Details", route: "/user-profile", active: true },
            ].map(({ label, route, active }) => (
              <li
                key={label}
                className={`flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer transition-colors duration-200 ${active ? "bg-gray-100 font-medium" : ""}`}
                onClick={() => navigate(route)}
              >
                {label}
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition duration-200"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto p-6 bg-gray-50 font-['Poppins']">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Public Profile</h2>
          
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4">
              <img
                src={
                  selectedImage
                    ? URL.createObjectURL(selectedImage)
                    : imageUrl && !imageError
                    ? imageUrl
                    : "https://via.placeholder.com/150?text=No+Image"
                }
                alt="Profile"
                className="w-40 h-40 rounded-full object-cover border-4 border-indigo-100"
                onError={() => setImageError(true)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="py-2 px-6 text-base font-medium text-white bg-[#202142] rounded-lg border border-indigo-200 hover:bg-indigo-900 cursor-pointer text-center">
                Change picture
                <input
                  type="file"
                  id="profile_image"
                  name="profile_image"
                  accept="image/*"
                  onChange={handleChange} 
                  className="hidden"
                />
              </label>
              <button
                onClick={handleRemovePicture}
                className="py-2 px-6 text-base font-medium text-gray-700 bg-gray-200 rounded-lg border border-gray-300 hover:bg-gray-300"
              >
                Remove picture
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {['first_name', 'last_name', 'email'].map((field) => (
              <div key={field}>
                <label htmlFor={field} className="block mb-1 font-medium text-indigo-900">
                  {field.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </label>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  id={field}
                  name={field}
                  value={profileData.user[field] || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-indigo-50 border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            ))}

            {[
              "phone_number", "city_town", "state_province", "education_level",
              "certifications", "skills", "languages_spoken", "work_schedule_preference"
            ].map((field) => (
              <div key={field}>
                <label htmlFor={field} className="block mb-1 font-medium text-indigo-900">
                  {field.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </label>
                <input
                  type="text"
                  id={field}
                  name={field}
                  value={profileData[field] || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-indigo-50 border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ))}

            {/* Work Availability Dropdown */}
            <div>
              <label htmlFor="work_availability" className="block mb-1 font-medium text-indigo-900">
                Work Availability
              </label>
              <select
                id="work_availability"
                name="work_availability"
                value={profileData.work_availability || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-indigo-50 border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {workAvailabilityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={handleClearAll}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => {
                  if (userProfile) {
                    setProfileData({
                      user: {
                        email: userProfile.user?.email || "",
                        first_name: userProfile.user?.first_name || "",
                        last_name: userProfile.user?.last_name || "",
                      },
                      profile_image: userProfile.profile_image || null,
                      phone_number: userProfile.phone_number || "",
                      gender: userProfile.gender || "",
                      current_address: userProfile.current_address || "",
                      permanent_address: userProfile.permanent_address || "",
                      city_town: userProfile.city_town || "",
                      state_province: userProfile.state_province || "",
                      education_level: userProfile.education_level || "",
                      certifications: userProfile.certifications || "",
                      skills: userProfile.skills || "",
                      languages_spoken: userProfile.languages_spoken || "",
                      work_availability: userProfile.work_availability || "",
                      work_schedule_preference: userProfile.work_schedule_preference || "",
                    });
                    setSelectedImage(null);
                  }
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </main>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={handleCloseNotification}
        />
      )}
    </div>
  );
};

export default UserProfilePage;