import React, { useState, useEffect } from 'react';
import { awardPoints, getWorkers, getManagerTasks, getManagerRewards } from '../../endpoints/api';
import logo from "../../assets/images/LaborSynclogo.png";
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

const AwardPoints = () => {
    const [workers, setWorkers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [rewards, setRewards] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState('');
    const [selectedTask, setSelectedTask] = useState('');
    const [selectedReward, setSelectedReward] = useState('');
    const [points, setPoints] = useState(5);
    const [description, setDescription] = useState('Task completion');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [workerList, taskList, rewardList] = await Promise.all([
                    getWorkers(),
                    getManagerTasks(),
                    getManagerRewards()
                ]);
                if (workerList) setWorkers(workerList);
                if (taskList) setTasks(taskList);
                if (rewardList?.data?.rewards) setRewards(rewardList.data.rewards);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const response = await awardPoints({
                points,
                description,
                username: selectedWorker,
                task_id: selectedTask || null,
                reward_id: selectedReward || null
            });
            
            setMessage(`Successfully awarded ${points} points to ${selectedWorker}! Total points: ${response.total_points}`);
            setSelectedWorker('');
            setSelectedTask('');
            setSelectedReward('');
        } catch (error) {
            setMessage('Failed to award points. Please try again.');
            console.error('Award points error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-gray-50 font-['Poppins']">
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
                            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => { navigate('/manager-dashboard'); setMobileMenuOpen(false); }}>
                                Dashboard
                            </li>
                            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => { navigate('/create-project'); setMobileMenuOpen(false); }}>
                                Project
                            </li>
                            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => { navigate('/assign-task'); setMobileMenuOpen(false); }}>
                                Assign Tasks
                            </li>
                            <li className="flex items-center px-6 py-2 bg-gray-200 cursor-pointer font-medium" onClick={() => { navigate('/manager-rewards'); setMobileMenuOpen(false); }}>
                                Rewards
                            </li>
                            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => { navigate('/reports'); setMobileMenuOpen(false); }}>
                                Reports
                            </li>
                            <li className="flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => { navigate('/manager-profile'); setMobileMenuOpen(false); }}>
                                Worker Details
                            </li>
                        </ul>
                    </nav>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-black mx-6 my-4 px-4 py-2 rounded hover:bg-gray-300 transition duration-200 w-auto"
                    >
                        Logout
                    </button>
                </div>
            )}

            {/* Sidebar - Desktop */}
            <div className="hidden md:flex md:flex-col md:w-1/6 bg-white shadow-md">
                <div className="flex items-center justify-center py-4 border-b">
                    <img src={logo} alt="LaborSync Logo" className="w-36 h-auto" />
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
                                className={`px-6 py-2 hover:bg-gray-200 cursor-pointer transition-colors duration-200 ${
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

            {/* Main Content */}
            <div className="flex-1 p-8 flex justify-center items-start">
                <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-0 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
                        <h2 className="text-2xl font-bold text-white">Award Points</h2>
                        <p className="text-blue-100 mt-1">Recognize contributions by awarding points</p>
                    </div>
                    
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Worker Selection */}
                            <div className="space-y-1">
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                    Select Worker
                                </label>
                                <select
                                    id="username"
                                    value={selectedWorker}
                                    onChange={(e) => setSelectedWorker(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white"
                                >
                                    <option value="">Select a worker</option>
                                    {workers.map((worker) => (
                                        <option key={worker.user.username} value={worker.user.username}>
                                            {worker.user.username} ({worker.user.first_name} {worker.user.last_name})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Task Selection */}
                            <div className="space-y-1">
                                <label htmlFor="task" className="block text-sm font-medium text-gray-700">
                                    Associated Task (Optional)
                                </label>
                                <select
                                    id="task"
                                    value={selectedTask}
                                    onChange={(e) => setSelectedTask(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white"
                                >
                                    <option value="">-- Select a task --</option>
                                    {tasks.map((task) => (
                                        <option key={task.id} value={task.id}>
                                            {task.title || task.task_title} (Project: {task.project?.name || 'No Project'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Reward Selection */}
                            <div className="space-y-1">
                                <label htmlFor="reward" className="block text-sm font-medium text-gray-700">
                                    Associated Reward (Optional)
                                </label>
                                <select
                                    id="reward"
                                    value={selectedReward}
                                    onChange={(e) => {
                                        setSelectedReward(e.target.value);
                                        // Auto-select the associated task if reward has one
                                        const reward = rewards.find(r => r.id == e.target.value);
                                        if (reward?.task_details) {
                                            setSelectedTask(reward.task_details.id);
                                        }
                                    }}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white"
                                >
                                    <option value="">-- Select a reward --</option>
                                    {rewards.map((reward) => (
                                        <option key={reward.id} value={reward.id}>
                                            {reward.name} ({reward.point_cost} pts)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Points Selection */}
                            <div className="space-y-1">
                                <label htmlFor="points" className="block text-sm font-medium text-gray-700">
                                    Points to Award
                                </label>
                                <select
                                    id="points"
                                    value={points}
                                    onChange={(e) => setPoints(parseInt(e.target.value))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white"
                                >
                                    <option value="5">5 points</option>
                                    <option value="10">10 points</option>
                                    <option value="15">15 points</option>
                                    <option value="20">20 points</option>
                                    <option value="25">25 points</option>
                                    <option value="50">50 points</option>
                                    <option value="100">100 points</option>
                                    <option value="500">500 points</option>
                                    <option value="1000">1000 points</option>
                                </select>
                            </div>

                            {/* Description */}
                            <div className="space-y-1">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Reason for Recognition
                                </label>
                                <input
                                    type="text"
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Why are you awarding these points?"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full py-3 px-4 rounded-lg font-medium text-white shadow-md transition duration-200 ${
                                        isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                                    }`}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : (
                                        'Award Points'
                                    )}
                                </button>
                            </div>

                            {/* Message Display */}
                            {message && (
                                <div className={`mt-6 p-4 rounded-lg ${
                                    message.includes('Success') 
                                        ? 'bg-green-50 border-l-4 border-green-500 text-green-700' 
                                        : 'bg-red-50 border-l-4 border-red-500 text-red-700'
                                }`}>
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            {message.includes('Success') ? (
                                                <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm">{message}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AwardPoints;