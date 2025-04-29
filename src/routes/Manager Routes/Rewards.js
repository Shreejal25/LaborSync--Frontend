import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  createRewards, 
  updateReward, 
  getWorkers, 
  getManagerDashboard, 
  getRewardsDetails
} from '../../endpoints/api';
import logo from "../../assets/images/LaborSynclogo.png";
import Notification from '../Components/Notification';

const CreateReward = () => {
    const { rewardId } = useParams();
    const navigate = useNavigate();
    const [workers, setWorkers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        point_cost: '',
        reward_type: 'bonus',
        cash_value: '',
        is_active: true,
        eligible_users: [],
        task: null
    });
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const isEditMode = !!rewardId;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [workerList, dashboardData] = await Promise.all([
                    getWorkers(),
                    getManagerDashboard()
                ]);
                
                setWorkers(workerList);
                setTasks(dashboardData.recent_tasks || []);

                if (isEditMode) {
                    const existingReward = await getRewardsDetails(rewardId);
                    setFormData({
                        ...existingReward,
                        task: existingReward.task?.id || null,
                        eligible_users: existingReward.eligible_users.map(u => u.username),
                        cash_value: existingReward.cash_value?.toString() || ''
                    });
                    setSelectedUsers(existingReward.eligible_users.map(u => u.username));
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                showNotification('Failed to load data', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [rewardId]);

    const handleCloseNotification = () => {
        setNotification(null);
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
        // Auto-dismiss notification after 5 seconds
        setTimeout(() => {
            setNotification(null);
        }, 5000);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleUserSelect = (e) => {
        const options = [...e.target.selectedOptions];
        const selectedUsernames = options.map(option => option.value);
        setSelectedUsers(selectedUsernames);
        setFormData(prev => ({
            ...prev,
            eligible_users: selectedUsernames
        }));
    };

    const handleTaskSelect = (e) => {
        const taskId = e.target.value ? parseInt(e.target.value) : null;
        setFormData(prev => ({
            ...prev,
            task: taskId
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submissionData = {
                ...formData,
                point_cost: Number(formData.point_cost),
                cash_value: formData.reward_type === 'bonus' ? Number(formData.cash_value) : null,
                task: formData.task || null
            };

            if (isEditMode) {
                await updateReward(rewardId, submissionData);
                showNotification('Reward updated successfully!', 'success');
            } else {
                await createRewards(submissionData);
                showNotification('Reward created successfully!', 'success');
            }
            navigate('/manager-rewards');
        } catch (error) {
            console.error('Error saving reward:', error);
            showNotification(`Failed to ${isEditMode ? 'update' : 'create'} reward: ${error.message}`, 'error');
        }
    };

    const handleLogout = () => {
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50 items-center justify-center">
                <div className="text-center p-8">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50 font-['Poppins']">
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
                            { path: '/manager-rewards', label: 'Rewards', active: true },
                            { path: '/reports', label: 'Reports' },
                            { path: '/manager-profile', label: 'Worker Details' }
                        ].map((item, index) => (
                            <li 
                                key={index}
                                className={`flex items-center px-4 md:px-6 py-2 hover:bg-gray-200 cursor-pointer transition-colors duration-200 ${item.active || window.location.pathname === item.path ? 'bg-gray-100 font-medium' : ''}`}
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

            <div className="flex-1 p-8 flex justify-center items-start">
                <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Form Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
                        <h2 className="text-2xl font-bold text-white">
                            {isEditMode ? 'Edit Reward' : 'Create New Reward'}
                        </h2>
                        <p className="text-blue-100 mt-1">
                            {isEditMode ? 'Update reward details' : 'Create reward options for workers'}
                        </p>
                    </div>

                    {/* Form Content */}
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Reward Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
                                    placeholder="Enter reward name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
                                    placeholder="Describe the reward and its conditions"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Point Cost</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="point_cost"
                                            value={formData.point_cost}
                                            onChange={handleChange}
                                            min="1"
                                            className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
                                            placeholder="Required points"
                                            required
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <span className="text-gray-500">pts</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Reward Type</label>
                                    <div className="relative">
                                        <select
                                            name="reward_type"
                                            value={formData.reward_type}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none shadow-sm"
                                        >
                                            <option value="bonus">Cash Bonus</option>
                                            <option value="timeoff">Paid Time Off</option>
                                            <option value="other">Other</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {formData.reward_type === 'bonus' && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Cash Value</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <span className="text-gray-500">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="cash_value"
                                            value={formData.cash_value}
                                            onChange={handleChange}
                                            step="0.01"
                                            min="0"
                                            className="w-full pl-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
                                            placeholder="0.00"
                                            required={formData.reward_type === 'bonus'}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Associated Task (Optional)</label>
                                <div className="relative">
                                    <select
                                        name="task"
                                        value={formData.task || ''}
                                        onChange={handleTaskSelect}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none shadow-sm"
                                    >
                                        <option value="">-- Select a task --</option>
                                        {tasks.map((task) => (
                                            <option key={task.id} value={task.id}>
                                                {task.task_title} (Project: {task.project_name})
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center space-x-3">
                                    <div className="relative inline-block w-10 mr-2 align-middle">
                                        <input 
                                            type="checkbox" 
                                            id="is_active" 
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                                    </div>
                                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                        Active Reward
                                        <span className="block text-xs text-gray-500 mt-1">
                                            Toggle to make this reward available to workers
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Eligible Workers</label>
                                <div className="relative">
                                    <select
                                        multiple
                                        name="eligible_users"
                                        value={selectedUsers}
                                        onChange={handleUserSelect}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm h-auto min-h-[120px]"
                                    >
                                        {workers.map((worker) => (
                                            <option
                                                key={worker.user.username}
                                                value={worker.user.username}
                                                className="py-2 px-1 hover:bg-blue-50"
                                            >
                                                {worker.user.username} ({worker.user.first_name} {worker.user.last_name})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {selectedUsers.length > 0 ? (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {selectedUsers.map(user => (
                                            <span key={user} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {user}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Hold Ctrl/Cmd to select multiple workers
                                    </p>
                                )}
                            </div>

                            <div className="pt-6 flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/manager-rewards')}
                                    className="px-5 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 transition-colors duration-200"
                                >
                                    {isEditMode ? 'Update Reward' : 'Create Reward'}
                                </button>
                            </div> 
                        </form>
                    </div>
                </div>
            </div>

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

export default CreateReward;