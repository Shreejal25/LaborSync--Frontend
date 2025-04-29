import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback 
} from "react";
import { 
  
  login, 
  register, 
  getUserProfile, 
  updateUserProfile,
  assignTask,
  getUserTasks,
  registerManager,
  loginManager,
  getManagerProfile,
  updateManagerProfile,
  getClockHistory,
  getWorkers,
  getUserRole,
  createProject,
  getProjectWorkers,
  getProjects
} from "../endpoints/api"; // Import additional info function
import { useNavigate } from "react-router-dom";
import Notification from "../routes/Components/Notification";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    return storedAuth === "true";
  });
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null); // State for user profile
  const [managerProfile, setManagerProfile] = useState(null); // State for manager profile
  const [userTasks, setUserTasks] = useState([]); // State for user tasks
  const [clockHistory, setClockHistory] = useState([]); // State for clock history
  const [workers, setWorkers] = useState([]); // State for workers
  const [userRole, setUserRole] = useState(null); // State for storing user role
  const [projects, setProjects] = useState([]); // State for storing projects
  const [notification, setNotification] = useState({
    message: "",
    show: false, });

  const navigate = useNavigate(); // Initialize navigate


  // Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    try {
      const profile = await getUserProfile();
      setUserProfile(profile);
      return profile; // Add this line to return fetched profile
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null; // Return null on error for safety
    }
  }, []);
  

  const getAuthenticated = useCallback(async () => {
    try {
      const storedAuth = localStorage.getItem("isAuthenticated");
      const success = storedAuth === "true";
      setIsAuthenticated(success);
      if (success) {
        await fetchUserProfile(); // Fetch user profile if authenticated
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile]);
  

  useEffect(() => {
    getAuthenticated(); // Call getAuthenticated when the component mounts
  }, [getAuthenticated]);


  const loginUser = async (username, password) => {
    try {
        const success = await login(username, password);
        if (success) {
            localStorage.setItem("isAuthenticated", "true");
            setIsAuthenticated(true);
            const profile = await fetchUserProfile();

            if (profile && profile.groups && profile.groups.includes("manager")) {
                setUserRole("manager"); // Set userRole to "manager" in context
                navigate("/manager-dashboard");
            } else {
                setUserRole("user"); // Set userRole to "user" in context
                navigate("/menu");
            }

            setNotification({
                message: "Login successful!",
                show: true,
                type: "success",
            });
        } else {
            setIsAuthenticated(false);
            localStorage.removeItem("isAuthenticated");
            setNotification({
                message: "Invalid username or password",
                show: true,
                type: "error",
            });
            navigate('/login');
        }
    } catch (error) {
        console.error("Login failed:", error);
        setIsAuthenticated(false);
        localStorage.removeItem("isAuthenticated");
        setNotification({
            message: "Login failed. Please try again.",
            show: true,
            type: "error",
        });
        navigate('/login');
    }
};






  
  
  


  
  
  


  // Register user with personal information
  const registerUser = async (username, email, password, cPassword, first_name, last_name) => {
    if (password === cPassword) {
      try {
        await register(username, email, password, first_name, last_name);
        // Return success response without navigating immediately
        return { success: true, message: "Successfully registered user" };
      } catch (error) {
        console.error("Registration failed:", error);
        // Return error response
        return { success: false, message: error.response?.data?.message || "Error registering user. Please try again." };
      }
    } else {
      // Return password mismatch error
      return { success: false, message: "Passwords don't match" };
    }
  };
 



  // Register manager with personal information    
const registerNewManager = async (username, email, password, cPassword, first_name, last_name, company_name, work_location) => {
  if (password === cPassword) { // Add any necessary validation here
    try {
      await registerManager(username, email, password, first_name, last_name, company_name, work_location);
      
      // Return success response without navigating immediately
      return { 
        success: true, 
        message: `Manager ${first_name} ${last_name} has been successfully registered` 
      };
    } catch (error) {
      console.error("Registration failed:", error);
      // Return error response
      return { 
        success: false, 
        message: error.response?.data?.message || "Error registering manager. Please try again." 
      };
    }
  } else {
    // Return password mismatch error
    return { 
      success: false, 
      message: "Passwords don't match" 
    };
  }
};

   // Login manager and update authentication state
   const loginManagerUser = async (username, password) => {
     try {
       const success = await loginManager(username, password);
       if (success) {
         setIsAuthenticated(true);
         await fetchUserProfile(); // Fetch user profile on successful login
         localStorage.setItem("isAuthenticated", "true"); // Store auth state
         navigate('/'); // Redirect to home page on successful login
       } else {
         setIsAuthenticated(false);
         alert("Invalid username or password");
       }
     } catch (error) {
       console.error("Login failed:", error);
       setIsAuthenticated(false)
       localStorage.removeItem("isAuthenticated"); // Remove auth state;
       alert("Login failed. Please try again.");
     }
   };

   

   // Update user profile
   // In your useAuth.js context
const updateProfile = async (profileData) => {
  try {
    const updatedProfile = await updateUserProfile(profileData); // Call the API function
    setUserProfile(updatedProfile); // Now you can use setUserProfile
    return updatedProfile; // Return the updated profile data
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error; // Re-throw the error
  }
};
   // Fetch Manager profile
  const fetchManagerProfile = useCallback(async () => {
    try {
      const profile = await getManagerProfile();
      setManagerProfile(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }, []);

  // Fetch workers
const fetchWorkers = useCallback(async () => {
  try {
    const workersData = await getWorkers(); // API call to get workers
    setWorkers(workersData); // Update state with fetched workers
  } catch (error) {
    console.error("Error fetching workers:", error);
  }
}, []);

// Fetch clock history
const fetchClockHistory = useCallback(async () => {
  try {
    const clockHistoryData = await getClockHistory(); // API call to get clock history
    setClockHistory(clockHistoryData); // Update state with fetched clock history
  } catch (error) {
    console.error("Error fetching clock history:", error);
  }
}, []);

const fetchUserRole = useCallback(async () => {
  try {
    const role = await getUserRole(); // Call the API function to get the user's role
    setUserRole(role); // Set the role in the state
  } catch (error) {
    console.error("Error fetching user role:", error);
  }
}, []);



// Create a new project

const createNewProject = async (projectData) => {
  try {
    const result = await createProject(projectData);
    if (result) {
      setNotification({ 
        message: "Project created successfully!", 
        show: true,
        type: "success"  // Add this
      });
      return result;
    } else {
      setNotification({ 
        message: "Failed to create project.", 
        show: true,
        type: "error"  // Add this
      });
      return null;
    }
  } catch (error) {
    console.error("Error creating project:", error);
    setNotification({
      message: "Error creating project. Please try again.",
      show: true,
      type: "error"  // Add this
    });
    return null;
  }
};
const fetchProjects = useCallback(async () => {
  try {
    const projectList = await getProjects(); // API call to fetch projects
    setProjects(projectList); // Update state with fetched projects
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
}, []);

const fetchProjectWorkers = async (projectId) => {
  try {
      const response = await getProjectWorkers(projectId);
      return Array.isArray(response) ? response : [];
  } catch (error) {
      console.error('Error fetching project workers:', error);
      return [];
  }
};



// Update manager profile
    // AuthContext.js
const updateManagerProfileData= async (profileData) => {
  try {
    const updatedProfile = await updateManagerProfile(profileData); // Call the API function
    setManagerProfile(updatedProfile); // Now you can use setManagerProfile
    return updatedProfile; // Return the updated profile data
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error; // Re-throw the error
  }
};

   // Assign a task to a user by username
   const assignTaskToUser = async (taskData) => {
    try {
      const result = await assignTask(taskData);
      if (result) {
        setNotification({ message: "Task assigned successfully!", show: true });
        return result;
      } else {
        setNotification({ message: "Failed to assign task.", show: true });
      }
    } catch (error) {
      console.error("Error assigning task:", error);
      setNotification({
        message: "Error assigning task. Please try again.",
        show: true,
      });
    }
  };

  const closeNotification = () => {
    setNotification({ ...notification, show: false });
  };

   const fetchUserTasks = useCallback(async () => {
     try {
       const tasks = await getUserTasks(); // Call the API function to get tasks
       setUserTasks(tasks); // Update state with fetched tasks
     } catch (error) {
       console.error("Error fetching user tasks:", error);
     }
   }, []);


  

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserTasks();
      fetchUserRole();
      fetchUserProfile();
      fetchProjects();
    }
  }, [isAuthenticated, fetchUserTasks]);
   return (
     <AuthContext.Provider value={{ 
       isAuthenticated,
       loading,
       loginUser,
       registerUser,
       registerNewManager,
       loginManagerUser,
       userRole,
       userProfile,
       managerProfile,
       fetchUserProfile,
       fetchManagerProfile,
       updateManagerProfileData,
       updateProfile,
       assignTaskToUser,
       userTasks,
       fetchUserTasks,
       fetchClockHistory,
       fetchWorkers,
       clockHistory,
       workers,
       notification,
       setNotification,
       createNewProject,
       fetchProjectWorkers,
       getProjectWorkers,
       getProjects,
       projects,
       fetchProjects
     }}>
       {notification.show && (
    <Notification message={notification.message} onClose={closeNotification} type={notification.type} />
      )}
       {children}
     </AuthContext.Provider>
   );
};

export const useAuth = () => useContext(AuthContext);
