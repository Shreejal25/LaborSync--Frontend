import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { logout, getManagerDashboard, getWorkers, getClockHistory, getProjects, addWorkers, getManagerTasks } from '../../endpoints/api';
import logo from '../../assets/images/LaborSynclogo.png';
import Notification from "../Components/Notification";

const ManagerDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [clockHistory, setClockHistory] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [workerEmail, setWorkerEmail] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [showAddWorkerPopup, setShowAddWorkerPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const popupRef = useRef(null);
  const buttonRef = useRef(null);

  const navigate = useNavigate();
  const { managerProfile, fetchManagerProfile } = useAuth();

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowAddWorkerPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await fetchManagerProfile();
      } catch (error) {
        console.error("Error fetching manager profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [fetchManagerProfile]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardData, workersData, historyData, projectsData, tasksData] = await Promise.all([
          getManagerDashboard(),
          getWorkers(),
          getClockHistory(),
          getProjects(),
          getManagerTasks() // Use getManagerTasks instead of getUserTasks
        ]);
        setTasks(dashboardData.recent_tasks); // Revert to old logic for Recent Project and Tasks
        setWorkers(workersData);
        setClockHistory(historyData);
        setProjects(projectsData);
        setAllTasks(tasksData);

        // Debugging: Log data to inspect structure
        console.log("Clock History:", historyData);
        console.log("All Tasks (from getManagerTasks):", tasksData);
        console.log("Dashboard Data Recent Tasks:", dashboardData.recent_tasks);
        console.log("Projects:", projectsData);
        if (tasksData.length === 0) {
          console.warn("No tasks returned from getManagerTasks. Check endpoint or manager's projects.");
        }
        if (dashboardData.recent_tasks.length === 0) {
          console.warn("No tasks returned in dashboardData.recent_tasks. Check getManagerDashboard endpoint.");
        }
        tasksData.forEach(task => {
          if (!projects.find(p => p.id === task.project)) {
            console.warn(`No project found for task ID ${task.id} with project ID ${task.project}`);
          }
        });
      } catch (error) {
        console.error("Error fetching manager dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  // Calculate attendance report
  const attendanceReport = useMemo(() => {
    return clockHistory.map(record => {
      const clockIn = new Date(record.clock_in);
      const clockOut = record.clock_out ? new Date(record.clock_out) : null;
      const totalHours = clockOut ? ((clockOut - clockIn) / (1000 * 60 * 60)).toFixed(2) : 'Pending';
      
      // Debugging: Log if task object is missing
      if (!record.task) {
        console.warn(`No task object in record:`, record);
      }

      return {
        id: record.id || record.username + record.clock_in, // Fallback ID
        username: record.username,
        date: clockIn.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        clockIn: formatDateTime(record.clock_in),
        clockOut: record.clock_out ? formatDateTime(record.clock_out) : 'Pending',
        totalHours: totalHours,
        taskTitle: record.task?.task_title || 'N/A',
        shift: record.task?.assigned_shift || record.assigned_shift || 'N/A',
        status: record.clock_out ? 'Completed' : 'Active'
      };
    });
  }, [clockHistory]);

  const handleLogout = async () => {
    try {
      const success = await logout();
      if (success) navigate('/login-manager');
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleAddWorker = async (e) => {
    e.preventDefault();
    if (!workerEmail.trim()) {
      setNotification({
        show: true,
        message: "Please enter a valid email address",
        type: "error"
      });
      return;
    }
  
    setIsSubmitting(true);
    try {
      await addWorkers({ email: workerEmail });
      setNotification({
        show: true,
        message: "Invitation sent successfully!",
        type: "success"
      });
      setWorkerEmail("");
      setShowAddWorkerPopup(false);
      const workersData = await getWorkers();
      setWorkers(workersData);
    } catch (error) {
      setNotification({
        show: true,
        message: error.response?.data?.message || "Failed to send invitation",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen font-['Poppins']">Loading...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 font-['Poppins']">
        {/* Sidebar */}
                                     <div className="w-full md:w-1/6 bg-white shadow-md flex flex-col font-['Poppins']">
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
     

      {/* Main Content Area */}
      <div className="flex-grow p-4 md:p-8 overflow-y-auto">
        {/* Welcome Banner */}
        <div className="bg-[#F4F4F9] p-4 md:p-6 rounded shadow-md mb-6">
          <h1 className="text-xl md:text-2xl font-bold mb-2 text-gray-800">
            Hello {managerProfile?.user.first_name || "Manager"},👋 Welcome,
          </h1>
          <p className="text-base md:text-lg text-gray-600">Manage your team and tasks from here</p>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white p-4 md:p-6 rounded shadow-md mb-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Recent Project and Tasks</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Project Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Task Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Assigned Workers</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Created</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Updated</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {projects.find(p => p.id === task.project)?.name || 'No Project'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{task.task_title}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {projects.find(p => p.id === task.project)?.workers?.join(', ') || 'Not Assigned'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatDateTime(projects.find(p => p.id === task.project)?.created_at)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatDateTime(projects.find(p => p.id === task.project)?.updated_at)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`h-3 w-3 rounded-full ${
                            task.status === 'pending' ? 'bg-red-500' :
                            task.status === 'in_progress' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}></span>
                          <span>{task.status.replace('_', ' ').toUpperCase()}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-3 text-sm text-gray-500 text-center">No tasks available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Worker Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 relative">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Workers Information</h2>
            </div>
            <button
              ref={buttonRef}
              onClick={() => setShowAddWorkerPopup(!showAddWorkerPopup)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-150"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <span>Add Worker</span>
            </button>
          </div>

          {/* Add Worker Popup */}
          {showAddWorkerPopup && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30 backdrop-blur-sm">
              <div
                ref={popupRef}
                className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 p-6 mx-4"
              >
                <div className="flex items-start mb-6">
                  <div className="mr-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Invite Workers</h3>
                    <p className="text-sm text-gray-500 mt-1">Send an invitation to join your team</p>
                  </div>
                </div>
                
                <form onSubmit={handleAddWorker} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={workerEmail}
                      onChange={(e) => setWorkerEmail(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="worker@gmail.com"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddWorkerPopup(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center min-w-[100px]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        'Send Invite'
                      )}
                    </button>
                  </div>
                </form>

                {/* Footer Note with Hero Icon */}
                <div className="mt-6 pt-5 border-t border-gray-100 flex items-start">
                  <svg className="flex-shrink-0 w-5 h-5 text-gray-400 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p className="text-xs text-gray-500">
                    The worker will receive an email with registration instructions. They'll need to register using this email address.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-max divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workers.length > 0 ? (
                  workers.map((worker) => (
                    <tr key={worker.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{worker.user.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{worker.user.first_name} {worker.user.last_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{worker.user.email}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                      No team members yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance Report */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
          <h2 className="text-lg md:text-xl font-medium text-gray-800 font-['Poppins'] mb-4 md:mb-6">Attendance Report</h2>
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <div className="overflow-x-auto">
              <div className="relative">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-200 sticky top-0 z-10">
                      <tr>
                        <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-900 uppercase tracking-wider font-['Poppins']">Employee</th>
                        <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-900 uppercase tracking-wider font-['Poppins']">Date</th>
                        <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-900 uppercase tracking-wider font-['Poppins']">Clock-in</th>
                        <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-900 uppercase tracking-wider font-['Poppins']">Clock-out</th>
                        <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-900 uppercase tracking-wider font-['Poppins']">Total Hours</th>
                        <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-900 uppercase tracking-wider font-['Poppins']">Task</th>
                        <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-900 uppercase tracking-wider font-['Poppins']">Shift</th>
                        <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-900 uppercase tracking-wider font-['Poppins']">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceReport.length > 0 ? (
                        attendanceReport.map((record) => (
                          <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 md:px-6 py-3 whitespace-nowrap">
                              <div className="text-xs md:text-sm font-medium text-gray-900 font-['Poppins']">{record.username}</div>
                            </td>
                            <td className="px-3 md:px-6 py-3 whitespace-nowrap">
                              <div className="text-xs md:text-sm text-gray-900 font-['Poppins']">{record.date}</div>
                            </td>
                            <td className="px-3 md:px-6 py-3 whitespace-nowrap">
                              <div className="text-xs md:text-sm text-gray-900 font-['Poppins']">{record.clockIn}</div>
                            </td>
                            <td className="px-3 md:px-6 py-3 whitespace-nowrap">
                              <div className={`text-xs md:text-sm font-['Poppins'] ${record.clockOut === 'Pending' ? 'text-amber-500' : 'text-gray-900'}`}>
                                {record.clockOut}
                              </div>
                            </td>
                            <td className="px-3 md:px-6 py-3 whitespace-nowrap">
                              <div className={`text-xs md:text-sm font-['Poppins'] ${record.totalHours === 'Pending' ? 'text-amber-500' : 'text-gray-900'}`}>
                                {record.totalHours === 'Pending' ? 'Pending' : `${record.totalHours} hrs`}
                              </div>
                            </td>
                            <td className="px-3 md:px-6 py-3 whitespace-nowrap">
                              <div className="text-xs md:text-sm text-gray-900 font-['Poppins']">{record.taskTitle}</div>
                            </td>
                            <td className="px-3 md:px-6 py-3 whitespace-nowrap">
                              <div className="text-xs md:text-sm text-gray-900 font-['Poppins']">{record.shift}</div>
                            </td>
                            <td className="px-3 md:px-6 py-3 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full font-['Poppins']
                                ${record.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                {record.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="px-3 md:px-6 py-3 text-center text-xs md:text-sm text-gray-500 font-['Poppins']">
                            No attendance records available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}
    </div>
  );
};

export default ManagerDashboard;