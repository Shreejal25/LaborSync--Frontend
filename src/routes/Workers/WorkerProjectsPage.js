import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { getProjects,logout } from '../../endpoints/api';
import logo from "../../assets/images/LaborSynclogo.png";

const WorkerProjectsPage = () => {
    const { userProfile ,userTasks, fetchUserTasks } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [tasksWithProjectNames, setTasksWithProjectNames] = useState([]);

    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleDateString();
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                if (userProfile?.user?.username) {
                    const projectsData = await getProjects(userProfile.user.username);
                    setProjects(projectsData);
                }
                await fetchUserTasks();
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [userProfile?.user?.username, fetchUserTasks]);

    useEffect(() => {
        if (userTasks.length > 0 && projects.length > 0) {
            const updatedTasks = userTasks.map(task => {
                const project = projects.find(p => 
                    p.id == task.project || 
                    p.id == task.project_id
                );
                return {
                    ...task,
                    projectName: project?.name || 'Unknown Project',
                    projectStatus: project?.status
                };
            });
            setTasksWithProjectNames(updatedTasks);
        }
    }, [userTasks, projects]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center text-gray-600">Loading your projects...</div>
            </div>
        );
    }
     const handleLogout = async () => {
         try {
            await logout();
            navigate('/login');
         } catch (error) {
            console.error("Error during logout:", error);
            showNotification("Error during logout", "error");
         }
       };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
             <aside className="w-1/6 bg-white shadow-md flex flex-col sticky top-0 h-screen  font-['Poppins']">
                                <div className="flex items-center justify-center py-4 border-b">
                                  <img src={logo} alt="LaborSync Logo" className="w-36 h-auto" />
                                </div>
                                <nav className="flex-grow overflow-y-auto">
                                  <ul className="flex flex-col py-4">
                                    {[
                                      { label: "Dashboard", route: "/menu" },
                                      { label: "Timesheets", route: "/timesheets" },
                                      { label: "View Project", route: "/view-project", active: true },
                                      { label: "View Tasks", route: "/view-task"  },
                                      { label: "Rewards", route: "/worker-rewards" },
                                      { label: "Worker Details", route: "/user-profile"},
                                    ].map(({ label, route, active }) => (
                                      <li
                                        key={label}
                                        className={`flex items-center px-6 py-2 hover:bg-gray-200 cursor-pointer transition-colors duration-200 ${active ? "bg-gray-200 font-medium" : ""}`}
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
                                   className="w-full bg-red-500 text-black py-2 rounded hover:bg-gray-300 transition duration-200"
                                  >
                                    Logout
                                  </button>
                                </div>
                              </aside>

            {/* Main Content */}
            <main className="w-full min-h-screen py-1 md:w-2/3 lg:w-3/4  font-['Poppins']">
                <div className="p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold">My Projects</h1>
                        <p className="text-gray-600">View all projects you're currently assigned to</p>
                    </div>

                    {projects.length > 0 ? (
                        <div className="bg-white p-6 rounded shadow-md">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {projects.map((project) => (
                                    <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-lg mb-2">{project.name}</h3>
                                            <button 
                                                onClick={() => {
                                                    setSelectedProject(project);
                                                    setShowDetailsModal(true);
                                                }}
                                                className="text-blue-500 hover:text-blue-700"
                                                title="View Details"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="flex items-center">
                                                <span className="text-gray-500 mr-2">Status:</span>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    project.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                                </span>
                                            </p>
                                            <p><span className="text-gray-500">Location:</span> {project.location}</p>
                                            <p><span className="text-gray-500">Start Date:</span> {formatDate(project.start_date)}</p>
                                            <p><span className="text-gray-500">End Date:</span> {formatDate(project.end_date)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded shadow-md text-center">
                            <p className="text-gray-500 mb-4">You are not currently assigned to any projects</p>
                            <button 
                                onClick={() => navigate('/worker-schedule')} 
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                View My Schedule
                            </button>
                        </div>
                    )}
                </div>

                {/* Project Details Modal */}
                {showDetailsModal && selectedProject && (
                    <ProjectDetailsModal 
                        project={selectedProject}
                        tasks={tasksWithProjectNames.filter(task => task.project === selectedProject.id)}
                        onClose={() => setShowDetailsModal(false)}
                    />
                )}
            </main>
        </div>
    );
};

// Project Details Modal Component
const ProjectDetailsModal = ({ project, tasks, onClose }) => {
    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/A';
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(isoString).toLocaleDateString('en-US', options);
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

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-100">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{project.name}</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Last updated: {formatDateTime(project.updated_at)}
                        </p>
                    </div>
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

                <div className="space-y-6">
                    {/* Project Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="border-b border-gray-100 pb-2">
                                <h3 className="font-semibold text-gray-700">Overview</h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Status</span>
                                    <div className="mt-1">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            project.status === 'active' ? 'bg-green-100 text-green-800' :
                                            project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                            'bg-amber-100 text-amber-800'
                                        }`}>
                                            {project.status.replace('_', ' ').split(' ').map(word => 
                                                word.charAt(0).toUpperCase() + word.slice(1)
                                            ).join(' ')}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Location</span>
                                    <p className="mt-1 text-gray-800">{project.location || '-'}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Created</span>
                                    <p className="mt-1 text-gray-800">{formatDateTime(project.created_at)}</p>
                                </div>

                                <label className="block text-sm font-medium text-gray-700">Current Document</label>
                {project.documents ? (
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                        <div className="flex items-center text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span className="font-medium">{project.documents.replace('/media/projects/documents/', '')}</span>
                        </div>
                        <a 
                            href={`http://localhost:8000/media/projects/documents/${project.documents.replace('/media/projects/documents/', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center space-x-2 mt-2 text-sm font-medium"
                        >
                            <span>View PDF</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                ) : (
                    <span className="inline-block py-2 px-3 bg-gray-100 text-gray-500 rounded">No document attached</span>
                )}
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-4">
                            <div className="border-b border-gray-100 pb-2">
                                <h3 className="font-semibold text-gray-700">Project Timeline</h3>
                            </div>
                            <ol className="relative border-s border-gray-200">
                                <li className="mb-6 ms-4">
                                    <div className="absolute w-3 h-3 bg-blue-500 rounded-full mt-1.5 -start-1.5 border border-white"></div>
                                    <time className="mb-1 text-sm font-normal leading-none text-gray-500">
                                        {formatDateTimeForTimeline(project.created_at)}
                                    </time>
                                    <h3 className="text-base font-semibold text-gray-900">Project Created</h3>
                                    <p className="text-sm font-normal text-gray-500">
                                        Project was initialized
                                    </p>
                                </li>

                                {project.start_date && (
                                    <li className="mb-6 ms-4">
                                        <div className="absolute w-3 h-3 bg-green-500 rounded-full mt-1.5 -start-1.5 border border-white"></div>
                                        <time className="mb-1 text-sm font-normal leading-none text-gray-500">
                                            {formatDateTimeForTimeline(project.start_date)}
                                        </time>
                                        <h3 className="text-base font-semibold text-gray-900">Project Started</h3>
                                        <p className="text-sm font-normal text-gray-500">
                                            Work began on the project
                                        </p>
                                    </li>
                                )}

                                {project.updated_at && (
                                        <li className="mb-6 ms-4">
                                            <div className="absolute w-3 h-3 bg-amber-500 rounded-full mt-1.5 -start-1.5 border border-white"></div>
                                            <time className="mb-1 text-sm font-normal leading-none text-gray-500">
                                                {formatDateTimeForTimeline(project.updated_at)}
                                            </time>
                                            <h3 className="text-base font-semibold text-gray-900">Status Changed</h3>
                                            <p className="text-sm font-normal text-gray-500">
                                                Project status was changed to{' '}
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    project.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-amber-100 text-amber-800'
                                                }`}>
                                                     {project.status.replace('_', ' ').split(' ').map(word => 
                                                    word.charAt(0).toUpperCase() + word.slice(1)
                                                ).join(' ')}
                                                    
                                                </span>
                                            </p>
                                        </li>
                                    )}

                            </ol>
                        </div>
                    </div>

                    {/* Project Description */}
                    <div>
                        <div className="border-b border-gray-100 pb-2">
                            <h3 className="font-semibold text-gray-700">Description</h3>
                        </div>
                        <div className="mt-3 bg-gray-50 rounded-lg p-4">
                            {project.description ? (
                                <p className="text-gray-700 whitespace-pre-line">{project.description}</p>
                            ) : (
                                <p className="text-gray-400 italic">No description provided</p>
                            )}
                        </div>
                    </div>

                    {/* Tasks Section */}
                    <div>
                        <div className="border-b border-gray-100 pb-2">
                            <h3 className="font-semibold text-gray-700">Your Tasks</h3>
                        </div>
                        {tasks.length > 0 ? (
                            <div className="mt-3 space-y-3">
                                {tasks.map((task) => (
                                    <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium text-gray-800">{task.task_title}</h4>
                                                {task.description && (
                                                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                                )}
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded ${
                                                task.status === 'pending' ? 'bg-red-100 text-red-800' :
                                                task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {task.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between text-sm">
                                            <div>
                                                <span className="text-gray-500">Due:</span> {formatDateTime(task.estimated_completion_datetime)}
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Shift:</span> {task.assigned_shift || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-3 text-center py-4 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">No tasks assigned to you in this project</p>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkerProjectsPage;