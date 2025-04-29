import axios from "axios";

const BASE_URL = 'http://127.0.0.1:8000/api/';
const LOGIN_URL = `${BASE_URL}token/`;
const REFRESH_URL = `${BASE_URL}token/refresh/`;
const LOGOUT_URL = `${BASE_URL}logout/`;
const AUTH_URL = `${BASE_URL}authenticated/`;
const REGISTER_URL = `${BASE_URL}register/`;
const CLOCK_IN_URL = `${BASE_URL}clock_in/`;
const CHECK_ACTIVE_CLOCK_URL = `${BASE_URL}check_active_clock/`;
const CLOCK_OUT_URL = `${BASE_URL}clock_out/`;
const USER_PROFILE_URL = `${BASE_URL}user/profile/`;
const ASSIGN_TASK_URL = `${BASE_URL}assign/task/`;
const GET_TASKS_URL = `${BASE_URL}view/tasks/`;
const LOGIN_URL_MANAGER = `${BASE_URL}login/manager/`;      
const REGISTER_URL_MANAGER = `${BASE_URL}register/manager/`;
const FORGOT_PASSWORD_URL = `${BASE_URL}forgot_password/`; 
const RESET_PASSWORD_URL = `${BASE_URL}reset_password_confirm/`;  
const MANAGER_PROFILE_URL = `${BASE_URL}manager-profile/`;
const MANAGER_DASHBOARD_URL = `${BASE_URL}manager-dashboard/`;
const USER_DASHBOARD_URL = `${BASE_URL}user-dashboard/`;
const USER_ROLE_URL = `${BASE_URL}user-role/`;
const WORKERS_URL = `${BASE_URL}workers/`;
const ADD_WORKERS_URL = `${BASE_URL}workers/add/`;
const CLOCK_HISTORY_URL = `${BASE_URL}clock-history/`;
const GET_PROJECTS_URL = `${BASE_URL}projects/`;
const CREATE_PROJECT_URL = `${BASE_URL}projects/create/`;
const GET_PROJECT_WORKERS_URL = `${BASE_URL}projects/`;
const UPDATE_PROJECT_URL = `${BASE_URL}projects/`;
const DELETE_PROJECT_URL = `${BASE_URL}projects/`;
const MANAGER_TASKS_URL = `${BASE_URL}view/manager-tasks/`;
const GET_MANAGER_TASKS_URL = `${BASE_URL}view/tasks/`;
const GET_PROJECT_STATS_URL = `${BASE_URL}worker/productivity/stats/`;
const UPDATE_TASKS_URL = `${BASE_URL}tasks/<int:task_id>/`;
const DELETE_TASK_URL = `${BASE_URL}tasks/<int:task_id>/delete/`;
const COMPLETE_TASK_URL = `${BASE_URL}tasks/`;  // Just the base path
const AWARD_POINTS_URL = `${BASE_URL}points/award/`;
const USER_POINTS_URL = `${BASE_URL}points/`;
const CREATE_REWARDS_URL = `${BASE_URL}rewards/create/`;
const GET_REWARDS_DETAILS = `${BASE_URL}rewards/`;
const REDEEM_REWARD_URL = `${BASE_URL}points/redeem/`;
const WORKER_POINTS_HISTORY = `${BASE_URL}worker/points`
const MANAGER_POINTS_HISTORY = `${BASE_URL}manager/points`
const MANGER_REWARD_VIEW_URL = `${BASE_URL}manager/rewards/`;
const UPDATE_REWARD_URL = `${BASE_URL}rewards/update/`;
const DELETE_REWARD_URL = `${BASE_URL}rewards/delete/`;


export const login = async (username, password) => {
    try {
        const response = await axios.post(LOGIN_URL, { username, password }, { withCredentials: true });
        return response.data.success;
    } catch (error) {
        console.error("Error logging in:", error);
        return false;
    }
};


export const refreshToken = async () => {
    try {
        await axios.post(REFRESH_URL, {}, { withCredentials: true });
        return true;
    } catch (error) {
        console.error("Error refreshing token:", error);
        return false;
    }
};

const callRefresh = async (error, func) => {
    if (error.response && error.response.status === 401) {
        const tokenRefreshed = await refreshToken();
        if (tokenRefreshed) {
            const retryResponse = await func();
            return retryResponse.data;
        }
    }
    throw error;
};






export const createProject = async (projectData) => {
    try {
        const response = await axios.post(CREATE_PROJECT_URL, projectData, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error creating project:", error);
        return null;
    }
};

export const getProjectWorkers = async (projectId) => {
    try {
        const response = await axios.get(`${GET_PROJECT_WORKERS_URL}${projectId}/workers/`, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error fetching project workers:", error);
        return [];
    }
};





export const getProjects = async (username) => {
    try {
        console.log(`Fetching projects for ${username}...`);
        const response = await axios.get(`${GET_PROJECTS_URL}?username=${username}`, { 
            withCredentials: true 
        });

        console.log("Fetched projects:", response.data);
        return response.data.projects || [];
    } catch (error) {
        console.error("Error fetching projects:", error.response?.data || error.message);
        return [];
    }
};




export const deleteProject = async (projectId) => {
    try {
        const response = await axios.delete(
            `${BASE_URL}projects/${projectId}/delete/`,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error("Error deleting project:", error);
        throw error;
    }
};

export const getManagerTasks = async () => {
    try {
        const response = await axios.get(MANAGER_TASKS_URL, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error fetching manager tasks:", error.response?.data || error.message);
        throw error;
    }
}

export const workersPoints = async () => {
    try {
        const response = await axios.get(WORKER_POINTS_HISTORY, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error fetching workers points:", error);
        throw error;
    }
}

export const updateTask = async (taskId, taskData) => {
    try {
        const response = await axios.put(
            `${BASE_URL}tasks/${taskId}/`,
            taskData,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating task:", error);
        throw error;
    }
};

export const deleteTask = async (taskId) => {
    try {
        const response = await axios.delete(
            `${BASE_URL}tasks/${taskId}/delete/`,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error("Error deleting task:", error);
        throw error;
    }
};




export const getUserRole = async () => {
    try {
        const response = await axios.get(USER_ROLE_URL, { withCredentials: true });
        return response.data.role; // Returns 'manager' or 'user'
    } catch (error) {
        console.error("Error fetching user role:", error);
        return callRefresh(error, () => axios.get(USER_ROLE_URL, { withCredentials: true }));
    }
};




export const addWorkers = async (workerData) => {
    try {
        const response = await axios.post(ADD_WORKERS_URL, workerData, { withCredentials: true });
        return response.data; // Returns success message or error

    } catch (error) {
        console.error("Error adding workers:", error);
        return callRefresh(error, () => axios.post(ADD_WORKERS_URL, workerData, { withCredentials: true }));
    }
};

export const getWorkers = async () => {
    try {
        const response = await axios.get(WORKERS_URL, { withCredentials: true });
        return response.data; // Returns the list of workers
    } catch (error) {
        console.error("Error fetching workers:", error);
        return callRefresh(error, () => axios.get(WORKERS_URL, { withCredentials: true }));
    }
};

// Function to get clock-in/clock-out history
export const getClockHistory = async () => {
    try {
        const response = await axios.get(CLOCK_HISTORY_URL, { withCredentials: true });
        return response.data; // Returns clock-in/clock-out history
    } catch (error) {
        console.error("Error fetching clock history:", error);
        return callRefresh(error, () => axios.get(CLOCK_HISTORY_URL, { withCredentials: true }));
    }
};

export const getManagerDashboard = async () => {
    try {
        const response = await axios.get(MANAGER_DASHBOARD_URL, { withCredentials: true });
        return response.data; // Returns manager dashboard data
    } catch (error) {
        console.error("Error fetching manager dashboard:", error);
        return callRefresh(error, () => axios.get(MANAGER_DASHBOARD_URL, { withCredentials: true }));
    }
};

export const getUserDashboard = async () => {
    try {
        const response = await axios.get(USER_DASHBOARD_URL, { withCredentials: true });
        return response.data; // Returns user dashboard data
    } catch (error) {
        console.error("Error fetching user dashboard:", error);
        return callRefresh(error, () => axios.get(USER_DASHBOARD_URL, { withCredentials: true }));
    }
};

export const logout = async () => {
    try {
        await axios.post(LOGOUT_URL, {}, { withCredentials: true });
        return true;
    } catch (error) {
        console.error("Error logging out:", error);
        return false;
    }
};

export const isAuthenticated = async () => {
    try {
        await axios.post(AUTH_URL, {}, { withCredentials: true });
        return true;
    } catch (error) {
        console.error("Error checking authentication:", error);
        return false;
    }
};

export const register = async (username, email, password, first_name, last_name) => {
    try {
        const response = await axios.post(REGISTER_URL, 
            { username, email, password, first_name, last_name },
            { withCredentials: true }
        );
        return response.data; 
    } catch (error) {
        console.error("Error registering user:", error);
        return null;
    }
};


export const forgotPassword = async (email) => {
    try {
        const response = await axios.post(FORGOT_PASSWORD_URL, { email }, { withCredentials: true });
        return response.data; // Returns success message or error
    } catch (error) {
        console.error("Error requesting password reset:", error);
        return { success: false, message: error.response?.data?.message || "An error occurred." };
    }
};

// New function: Confirm password reset
export const resetPasswordConfirm = async (uidb64, token, newPassword, confirmPassword) => {
    try {
        const response = await axios.post(
            `${RESET_PASSWORD_URL}${uidb64}/${token}/`, // Append uidb64 and token to the URL
            { new_password: newPassword, confirm_password: confirmPassword },
            { withCredentials: true }
        );
        return response.data; // Returns success message or error
    } catch (error) {
        console.error("Error resetting password:", error);
        return { success: false, message: error.response?.data?.message || "An error occurred." };
    }
};

//register manager

export const registerManager = async (username, email, password, first_name, last_name, company_name,work_location ) => {
    try {
        const response = await axios.post(REGISTER_URL_MANAGER, 
            { username, email, password, first_name, last_name, company_name, work_location },
            { withCredentials: true }
        );
        return response.data; 
    } catch (error) {
        console.error("Error registering Manager:", error);
        return null;
    }


};

export const loginManager = async (username, password) => { 
    try {
        const response = await axios.post(LOGIN_URL_MANAGER, { username, password }, { withCredentials: true });    
        return response.data.success;
    }   catch (error) {
        console.error("Error logging in:", error);
        return false;
    }

};


export const getUserProfile = async () => {
    try {
        const response = await axios.get(USER_PROFILE_URL, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return callRefresh(error, () => axios.get(USER_PROFILE_URL, { withCredentials: true }));
    }
};

export const updateUserProfile = async (formData) => {
    try {
        const response = await axios.put(USER_PROFILE_URL, formData, {
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error updating user profile:", error);
        return callRefresh(error, () => axios.put(USER_PROFILE_URL, formData, {
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }));
    }
};


export const getManagerProfile = async () => {
    try {
        const response = await axios.get(MANAGER_PROFILE_URL, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error fetching manager profile:", error);
        return callRefresh(error, () => axios.get(MANAGER_PROFILE_URL, { withCredentials: true }));
    }
};

export const updateManagerProfile = async (profileData) => {
    try {
        const dataToUpdate = {
            user: {
                username: profileData.user.username,
                email: profileData.user.email,
                first_name: profileData.user.first_name,
                last_name: profileData.user.last_name,
            },
            company_name: profileData.company_name,
            work_location: profileData.work_location,
        };

        const response = await axios.put(MANAGER_PROFILE_URL, dataToUpdate, { withCredentials: true });

        return response.data;
    } catch (error) {
        console.error("Error updating manager profile:", error);
        return callRefresh(error, () => axios.put(MANAGER_PROFILE_URL, dataToUpdate, { withCredentials: true }));
    }
};

export const clockIn = async (taskId) => {
    try {
        const response = await axios.post(CLOCK_IN_URL, { task_id: taskId }, { withCredentials: true });
        console.log('Clocked in:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error clocking in:', error);
        return callRefresh(error, () => axios.post(CLOCK_IN_URL, { task_id: taskId }, { withCredentials: true }));
    }
};

export const checkActiveClock = async () => {
    try {
        const response = await axios.get(CHECK_ACTIVE_CLOCK_URL, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error('Error checking active clock:', error);
        return callRefresh(error, () => axios.get(CHECK_ACTIVE_CLOCK_URL, { withCredentials: true }));
    }   
}

export const clockOut = async (taskId) => {
    try {
        const response = await axios.post(CLOCK_OUT_URL, { task_id: taskId }, { withCredentials: true });
        console.log('Clocked out:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error clocking out:', error);
        return callRefresh(error, () => axios.post(CLOCK_OUT_URL, { task_id: taskId }, { withCredentials: true }));
    }
};


export const updateProject = async (projectId, projectData) => {
    try {
        const response = await axios.put(
            `${UPDATE_PROJECT_URL}${projectId}/update/`,
            projectData,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating project:", error);
        if (error.response) {
            // The request was made and the server responded with a status code
            console.error("Server response:", error.response.data);
            console.error("Server status:", error.response.status);
        } else if (error.request) {
            // The request was made but no response was received
            console.error("No response received:", error.request);
        } else {
            // Something happened in setting up the request
            console.error("Error message:", error.message);
        }
        throw error;
    }
};



export const assignTask = async (taskData) => {
    try {
        const response = await axios.post(ASSIGN_TASK_URL, taskData, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error assigning task:", error.response?.data || error.message);
        
        // Handle 403 Forbidden (not a manager)
        if (error.response?.status === 403) {
            throw new Error("Only managers can assign tasks");
        }
        
        // Try token refresh if unauthorized
        if (error.response?.status === 401) {
            return callRefresh(error, () => axios.post(ASSIGN_TASK_URL, taskData, { withCredentials: true }));
        }
        
        throw error;
    }
};
export const getUserTasks = async (isManager = false) => {
    try {
        const url = isManager ? GET_MANAGER_TASKS_URL : GET_TASKS_URL;
        const response = await axios.get(url, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error fetching tasks:", error.response?.data || error.message);
        
        // Handle 403 Forbidden (not a manager)
        if (error.response?.status === 403 && isManager) {
            throw new Error("Manager access required");
        }
        
        // Try token refresh if unauthorized
        if (error.response?.status === 401) {
            return callRefresh(error, () => axios.get(
                isManager ? GET_MANAGER_TASKS_URL : GET_TASKS_URL, 
                { withCredentials: true }
            ));
        }
        
        return [];
    }
};
// export const getManagerTasks = async () => {
//     try {
//         const response = await axios.get(GET_MANAGER_TASKS_URL, { withCredentials: true });
//         return response.data;
//     } catch (error) {
//         console.error("Error fetching manager tasks:", error.response?.data || error.message);
        
//         // Handle 403 Forbidden (not a manager) specifically
//         if (error.response?.status === 403) {
//             throw new Error("You don't have manager privileges");
//         }
        
//         // Try token refresh if unauthorized
//         if (error.response?.status === 401) {
//             return callRefresh(error, () => axios.get(GET_MANAGER_TASKS_URL, { withCredentials: true }));
//         }
        
//         return [];
//     }
// };



export const getProjectStats = async () => {
    try {
        const response = await axios.get(GET_PROJECT_STATS_URL, { 
            withCredentials: true 
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching project stats:", error.response?.data || error.message);
        
        // Handle 403 Forbidden (not a manager) specifically
        if (error.response?.status === 403) {
            throw new Error("You don't have manager privileges");
        }
        
        // Try token refresh if unauthorized
        if (error.response?.status === 401) {
            return callRefresh(error, () => axios.get(GET_PROJECT_STATS_URL, { withCredentials: true }));
        }
        
        return [];
    }
};

export const completeTask = async (taskId) => {
    try {
        const response = await axios.post(
            `${COMPLETE_TASK_URL}${taskId}/complete/`,
            {},
            { withCredentials: true }
        );
        
        // Ensure the response has success=true if the task was completed
        return { 
            success: true, 
            message: "Task completed successfully",
            data: response.data 
        };
    } catch (error) {
        console.error("Error completing task:", error);
        // Return a structured error response instead of throwing
        return { 
            success: false, 
            message: error.response?.data?.message || "Failed to complete task" 
        };
    }
}

export const awardPoints = async (data) => {
    try {
        const response = await axios.post(
            `${AWARD_POINTS_URL}`, // Update this URL if needed
            data,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error("Error awarding points:", error);
        throw error;
    }
};

export const getUserPoints = async () => {
    try {
        const response = await axios.get(USER_POINTS_URL, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error fetching user points:", error);
        throw error;
    }
};


export const getManagerPoints = async () => {
    try {
        const response = await axios.get(MANAGER_POINTS_HISTORY, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error fetching manager points:", error);
        throw error;
    }
}

export const createRewards = async (rewardData) => {
    try {
        const response = await axios.post(CREATE_REWARDS_URL, rewardData, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error creating rewards:", error);
        throw error;
    }
};

export const getRewardsDetails = async () => {
    try {
        const response = await axios.get(GET_REWARDS_DETAILS, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error fetching rewards details:", error);
        throw error;
    }
};

export const redeemReward = async (rewardName) => {
    try {
        const response = await axios.post(
            REDEEM_REWARD_URL, 
            { reward_name: rewardName },  // Changed to match API expectation
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error("Error redeeming reward:", error);
        throw error;
    }
};

export const getManagerRewards = async () => {
    try {
        const response = await axios.get(MANGER_REWARD_VIEW_URL, { 
            withCredentials: true,
          
        });
        
        // Ensure consistent response structure
        return {
            data: {
                count: response.data?.count || 0,
                rewards: response.data?.rewards || []
            }
        };
    } catch (error) {
        console.error("Error fetching manager reward view:", error);
        // Return consistent structure even on error
        return {
            data: {
                count: 0,
                rewards: [],
                error: error.response?.data?.error || 'Failed to fetch rewards'
            }
        };
    }
};



export const updateReward = async (rewardId, updatedData) => {
    try {
        const response = await axios.put(
            `${UPDATE_REWARD_URL}${rewardId}/`,
            updatedData,
            { 
                withCredentials: true,
               
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating reward:", error);
        throw error;
    }
};



export const deleteReward = async (rewardId) => {
    try {
        const response = await axios.delete(`${DELETE_REWARD_URL}${rewardId}/`, { 
            withCredentials: true 
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting reward:", error);
        throw error;
    }
};