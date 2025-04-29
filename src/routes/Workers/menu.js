import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { FaCoins, FaGift, FaBars, FaTimes, FaCoffee, FaStopwatch } from 'react-icons/fa';
import { useAuth } from "../../context/useAuth";
import Notification from '../Components/Notification';
import {
  logout,
  clockIn,
  clockOut,
  getClockHistory,
  getUserTasks,
  getUserPoints,
  checkActiveClock,
} from '../../endpoints/api';
import logo from '../../assets/images/LaborSynclogo.png';

const UserDashboard = () => {
  // State declarations
  const [note, setNote] = useState("");
  const [shift, setShift] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInDetails, setClockInDetails] = useState(null);
  const [clockHistory, setClockHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [notification, setNotification] = useState({
    message: "",
    show: false,
    type: "info"
  });
  const [pointsData, setPointsData] = useState({
    total_points: 0,
    available_points: 0,
    redeemed_points: 0
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakTimeRemaining, setBreakTimeRemaining] = useState(5 * 60);
  const [isProcessing, setIsProcessing] = useState(false);

  const breakTimerRef = useRef(null);
  const navigate = useNavigate();
  const { userProfile, fetchUserProfile, isAuthenticated } = useAuth();
  const logoutTimer = useRef(null);

  // Effect for initial data fetching
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [profile, userTasks, history, points] = await Promise.all([
          fetchUserProfile(),
          getUserTasks(),
          getClockHistory(),
          getUserPoints()
        ]);

        setTasks(userTasks);
        setClockHistory(history);
        setPointsData(points);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        showNotification("Error loading dashboard data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [fetchUserProfile]);

  // Effect for checking active clock
  useEffect(() => {
    const checkClockStatus = async () => {
      if (!isAuthenticated || isProcessing) return;
      try {
        const activeClock = await checkActiveClock();
        if (activeClock.is_active) {
          setIsClockedIn(true);
          setSelectedTask(activeClock.task_id);
          setClockInDetails({
            clock_in: activeClock.clock_in,
            task: activeClock.task_id,
            task_title: tasks.find(t => t.id === activeClock.task_id)?.task_title,
            shift: activeClock.shift,
            note: activeClock.note,
            assigned_shift: activeClock.assigned_shift || tasks.find(t => t.id === activeClock.task_id)?.assigned_shift
          });
        } else {
          setIsClockedIn(false);
          setClockInDetails(null);
        }
      } catch (error) {
        console.error("Error checking active clock:", error);
      }
    };

    if (tasks.length > 0) {
      checkClockStatus();
    }
  }, [isAuthenticated, tasks, isProcessing]);

  // Effect for authentication check
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate('/menu');
    }
  }, [isAuthenticated, navigate, loading]);

  // Effect for updating current time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Effect for logout timer
  useEffect(() => {
    if (isAuthenticated) {
      startLogoutTimer();
    }
    return () => clearTimeout(logoutTimer.current);
  }, [isAuthenticated]);

  // Effect for break timer
  useEffect(() => {
    if (isOnBreak) {
      breakTimerRef.current = setInterval(() => {
        setBreakTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(breakTimerRef.current);
            setIsOnBreak(false);
            setBreakTimeRemaining(5 * 60);
            showNotification("Break time is over!", "info");
            return 5 * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(breakTimerRef.current);
    }

    return () => clearInterval(breakTimerRef.current);
  }, [isOnBreak]);

  const totalHoursWorkedToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalMilliseconds = 0;
    let firstClockIn = null;
    let lastClockOut = null;

    clockHistory.forEach(entry => {
      const clockInDate = new Date(entry.clock_in);
      
      if (clockInDate >= today) {
        if (!firstClockIn || clockInDate < firstClockIn) {
          firstClockIn = clockInDate;
        }

        const clockOutDate = entry.clock_out ? new Date(entry.clock_out) : new Date();
        const entryDuration = clockOutDate - clockInDate;
        
        if (entry.clock_out && (!lastClockOut || clockOutDate > lastClockOut)) {
          lastClockOut = clockOutDate;
        }

        totalMilliseconds += entryDuration;
      }
    });

    if (isClockedIn && clockInDetails) {
      const currentSessionStart = new Date(clockInDetails.clock_in);
      if (currentSessionStart >= today) {
        const currentDuration = new Date() - currentSessionStart;
        totalMilliseconds += currentDuration;
        
        if (!firstClockIn || currentSessionStart < firstClockIn) {
          firstClockIn = currentSessionStart;
        }
      }
    }

    return {
      hours: totalMilliseconds / (1000 * 60 * 60),
      clockIn: firstClockIn,
      clockOut: lastClockOut
    };
  }, [clockHistory, isClockedIn, clockInDetails, currentDateTime]);

  // Helper functions
  const formatTime = (date) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatBreakTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return 'Invalid Date';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric', 
      hour12: true 
    };
    return date.toLocaleString('en-US', options);
  };

  const showNotification = (message, type = "info") => {
    setNotification({ message, show: true, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const startLogoutTimer = () => {
    clearTimeout(logoutTimer.current);
    logoutTimer.current = setTimeout(async () => {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error("Error during auto-logout:", error);
      }
    }, 5 * 60 * 1000);
  };

  const resetLogoutTimer = () => {
    if (isAuthenticated) {
      startLogoutTimer();
    }
  };

  const handleLogout = async () => {
    try {
      if (isClockedIn) {
        await clockOut(selectedTask);
      }
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Error during logout:", error);
      showNotification("Error during logout", "error");
    }
  };

  const handleClockIn = async () => {
    if (!selectedTask) {
      showNotification("Please select a task before clocking in.", "error");
      return;
    }
  
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const currentTask = tasks.find(t => t.id === selectedTask);
      const tempClockInDetails = {
        shift,
        note,
        clock_in: new Date().toISOString(),
        username: userProfile?.user.username,
        task: selectedTask,
        task_title: currentTask?.task_title,
        assigned_shift: currentTask?.assigned_shift
      };

      setIsClockedIn(true);
      setClockInDetails(tempClockInDetails);

      const response = await clockIn(selectedTask, { shift, note, assigned_shift: currentTask?.assigned_shift });

      // Verify response status to ensure success
      if (response.status >= 200 && response.status < 300) {
        setClockInDetails({
          shift,
          note,
          clock_in: response.data.clock_in,
          username: userProfile?.user.username,
          task: response.data.task_id,
          task_title: tasks.find(t => t.id === response.data.task_id)?.task_title,
          assigned_shift: response.data.assigned_shift || tasks.find(t => t.id === response.data.task_id)?.assigned_shift
        });

        // Fetch updated clock history
        try {
          const history = await getClockHistory();
          setClockHistory(history);
        } catch (historyError) {
          console.error("Error fetching clock history:", historyError);
          // Don't show error notification for history fetch failure
        }

        showNotification("Clocked in successfully", "success");
        resetLogoutTimer();
        setNote("");
      } else {
        
      }
    } catch (error) {
      console.error("Clock-in error:", error);
      // Only reset state if clock-in genuinely failed
      try {
        const activeClock = await checkActiveClock();
        if (!activeClock.is_active) {
          setIsClockedIn(false);
          setClockInDetails(null);
        }
      } catch (checkError) {
        console.error("Error checking active clock:", checkError);
      }
      showNotification(error.message || "Error during clock-in", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClockOut = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await clockOut(selectedTask);
      
      setIsClockedIn(false);
      setClockInDetails(null);
      setIsOnBreak(false);
      setBreakTimeRemaining(5 * 60);
      
      const history = await getClockHistory();
      setClockHistory(history);
      
      showNotification("Clocked out successfully", "success");
      resetLogoutTimer();
    } catch (error) {
      console.error("Error during clock-out:", error);
      showNotification(error.response?.data?.message || "Error during clock-out", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTakeBreak = () => {
    if (!isClockedIn) {
      showNotification("You need to be clocked in to take a break", "error");
      return;
    }
    
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      if (isOnBreak) {
        clearInterval(breakTimerRef.current);
        setIsOnBreak(false);
        setBreakTimeRemaining(5 * 60);
        showNotification("Break ended", "info");
      } else {
        setIsOnBreak(true);
        setBreakTimeRemaining(5 * 60);
        showNotification("Break started - 5 minutes countdown", "success");
      }
      resetLogoutTimer();
    } catch (error) {
      console.error("Error during break:", error);
      showNotification("Error during break", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row bg-gray-50" onClick={resetLogoutTimer}>
      {/* Mobile Menu Button */}
      <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-md">
        <img src={logo} alt="LaborSync Logo" className="w-28 h-auto" />
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-gray-700 focus:outline-none"
          disabled={isProcessing}
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
              <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => { navigate('/timesheets'); setMobileMenuOpen(false); }}>
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
            onClick={handleLogout}
            className="bg-red-500 text-black mx-6 my-4 px-4 py-2 rounded hover:bg-gray-300 transition duration-200 w-auto"
            disabled={isProcessing}
          >
            Logout
          </button>
        </div>
      )}

      {/* Side Panel - Desktop */}
      <div className="hidden md:flex md:flex-col md:w-1/6 bg-white shadow-md h-screen sticky top-0 font-['Poppins']">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center py-4 border-b">
            <img src={logo} alt="LaborSync Logo" className="w-36 h-auto" />
          </div>

          <nav className="flex-grow">
            <ul className="flex flex-col py-4">
              <li className="flex items-center px-6 py-2 bg-gray-200 cursor-pointer font-medium" onClick={() => navigate('/menu')}>
                Dashboard
              </li>
              <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/timesheets')}>
                Timesheets
              </li>
              <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/view-project')}>
                View Project
              </li>
              <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/view-task')}>
                View Tasks
              </li>
              <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/worker-rewards')}>
                Rewards
              </li>
              <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => navigate('/user-profile')}>
                Worker Details
              </li>
            </ul>
          </nav>

          <div className="mt-auto p-4">
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-black py-2 rounded hover:bg-gray-300 transition duration-200"
              disabled={isProcessing}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow p-4 md:p-8 flex flex-col">
        {/* Header Section */}
        <div className="bg-[#f3f8f9] p-4 md:p-6 rounded shadow-md mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-4 md:mb-0">
            <h1 className="text-xl md:text-2xl font-bold mb-2 text-gray-800 font-['Poppins']">
              Hello {userProfile?.user.first_name || "Guest"},👋 Welcome,
            </h1>
            <p className="text-base md:text-lg text-gray-600 font-['Poppins']">You can Clock In/Out from here</p>
          </div>
          
          <div className="bg-[#f3f8f9] p-3 md:p-4 rounded-lg shadow-md flex flex-col items-center cursor-pointer hover:shadow-lg transition-shadow duration-300 border font-['Poppins'] w-full md:w-auto">
            <div className="flex items-center mb-2">
              <FaCoins className="text-yellow-500 text-xl md:text-2xl mr-2" />
              <span className="font-bold text-gray-700 text-sm md:text-base">Your Points</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 md:gap-4 text-center w-full">
              <div className="flex flex-col items-center">
                <span className="text-xs md:text-sm text-gray-500">Total</span>
                <span className="font-bold text-sm md:text-lg">{pointsData.total_points}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs md:text-sm text-gray-500">Available</span>
                <span className="font-bold text-sm md:text-lg text-green-500">{pointsData.available_points}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs md:text-sm text-gray-500">Redeemed</span>
                <span className="font-bold text-sm md:text-lg text-blue-500">{pointsData.redeemed_points}</span>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/worker-rewards')}
              className="mt-2 md:mt-3 flex items-center justify-center bg-blue-100 text-blue-600 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm hover:bg-blue-200 transition"
              disabled={isProcessing}
            >
              <FaGift className="mr-1" /> Redeem Points
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-grow">
          {/* Progress Section */}
          <div className="w-full lg:w-2/3 bg-white p-6 rounded-2xl shadow-md mb-6 lg:mr-4 border border-blue-100">
            <h2 className="text-2xl font-semibold text-blue-700 mb-6">Today's Progress</h2>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <div className="w-full bg-blue-100 rounded-full h-3 relative overflow-hidden">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((totalHoursWorkedToday.hours / 8) * 100, 100)}%`
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-blue-800 mt-3">
                <span>{totalHoursWorkedToday.hours.toFixed(1)} hrs worked</span>
                <span className="font-medium">Target: 8 hrs</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-6 text-sm text-gray-700">
              <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                <p className="text-teal-600 text-sm mb-1">Clock In</p>
                <p className="font-semibold text-lg text-teal-900">{formatTime(totalHoursWorkedToday.clockIn)}</p>
              </div>
              <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                <p className="text-teal-600 text-sm mb-1">Clock Out</p>
                <p className="font-semibold text-lg text-teal-900">
                  {totalHoursWorkedToday.clockOut
                    ? formatTime(totalHoursWorkedToday.clockOut)
                    : (isClockedIn ? 'In Progress' : '--:--')}
                </p>
              </div>
            </div>
          </div>

          {/* Clock In/Out Section */}
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm lg:ml-5 border border-gray-200 w-full lg:w-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 font-['Poppins'] mb-2 md:mb-0">
                {formatDateTime(currentDateTime)}
              </h2>
              <div className="flex items-center space-x-2 pl-8">
                {isOnBreak ? (
                  <div className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-yellow-500 animate-pulse mr-2"></span>
                    <span className="text-xs md:text-sm pl-2 font-['Poppins'] text-yellow-600">
                      On Break: {formatBreakTime(breakTimeRemaining)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className={`h-3 w-3 rounded-full ${
                      isClockedIn ? 'bg-green-500 animate-pulse' : 'bg-gray-200'
                    }`}></span>
                    <span className={`text-xs md:text-sm pl-2 font-['Poppins'] ${
                      isClockedIn ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {isClockedIn ? 'Currently Clocked In' : 'Currently Clocked Out'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {notification.show && (
              <Notification 
                message={notification.message} 
                onClose={closeNotification} 
                type={notification.type} 
              />
            )}

            {isClockedIn ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2 font-['Poppins']">Current Shift Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <p className="text-xs md:text-sm text-gray-500 font-['Poppins']">Shift</p>
                      <p className="font-medium text-gray-800 text-sm md:text-base font-['Poppins']">{clockInDetails?.assigned_shift || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-gray-500 font-['Poppins']">Task</p>
                      <p className="font-medium text-gray-800 text-sm md:text-base font-['Poppins']">
                        {clockInDetails?.task_title || 'N/A'}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs md:text-sm text-gray-500 font-['Poppins']">Note</p>
                      <p className="font-medium text-gray-800 text-sm md:text-base font-['Poppins']">{clockInDetails?.note || 'No note provided'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                  <button
                    onClick={handleClockOut}
                    disabled={isProcessing}
                    className={`flex-1 bg-gradient-to-r from-yellow-400 to-red-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all duration-200 text-sm md:text-base font-['Poppins'] ${
                      isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                    }`}
                  >
                    {isProcessing ? 'Processing...' : 'Clock Out'}
                  </button>
                  <button
                    onClick={handleTakeBreak}
                    disabled={isProcessing}
                    className={`flex-1 flex items-center justify-center px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium hover:shadow-md transition-all duration-200 text-sm md:text-base font-['Poppins'] ${
                      isOnBreak 
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isProcessing ? (
                      'Processing...'
                    ) : isOnBreak ? (
                      <>
                        <FaStopwatch className="mr-2" />
                        End Break ({formatBreakTime(breakTimeRemaining)})
                      </>
                    ) : (
                      <>
                        <FaCoffee className="mr-2" />
                        Take Break
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 font-['Poppins']">Shift</label>
                    <select
                      value={shift}
                      onChange={(e) => setShift(e.target.value)}
                      className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base font-['Poppins']"
                      disabled={isProcessing}
                    >
                      <option value="" disabled>Select Shift</option>
                      <option value="morning">Morning Shift</option>
                      <option value="afternoon">Afternoon Shift</option>
                      <option value="night">Night Shift</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 font-['Poppins']">Task</label>
                    <select
                      value={selectedTask}
                      onChange={(e) => setSelectedTask(e.target.value)}
                      className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base font-['Poppins']"
                      disabled={isProcessing}
                    >
                      <option value="" disabled>Select Task</option>
                      {tasks.map((task) => (
                        <option key={task.id} value={task.id}>
                          {task.task_title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 font-['Poppins']">Note</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base font-['Poppins']"
                      placeholder="Enter a note (optional)"
                      rows={3}
                      disabled={isProcessing}
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                  <button
                    onClick={handleClockIn}
                    disabled={!selectedTask || !shift || isProcessing}
                    className={`flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all duration-200 text-sm md:text-base font-['Poppins'] ${
                      (!selectedTask || !shift || isProcessing) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                    }`}
                  >
                    {isProcessing ? 'Processing...' : 'Clock In'}
                  </button>
                  <button
                    disabled={true}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium opacity-50 cursor-not-allowed text-sm md:text-base font-['Poppins']"
                  >
                    <FaCoffee className="mr-2 inline" />
                    Take Break
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Attendance History Section */}
        <div className="bg-white p-4 md:p-6 my-4 md:my-5 rounded-lg shadow-lg">
          <h2 className="text-lg md:text-xl font-medium text-gray-800 font-['Poppins'] mb-4 md:mb-6">Attendance History</h2>
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <div className="overflow-x-auto">
              <div className="relative">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-200 sticky top-0 z-10">
                      <tr>
                        <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-900 uppercase tracking-wider font-['Poppins']">Employee</th>
                        <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-900 uppercase tracking-wider font-['Poppins']">Clock-in</th>
                        <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-900 uppercase tracking-wider font-['Poppins']">Clock-out</th>
                        <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-900 uppercase tracking-wider font-['Poppins']">Status</th>
                        <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-900 uppercase tracking-wider font-['Poppins']">Notes</th>
                        
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {clockHistory.map((record, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 md:px-6 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="ml-0 md:ml-4">
                                <div className="text-xs md:text-sm font-medium text-gray-900 font-['Poppins']">{record.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 md:px-6 py-3 whitespace-nowrap">
                            <div className="text-xs md:text-sm text-gray-900 font-['Poppins']">{formatDateTime(record.clock_in)}</div>
                          </td>
                          <td className="px-3 md:px-6 py-3 whitespace-nowrap">
                            <div className={`text-xs md:text-sm font-['Poppins'] ${record.clock_out ? 'text-gray-900' : 'text-amber-500'}`}>
                              {record.clock_out ? formatDateTime(record.clock_out) : 'Pending'}
                            </div>
                          </td>
                          <td className="px-3 md:px-6 py-3 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full font-['Poppins']
                              ${record.clock_out ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                              {record.clock_out ? 'Completed' : 'Active'}
                            </span>
                          </td>
                          <td className="px-3 md:px-6 py-3 text-xs md:text-sm text-gray-500 max-w-xs truncate font-['Poppins']" title={record.note}>
                            {record.note || '-'}
                          </td>
                         
                        </tr>
                      ))}
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

export default UserDashboard;