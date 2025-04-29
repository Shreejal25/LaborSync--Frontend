import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { getWorkers, getManagerDashboard, getProjects, assignTask, updateTask, deleteTask, completeTask,logout} from '../../endpoints/api';
import logo from "../../assets/images/LaborSynclogo.png";

const AssignTaskPage = () => {
    
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [workers, setWorkers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    const [filters, setFilters] = useState({
        project: '',
        status: '',
        assignedTo: '',
        dateRange: ''
    });

    

    const filterTasks = (tasks) => {
        return tasks.filter(task => {
            // Filter by project
            if (filters.project && projects.find(p => p.id === task.project)?.name !== filters.project) {
                return false;
            }
            
            // Filter by status
            if (filters.status && task.status !== filters.status) {
                return false;
            }
            
            // Filter by assigned worker
            if (filters.assignedTo && 
                (!task.assigned_to || !task.assigned_to.includes(filters.assignedTo))) {
                return false;
            }
            
            // Filter by date range (example: overdue, today, upcoming)
          
            
            return true;
        });
    };

    const exportToCSV = () => {
        const filteredTasks = filterTasks(tasks);
        if (filteredTasks.length === 0) {
            showNotification('No tasks to export', 'error');
            return;
        }

        // Prepares the data for CSV
        const headers = [
            'Project', 'Task', 'Description', 'Assigned To', 
            'Due Date', 'Status', 'Shift', 'Created At', 
            'Updated At', 'Status Changed At'
        ];

        const data = filteredTasks.map(task => [
            projects.find(p => p.id === task.project)?.name || 'N/A',
            task.task_title,
            task.description,
            task.assigned_to?.join(', ') || 'Unassigned',
            task.estimated_completion_datetime ? formatDateTime(task.estimated_completion_datetime) : 'N/A',
            task.status ? task.status.replace('_', ' ') : 'N/A',
            task.assigned_shift || 'N/A',
            task.created_at ? formatDateTime(task.created_at) : 'N/A',
            task.updated_at ? formatDateTime(task.updated_at) : 'N/A',
            task.status_changed_at ? formatDateTime(task.status_changed_at) : 'N/A'
        ]);

        // Creates CSV content
        let csvContent = headers.join(',') + '\n';
        data.forEach(row => {
            csvContent += row.map(field => `"${field?.toString().replace(/"/g, '""')}"`).join(',') + '\n';
        });

        // Creates download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `tasks_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('Tasks exported to CSV successfully');
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [workerList, projectList, dashboardData] = await Promise.all([
                    getWorkers(),
                    getProjects(),
                    getManagerDashboard()
                ]);
                
                if (workerList) setWorkers(workerList);
                if (projectList) setProjects(projectList);
                if (dashboardData) {
                    setTasks(dashboardData.recent_tasks || []);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                showNotification('Error fetching data', 'error');
            }
        };
        fetchData();
    }, []);

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const refreshTasks = async () => {
        try {
            const dashboardData = await getManagerDashboard();
            if (dashboardData) {
                setTasks(dashboardData.recent_tasks || []);
            }
        } catch (error) {
            console.error('Error refreshing tasks:', error);
            showNotification('Error refreshing tasks', 'error');
        }
    };

    const handleTaskAssigned = async () => {
        await refreshTasks();
        showNotification('Task assigned successfully');
    };

    const handleTaskUpdated = async () => {
        await refreshTasks();
        setShowTaskDetailsModal(false);
        showNotification('Task updated successfully');
    };

      const handleLogout = async () => {
             try {
                await logout();
                navigate('/login-manager');
             } catch (error) {
                console.error("Error during logout:", error);
               
             }
           };

    const handleDeleteTask = async () => {
        try {
            await deleteTask(selectedTask.id);
            await refreshTasks();
            setShowTaskDetailsModal(false);
            setShowDeleteConfirm(false);
            showNotification('Task deleted successfully');
        } catch (error) {
            console.error('Error deleting task:', error);
            showNotification('Error deleting task', 'error');
        }
    };

    const handleCompleteTask = async (taskId) => {
        try {
            // Optimistically update UI
            setTasks(prevTasks => 
                prevTasks.map(task => 
                    task.id === taskId ? { ...task, status: 'completed' } : task
                )
            );
            
            // API call to mark task as complete
            const response = await completeTask(taskId);
            
            if (response.success) {
                await refreshTasks(); // Refresh data from server
                showNotification('Task marked as completed successfully!', 'success'); // Green
            } else {
                await refreshTasks(); // Revert if API fails
                showNotification(response.message || 'Failed to complete task', 'error'); // Red
            }
        } catch (error) {
            console.error('Error completing task:', error);
            await refreshTasks(); // Revert on network errors
            showNotification('Error completing task. Please try again.', 'error'); // Red
        }
    };

    const filteredTasks = filterTasks(tasks);

    return (
        <div className="flex h-screen">
            {notification.show && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
                    notification.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                    {notification.message}
                </div>
            )}

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

            <main className="w-full min-h-screen py-1 md:w-2/3 lg:w-3/4">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl font-bold">Task Management</h1>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
                        >
                            Assign New Task
                        </button>
                    </div>

                    <div className="bg-white rounded-md shadow-sm border border-gray-100 mb-4">
                        <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-extrabold text-gray-800 font-['Poppins']">Recent Tasks</h2>
                            <div className="flex space-x-2">
                                <button 
                                    className={`px-3 py-1 text-xs rounded text-black transition-colors font-['Poppins'] relative group ${
                                        Object.values(filters).some(f => f !== '') 
                                            ? 'bg-blue-100 border border-blue-300' 
                                            : 'bg-gray-200 hover:bg-gray-100'
                                    }`}
                                >
                                    Filter
                                    {Object.values(filters).some(f => f !== '') && (
                                        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-500"></span>
                                    )}
                                    <div className="absolute right-0 mt-1 w-64 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
                                        <div className="p-3 space-y-3">
                                            {/* Project Filter */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Project</label>
                                                <select
                                                    value={filters.project}
                                                    onChange={(e) => setFilters({...filters, project: e.target.value})}
                                                    className="w-full p-1 text-xs border border-gray-300 rounded"
                                                >
                                                    <option value="">All Projects</option>
                                                    {projects.map(project => (
                                                        <option key={project.id} value={project.name}>
                                                            {project.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            
                                            {/* Status Filter */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                                                <select
                                                    value={filters.status}
                                                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                                                    className="w-full p-1 text-xs border border-gray-300 rounded"
                                                >
                                                    <option value="">All Statuses</option>
                                                    <option value="pending">Pending</option>
                                                    <option value="in_progress">In Progress</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                            </div>
                                            
                                            {/* Assigned To Filter */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Assigned To</label>
                                                <select
                                                    value={filters.assignedTo}
                                                    onChange={(e) => setFilters({...filters, assignedTo: e.target.value})}
                                                    className="w-full p-1 text-xs border border-gray-300 rounded"
                                                >
                                                    <option value="">All Workers</option>
                                                    {workers.map(worker => (
                                                        <option key={worker.user.username} value={worker.user.username}>
                                                            {worker.user.username}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            
                                           
                                            
                                            {/* Clear Filters Button */}
                                            <button
                                                onClick={() => setFilters({
                                                    project: '',
                                                    status: '',
                                                    assignedTo: '',
                                                    dateRange: ''
                                                })}
                                                className="w-full text-xs bg-gray-100 hover:bg-gray-200 py-1 rounded"
                                            >
                                                Clear Filters
                                            </button>
                                        </div>
                                    </div>
                                </button>
                                <button 
                                    onClick={exportToCSV}
                                    className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-100 rounded text-black transition-colors font-['Poppins']"
                                >
                                    Export to CSV
                                </button>
                            </div>
                        </div>

                        {filteredTasks.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead className="bg-gray-200">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wide font-['Poppins']">Project</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wide font-['Poppins']">Task</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wide font-['Poppins']">Description</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wide font-['Poppins']">Assigned</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wide font-['Poppins']">Due Date</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wide font-['Poppins']">Status</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wide font-['Poppins']">Shift</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wide font-['Poppins']">Created</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wide font-['Poppins']">Updated</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wide font-['Poppins']">Status Changed</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wide font-['Poppins']">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {filteredTasks.map((task) => (
                                            <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 text-sm text-gray-700 font-['Poppins']">
                                                    {projects.find((p) => p.id === task.project)?.name || 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-800 font-['Poppins']">
                                                    {task.task_title}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate font-['Poppins']">
                                                    {task.description}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {task.assigned_to?.length > 0 ? (
                                                            task.assigned_to.map((worker, index) => (
                                                                <span key={index} className="bg-gray-50 px-2 py-0.5 rounded-full text-xs text-gray-600 font-['Poppins']">
                                                                    {worker}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-gray-400 text-xs font-['Poppins']">Unassigned</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 font-['Poppins']">
                                                    {task.estimated_completion_datetime ? formatDateTime(task.estimated_completion_datetime) : '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full font-['Poppins'] ${
                                                        task.status === 'pending' ? 'bg-red-50 text-red-700' :
                                                        task.status === 'in_progress' ? 'bg-yellow-50 text-yellow-700' :
                                                        'bg-green-50 text-green-700'
                                                    }`}>
                                                        {task.status ? task.status.replace('_', ' ') : '—'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 font-['Poppins']">
                                                    {task.assigned_shift || '—'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 font-['Poppins']">
                                                    {task.created_at ? formatDateTime(task.created_at) : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 font-['Poppins']">
                                                    {task.updated_at ? formatDateTime(task.updated_at) : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 font-['Poppins']">
                                                    {task.status_changed_at ? formatDateTime(task.status_changed_at) : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-sm whitespace-nowrap">
                                                    <div className="flex items-center space-x-1">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedTask(task);
                                                                setShowTaskDetailsModal(true);
                                                            }}
                                                            className="p-1 text-blue-400 hover:text-blue-600 transition-colors"
                                                            title="View Details"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                        {task.status !== 'completed' && (
                                                            <button
                                                                onClick={() => handleCompleteTask(task.id)}
                                                                className="p-1 text-green-600 hover:text-green-700 transition-colors"
                                                                title="Mark Complete"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
  ) : (
    <div className="px-4 py-8 text-center">
      <svg className="mx-auto h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-700 font-['Poppins']">No tasks</h3>
      <p className="mt-1 text-xs text-gray-500 font-['Poppins']">Get started by creating a new task</p>
    </div>
  )}
</div>
                </div>

                {showModal && (
                    <AssignTaskModal 
                        projects={projects}
                        workers={workers}
                        onClose={() => setShowModal(false)}
                        onTaskAssigned={handleTaskAssigned}
                    />
                )}

                {showTaskDetailsModal && selectedTask && (
                    <TaskDetailsModal 
                        task={selectedTask}
                        projects={projects}
                        workers={workers}
                        onClose={() => {
                            setShowTaskDetailsModal(false);
                            setSelectedTask(null);
                        }}
                        onTaskUpdated={handleTaskUpdated}
                        onDeleteClick={() => setShowDeleteConfirm(true)}
                        onCompleteTask={handleCompleteTask}
                    />
                )}

                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
                            <p className="mb-4">Are you sure you want to delete this task? This action cannot be undone.</p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteTask}
                                    className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                                >
                                    Delete Task
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

const AssignTaskModal = ({ projects, workers, onClose, onTaskAssigned }) => {
    const [taskData, setTaskData] = useState({
        project: '',
        task_title: '',
        description: '',
        estimated_completion_datetime: '',
        assigned_shift: '',
        assigned_to: [],
        min_clock_cycle: 1,
    });
    const [selectedProject, setSelectedProject] = useState('');
    const [projectWorkers, setProjectWorkers] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (selectedProject) {
            const projectData = projects.find(p => p.id === parseInt(selectedProject));
            setProjectWorkers(projectData?.workers || []);
        } else {
            setProjectWorkers([]);
        }
    }, [selectedProject, projects]);


     // Add validation function
     const validateForm = () => {
        if (!taskData.estimated_completion_datetime) {
            setError('Estimated completion date is required');
            return false;
        }
        
        try {
            const completionDate = new Date(taskData.estimated_completion_datetime);
            if (isNaN(completionDate.getTime())) {
                setError('Invalid date format');
                return false;
            }
            
            if (completionDate < new Date()) {
                setError('Completion date must be in the future');
                return false;
            }
        } catch (e) {
            setError('Invalid date format');
            return false;
        }
        
        return true;
    };

    const handleChange = (e) => {
        const { name, value, options } = e.target;
    
        if (name === 'project') {
            setSelectedProject(value);
            const projectName = projects.find(p => p.id === parseInt(value))?.name || '';
            setTaskData(prev => ({
                ...prev,
                project: projectName,
                assigned_to: [],
            }));
        } else if (name === 'assigned_to') {
            const selected = Array.from(options).filter(option => option.selected).map(option => option.value);
            setTaskData(prev => ({ ...prev, assigned_to: selected }));
        } else {
            setTaskData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        // Validate required fields
        if (!taskData.estimated_completion_datetime) {
            setError('Estimated completion date is required');
            return;
        }
    
        setIsLoading(true);
    
        try {
            // Convert to proper datetime format
            const completionDate = new Date(taskData.estimated_completion_datetime);
            if (isNaN(completionDate.getTime())) {
                throw new Error("Invalid date format");
            }
    
            // Prepare payload with proper datetime format
            const payload = {
                project: parseInt(selectedProject),
                task_title: taskData.task_title,
                description: taskData.description,
                estimated_completion_datetime: completionDate.toISOString(), // Convert to ISO string
                assigned_shift: taskData.assigned_shift,
                assigned_to: taskData.assigned_to,
                min_clock_cycle: taskData.min_clock_cycle,
                status: 'pending'
            };
    
            const response = await assignTask(payload);
            
            if (response.message) {
                // Reset form and close modal
                setTaskData({
                    project: '',
                    task_title: '',
                    description: '',
                    estimated_completion_datetime: '',
                    assigned_shift: '',
                    assigned_to: [],
                    min_clock_cycle: 1,
                });
                setSelectedProject('');
                onTaskAssigned();
            }
        } catch (error) {
            console.error('Error assigning task:', error);
            setError(error.response?.data?.message || error.message || 'Failed to assign task');
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Assign Task</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Project</label>
                        <select 
                            name="project" 
                            value={selectedProject} 
                            onChange={handleChange} 
                            required 
                            className="w-full p-2 border rounded"
                        >
                            <option value="" disabled>Select a project</option>
                            {projects.map((project) => (
                                <option key={project.id} value={project.id}>{project.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Task Title</label>
                        <input 
                            type="text" 
                            name="task_title" 
                            placeholder="Task Title" 
                            value={taskData.task_title} 
                            onChange={handleChange} 
                            required 
                            className="w-full p-2 border rounded" 
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Description</label>
                        <textarea 
                            name="description" 
                            placeholder="Description" 
                            value={taskData.description} 
                            onChange={handleChange} 
                            required 
                            className="w-full p-2 border rounded"
                            rows="3"
                        ></textarea>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Estimated Completion *</label>
                        <input 
                            type="datetime-local" 
                            name="estimated_completion_datetime" 
                            value={taskData.estimated_completion_datetime} 
                            onChange={handleChange} 
                            required 
                            className="w-full p-2 border rounded"
                            min={new Date().toISOString().slice(0, 16)} // Prevent past dates
                        />
                        {error === 'Estimated completion date is required' && (
                            <p className="text-red-500 text-sm mt-1">This field is required</p>
                        )}
                        {error === 'Completion date must be in the future' && (
                            <p className="text-red-500 text-sm mt-1">Please select a future date</p>
                        )}
                        {error === 'Invalid date format' && (
                            <p className="text-red-500 text-sm mt-1">Please enter a valid date</p>
                        )}
                    </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Minimum Clock Cycles</label>
                                <input 
                                    type="number" 
                                    name="min_clock_cycle"  // Corrected name
                                    min="1"
                                    value={taskData.min_clock_cycle}
                                    onChange={(e) => setTaskData({
                                        ...taskData, 
                                        min_clock_cycle: parseInt(e.target.value) || 1
                                    })}
                                    className="w-full p-2 border rounded"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Number of clock-in/out cycles required per worker
                                </p>
                            </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Assigned Shift</label>
                        <input 
                            type="text" 
                            name="assigned_shift" 
                            placeholder="Assigned Shift" 
                            value={taskData.assigned_shift} 
                            onChange={handleChange} 
                            required 
                            className="w-full p-2 border rounded" 
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Assign To</label>
                        <select 
                            name="assigned_to" 
                            multiple 
                            value={taskData.assigned_to} 
                            onChange={handleChange} 
                            required 
                            className="w-full p-2 border rounded min-h-[100px]"
                        >
                            {!selectedProject ? (
                                <option disabled>Select a project first</option>
                            ) : projectWorkers.length === 0 ? (
                                <option disabled>No workers in this project</option>
                            ) : (
                                projectWorkers.map((worker) => (
                                    <option key={worker} value={worker}>{worker}</option>
                                ))
                            )}
                        </select>
                        <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple workers</p>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400" 
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600" 
                            disabled={isLoading}
                        >
                            {isLoading ? 'Assigning...' : 'Assign Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TaskDetailsModal = ({ task, projects, workers, onClose, onTaskUpdated, onDeleteClick, onCompleteTask }) => {
    const formatDateTimeForInput = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch (e) {
            console.error('Error formatting date:', e);
            return '';
        }
    };

    const [editMode, setEditMode] = useState(false);
    const [editedTask, setEditedTask] = useState({ 
        ...task,
        estimated_completion_datetime: formatDateTimeForInput(task.estimated_completion_datetime)
    });
    const [selectedProject, setSelectedProject] = useState(task.project || '');
    const [projectWorkers, setProjectWorkers] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (selectedProject) {
            const projectData = projects.find(p => p.id === parseInt(selectedProject));
            setProjectWorkers(projectData?.workers || []);
        } else {
            setProjectWorkers([]);
        }
    }, [selectedProject, projects]);

    const handleChange = (e) => {
        const { name, value, options } = e.target;

        if (name === 'project') {
            setSelectedProject(value);
            const projectName = projects.find(p => p.id === parseInt(value))?.name || '';
            setEditedTask(prev => ({
                ...prev,
                project: projectName,
                assigned_to: [],
            }));
        } else if (name === 'assigned_to') {
            const selected = Array.from(options).filter(option => option.selected).map(option => option.value);
            setEditedTask(prev => ({ ...prev, assigned_to: selected }));
        } else {
            setEditedTask(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const payload = {
                ...editedTask,
                estimated_completion_datetime: new Date(editedTask.estimated_completion_datetime).toISOString(),
            };

            const response = await updateTask(task.id, payload);
            
            if (response.message) {
                onTaskUpdated();
            }
        } catch (error) {
            console.error('Error updating task:', error);
            setError(error.response?.data?.message || 'Failed to update task');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const formatDateTimeForTimeline = (dateString) => {
        if (!dateString) return '';
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const handleDelete = async () => {
        try {
            await deleteTask(task.id);
            onClose();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 font-['Poppins']">
            {/* Main Modal Container */}
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-100">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {editMode ? `Edit Task: ${task.task_title}` : task.task_title}
                        </h2>
                        {!editMode && (
                            <p className="text-sm text-gray-500 mt-1">
                                Last updated: {formatDateTime(task.updated_at)}
                            </p>
                        )}
                    </div>
                    
                    <div className="flex space-x-2">
                        {!editMode && (
                            <>
                                <button 
                                    onClick={() => setEditMode(true)}
                                    className="flex items-center space-x-1 bg-amber-100 text-amber-800 py-1.5 px-3 rounded-lg hover:bg-amber-200 text-sm transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    <span>Edit</span>
                                </button>
    
                                {task.status !== 'completed' && (
                                    <button 
                                        onClick={() => {
                                            onCompleteTask(task.id);
                                            onClose();
                                        }}
                                        className="flex items-center space-x-1 bg-green-100 text-green-800 py-1.5 px-3 rounded-lg hover:bg-green-200 text-sm transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Complete</span>
                                    </button>
                                )}
    
                                <button 
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="flex items-center space-x-1 bg-red-100 text-red-800 py-1.5 px-3 rounded-lg hover:bg-red-200 text-sm transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span>Delete</span>
                                </button>
                            </>
                        )}
                        <button 
                            onClick={onClose} 
                            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="Close"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
    
                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-md w-full">
                            <div className="flex items-start">
                                <div className="bg-red-100 p-2 rounded-full mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm Deletion</h3>
                                    <p className="text-gray-600 mb-4">Are you sure you want to delete this task? This action cannot be undone.</p>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center space-x-1"
                                        >
                                            <span>Delete Task</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
    
                {/* Content Section */}
                {editMode ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <div className="border-b border-gray-100 pb-2">
                                    <h3 className="font-semibold text-gray-700">Task Information</h3>
                                </div>
                                <div className="space-y-3">
                                <div className="grid grid-cols-1 ">
                                                                <ul className="space-y-2">
                                {projects.map((project) => (
                                    <li
                                    key={project.id}
                                    className={`rounded-md py-2 px-4 ${
                                        selectedProject === project.id ? 'bg-teal-100 text-black text-2xl font-semibold' : 'text-gray-700'
                                    }`}
                                    >
                                    {project.name}
                                    </li>
                                ))}
                                </ul>
                            </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                                        <input 
                                            type="text" 
                                            name="task_title" 
                                            placeholder="Task Title" 
                                            value={editedTask.task_title} 
                                            onChange={handleChange} 
                                            required 
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea 
                                            name="description" 
                                            placeholder="Description" 
                                            value={editedTask.description} 
                                            onChange={handleChange} 
                                            required 
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            rows="3"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
    
                            {/* Status & Dates */}
                            <div className="space-y-4">
                                <div className="border-b border-gray-100 pb-2">
                                    <h3 className="font-semibold text-gray-700">Status & Timeline</h3>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            name="status"
                                            value={editedTask.status}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Completion</label>
                                        <input 
                                            type="datetime-local" 
                                            name="estimated_completion_datetime" 
                                            value={editedTask.estimated_completion_datetime || ''} 
                                            onChange={handleChange} 
                                            required 
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Shift</label>
                                        <input 
                                            type="text" 
                                            name="assigned_shift" 
                                            placeholder="Assigned Shift" 
                                            value={editedTask.assigned_shift} 
                                            onChange={handleChange} 
                                            required 
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
    
                        {/* Assigned Workers */}
                        <div>
                            <div className="border-b border-gray-100 pb-2 mb-3">
                                <h3 className="font-semibold text-gray-700">Assigned Workers</h3>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                                <select 
                                    name="assigned_to" 
                                    multiple 
                                    value={editedTask.assigned_to} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full p-2 border-0 focus:ring-0"
                                >
                                    {!selectedProject ? (
                                        <option disabled>Select a project first</option>
                                    ) : projectWorkers.length === 0 ? (
                                        <option disabled>No workers in this project</option>
                                    ) : (
                                        projectWorkers.map((worker) => (
                                            <option key={worker} value={worker} className="p-2 hover:bg-gray-50 rounded">
                                                {worker}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple workers</p>
                        </div>
    
                        {/* Form Actions */}
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setEditMode(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Discard Changes
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-1"
                                disabled={isLoading}
                            >
                                <span>{isLoading ? 'Updating...' : 'Update Task'}</span>
                                {!isLoading && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Task Details */}
                            <div className="space-y-4">
                                <div className="border-b border-gray-100 pb-2">
                                    <h3 className="font-semibold text-gray-700">Task Details</h3>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Project</span>
                                        <p className="mt-1 text-gray-800">{projects.find(p => p.id === task.project)?.name || 'No Project'}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Task Title</span>
                                        <p className="mt-1 text-gray-800">{task.task_title}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Description</span>
                                        <p className="mt-1 text-gray-800">{task.description || 'No description'}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Assigned Workers</span>
                                        <div className="mt-1">
                                            {task.assigned_to && task.assigned_to.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {task.assigned_to.map((worker, index) => (
                                                        <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
                                                            {worker}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-400">Not Assigned</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
    
                            {/* Status & Timeline */}
                            <div className="space-y-4">
                                <div className="border-b border-gray-100 pb-2">
                                    <h3 className="font-semibold text-gray-700">Status & Timeline</h3>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Status</span>
                                        <div className="mt-1">
                                            <span className={`inline-flex items-center gap-1 ${
                                                task.status === 'pending' ? 'text-red-600' :
                                                task.status === 'in_progress' ? 'text-yellow-600' :
                                                'text-green-600'
                                            }`}>
                                                <span className={`h-2 w-2 rounded-full ${
                                                    task.status === 'pending' ? 'bg-red-500' :
                                                    task.status === 'in_progress' ? 'bg-yellow-500' :
                                                    'bg-green-500'
                                                }`}></span>
                                                {task.status ? task.status.replace('_', ' ').toUpperCase() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Due Date</span>
                                        <p className="mt-1 text-gray-800">{task.estimated_completion_datetime ? formatDateTime(task.estimated_completion_datetime) : 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Assigned Shift</span>
                                        <p className="mt-1 text-gray-800">{task.assigned_shift || 'N/A'}</p>
                                    </div>
                                </div>
                                
                                {/* Timeline */}
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">Task Timeline</h3>
                                    <ol className="relative border-s border-gray-200">
                                        <li className="mb-6 ms-4">
                                            <div className="absolute w-3 h-3 bg-blue-500 rounded-full mt-1.5 -start-1.5 border border-white"></div>
                                            <time className="mb-1 text-sm font-normal leading-none text-gray-500">
                                                {formatDateTimeForTimeline(task.created_at)}
                                            </time>
                                            <h3 className="text-base font-semibold text-gray-900">Task Created</h3>
                                            <p className="text-sm font-normal text-gray-500">
                                                Task was created by {task.assigned_by || 'system'}
                                            </p>
                                        </li>

                                        {task.status_changed_at && (
                                            <li className="mb-6 ms-4">
                                                <div className="absolute w-3 h-3 bg-green-500 rounded-full mt-1.5 -start-1.5 border border-white"></div>
                                                <time className="mb-1 text-sm font-normal leading-none text-gray-500">
                                                    {formatDateTimeForTimeline(task.status_changed_at)}
                                                </time>
                                                <h3 className="text-base font-semibold text-gray-900">Status Changed</h3>
                                                <p className="text-sm font-normal text-gray-500">
                                                    Status was changed to {task.status.replace('_', ' ').toUpperCase()}
                                                </p>
                                            </li>
                                        )}

                                        {task.updated_at && 
                                            (!task.created_at || new Date(task.updated_at).getTime() !== new Date(task.created_at).getTime()) &&
                                            (!task.status_changed_at || new Date(task.updated_at).getTime() !== new Date(task.status_changed_at).getTime()) && (
                                            <li className="mb-6 ms-4">
                                                <div className="absolute w-3 h-3 bg-purple-500 rounded-full mt-1.5 -start-1.5 border border-white"></div>
                                                <time className="mb-1 text-sm font-normal leading-none text-gray-500">
                                                    {formatDateTimeForTimeline(task.updated_at)}
                                                </time>
                                                <h3 className="text-base font-semibold text-gray-900">Task Updated</h3>
                                                <p className="text-sm font-normal text-gray-500">
                                                    Task details were modified
                                                </p>
                                            </li>
                                        )}
                                    </ol>
                                </div>
                            </div>
                        </div>

                        {/* View Mode Actions */}
                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssignTaskPage;