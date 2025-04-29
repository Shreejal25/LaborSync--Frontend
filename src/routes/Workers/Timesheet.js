import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from "../../context/useAuth";
import { getClockHistory, getUserTasks,logout } from '../../endpoints/api';
import logo from '../../assets/images/LaborSynclogo.png';

const Timesheet = () => {
  const [clockHistory, setClockHistory] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { userProfile, isAuthenticated, fetchUserProfile } = useAuth();

  // Helper function to format date and time
  const formatDateTime = (isoString) => {
    if (!isoString) return 'Invalid Date';
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

  // Effect for initial data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchUserProfile();
        const [history, userTasks] = await Promise.all([
          getClockHistory(),
          getUserTasks()
        ]);
        setClockHistory(history);
        setTasks(userTasks);

        // Debugging: Log data to inspect structure
        console.log("Clock History:", history);
        console.log("User Tasks:", userTasks);
      } catch (error) {
        console.error("Error fetching timesheet data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchUserProfile]);

   const handleLogout = async () => {
       try {
          await logout();
          navigate('/login');
       } catch (error) {
          console.error("Error during logout:", error);
          showNotification("Error during logout", "error");
       }
     };

  // Effect for authentication check
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate('/menu');
    }
  }, [isAuthenticated, navigate, loading]);

  // Calculate attendance report
  const attendanceReport = useMemo(() => {
    return clockHistory.map(record => {
      const clockIn = new Date(record.clock_in);
      const clockOut = record.clock_out ? new Date(record.clock_out) : null;
      const totalHours = clockOut ? ((clockOut - clockIn) / (1000 * 60 * 60)).toFixed(2) : 'Pending';
      
      // Debugging: Log if task object is missing or malformed
      if (!record.task) {
        console.warn(`No task object in record:`, record);
      } else if (!record.task.task_title || !record.task.assigned_shift) {
        console.warn(`Task object missing task_title or assigned_shift:`, record.task);
      }

      return {
        id: record.id,
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

  // Calculate total hours worked
  const totalHoursWorked = useMemo(() => {
    return clockHistory.reduce((total, record) => {
      if (record.clock_out) {
        const clockIn = new Date(record.clock_in);
        const clockOut = new Date(record.clock_out);
        const hours = (clockOut - clockIn) / (1000 * 60 * 60);
        return total + hours;
      }
      return total;
    }, 0).toFixed(2);
  }, [clockHistory]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row bg-gray-50">
      {/* Mobile Menu Button */}
      <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-md">
        <img src={logo} alt="LaborSync Logo" className="w-28 h-auto" />
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-gray-700 focus:outline-none"
        >
          {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Side Panel - Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md z-10 absolute w-full">
          <nav className="flex-grow">
            <ul className="flex flex-col py-4">
              <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => { navigate('/menu'); setMobileMenuOpen(false); }}>
                Dashboard
              </li>
              <li className="flex items-center px-6 py-2 bg-gray-200 cursor-pointer font-medium" onClick={() => { navigate('/timesheets'); setMobileMenuOpen(false); }}>
                Timesheets
              </li>
              <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => { navigate('/view-project'); setMobileMenuOpen(false); }}>
                View Project
              </li>
              <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => { navigate('/view-task'); setMobileMenuOpen(false); }}>
                View Tasks
              </li>
              <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => { navigate('/worker-rewards'); setMobileMenuOpen(false); }}>
                Rewards
              </li>
              <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => { navigate('/user-profile'); setMobileMenuOpen(false); }}>
                Worker Details
              </li>
            </ul>
          </nav>
          <button
            onClick={() => navigate('/login')}
            className="bg-red-500 text-black mx-6 my-4 px-4 py-2 rounded hover:bg-gray-300 transition duration-200 w-auto"
          >
            Logout
          </button>
        </div>
      )}

      {/* Side Panel - Desktop */}
      
          {/* Sidebar */}
                  <aside className="w-1/6 bg-white shadow-md flex flex-col sticky top-0 h-screen  font-['Poppins']">
                    <div className="flex items-center justify-center py-4 border-b">
                      <img src={logo} alt="LaborSync Logo" className="w-36 h-auto" />
                    </div>
                    <nav className="flex-grow overflow-y-auto">
                      <ul className="flex flex-col py-4">
                        {[
                          { label: "Dashboard", route: "/menu" },
                          { label: "Timesheets", route: "/timesheets", active: true },
                          { label: "View Project", route: "/view-project" },
                          { label: "View Tasks", route: "/view-task" },
                          { label: "Rewards", route: "/worker-rewards" },
                          { label: "Worker Details", route: "/user-profile" },
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
     

      {/* Main Content Area */}
      <div className="flex-grow p-4 md:p-8">
        {/* Header Section */}
        <div className="bg-[#f3f8f9] p-4 md:p-6 rounded shadow-md mb-6">
          <h1 className="text-xl md:text-2xl font-bold mb-2 text-gray-800 font-['Poppins']">
            Timesheet for {userProfile?.user.first_name || "Guest"}
          </h1>
          <p className="text-base md:text-lg text-gray-600 font-['Poppins']">
            Total Hours Worked: {totalHoursWorked} hours
          </p>
        </div>

        {/* Attendance Report Section */}
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
                        attendanceReport.map((record, index) => (
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
    </div>
  );
};

export default Timesheet;