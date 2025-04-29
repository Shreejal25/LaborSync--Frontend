import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { getWorkers, getManagerDashboard, getProjects, updateProject, deleteProject,logout } from '../../endpoints/api';
import logo from "../../assets/images/LaborSynclogo.png";

const CreateProjectPage = () => {
    const { createNewProject } = useAuth();
    const [workers, setWorkers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [clockHistory, setClockHistory] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('projects');
    const [selectedProject, setSelectedProject] = useState(null);
    const [showProjectDetailsModal, setShowProjectDetailsModal] = useState(false);
    const navigate = useNavigate();

    const formatDateTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString();
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
                    setClockHistory(dashboardData.clock_history || []);
                }
                
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

     const handleLogout = async () => {
                 try {
                    await logout();
                    navigate('/login-manager');
                 } catch (error) {
                    console.error("Error during logout:", error);
                   
                 }
               };

    const handleProjectCreated = async () => {
        try {
            const updatedProjects = await getProjects();
            setProjects(updatedProjects);
            setShowModal(false);
        } catch (error) {
            console.error('Error refreshing projects:', error);
        }
    };

    const refreshProjects = async () => {
        try {
            const updatedProjects = await getProjects();
            setProjects(updatedProjects);
        } catch (error) {
            console.error('Error refreshing projects:', error);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">
            <div className="text-center text-gray-600">Loading...</div>
        </div>;
    }

    return (
        <div className="flex h-screen bg-gray-5 font-['Poppins']">
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

            {/* Main Content */}
            <main className="w-full min-h-screen py-1 md:w-2/3 lg:w-3/4">
                <div className="p-8">
                <div className="mb-6">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-xl font-extrabold text-gray-800 font-['Poppins']">Project Management</h1>
                            <button
                            onClick={() => setShowModal(true)}
                            className="bg-blue-700 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-500 transition-colors font-['Poppins']"
                            >
                            Create New Project
                            </button>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex border-b border-gray-100 mb-6">
                            <button
                            className={`py-2 px-4 text-sm font-['Poppins'] ${
                                activeTab === 'projects' 
                                ? 'text-gray-800 border-b-2 border-gray-800 font-medium' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={() => setActiveTab('projects')}
                            >
                            Projects
                            </button>
                            <button
                            className={`py-2 px-4 text-sm font-['Poppins'] ${
                                activeTab === 'tasks' 
                                ? 'text-gray-800 border-b-2 border-gray-800 font-medium' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={() => setActiveTab('tasks')}
                            >
                            Recent Tasks
                            </button>
                            <button
                            className={`py-2 px-4 text-sm font-['Poppins'] ${
                                activeTab === 'workers' 
                                ? 'text-gray-800 border-b-2 border-gray-800 font-medium' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={() => setActiveTab('workers')}
                            >
                            Workers
                            </button>
                        </div>
                        </div>

                    {/* Projects Tab */}
                    {activeTab === 'projects' && (
                       <div className="bg-white rounded-md shadow-sm border border-gray-100 mb-4">
                       <div className="px-5 py-3 border-b border-gray-100">
                         <h2 className="text-lg font-extrabold text-gray-800 font-['Poppins']">Current Projects</h2>
                       </div>
                     
                       {projects.length > 0 ? (
                         <div className="overflow-x-auto">
                           <table className="min-w-full divide-y divide-gray-100">
                             <thead className="bg-gray-200">
                               <tr>
                                 <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wide font-['Poppins']">Project Name</th>
                                 <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wide font-['Poppins']">Status</th>
                                 <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wide font-['Poppins']">Budget</th>
                                 <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wide font-['Poppins']">Start Date</th>
                                 <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wide font-['Poppins']">End Date</th>
                                 <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wide font-['Poppins']">Location</th>
                                 <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wide font-['Poppins']">Assigned Workers</th>
                               </tr>
                             </thead>
                             <tbody className="bg-white divide-y divide-gray-100">
                               {projects.map((project) => (
                                 <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                                   <td className="px-4 py-3 text-sm font-medium text-gray-800 font-['Poppins'] flex items-center">
                                     {project.name}
                                     <button 
                                       onClick={() => {
                                         setSelectedProject(project);
                                         setShowProjectDetailsModal(true);
                                       }}
                                       className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                                       title="View Details"
                                     >
                                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                         <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                         <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                       </svg>
                                     </button>
                                   </td>
                                   <td className="px-4 py-3">
                                     <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full font-['Poppins'] ${
                                       project.status === 'active' ? 'bg-green-50 text-green-700' :
                                       project.status === 'completed' ? 'bg-blue-50 text-blue-700' :
                                       'bg-yellow-50 text-yellow-700'
                                     }`}>
                                       {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                     </span>
                                   </td>
                                   <td className="px-4 py-3 text-sm text-gray-700 font-['Poppins']">${project.budget}</td>
                                   <td className="px-4 py-3 text-sm text-gray-600 font-['Poppins']">{formatDateTime(project.start_date)}</td>
                                   <td className="px-4 py-3 text-sm text-gray-600 font-['Poppins']">{formatDateTime(project.end_date)}</td>
                                   <td className="px-4 py-3 text-sm text-gray-600 font-['Poppins']">{project.location}</td>
                                   <td className="px-4 py-3">
                                     {project.workers && project.workers.length > 0 ? (
                                       <div className="flex flex-wrap gap-1">
                                         {project.workers.map((worker, index) => (
                                           <span key={index} className="bg-gray-50 px-2 py-0.5 rounded-full text-xs text-gray-600 font-['Poppins']">
                                             {worker}
                                           </span>
                                         ))}
                                       </div>
                                     ) : (
                                       <span className="text-gray-400 text-xs font-['Poppins']">No workers assigned</span>
                                     )}
                                   </td>
                                 </tr>
                               ))}
                             </tbody>
                           </table>
                         </div>
                       ) : (
                         <div className="px-4 py-8 text-center">
                           <svg className="mx-auto h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                           </svg>
                           <h3 className="mt-2 text-sm font-medium text-gray-700 font-['Poppins']">No projects</h3>
                           <p className="mt-1 text-xs text-gray-500 font-['Poppins']">Get started by creating a new project</p>
                         </div>
                       )}
                     </div>
                    )}

                    {/* Tasks Tab */}
                    {activeTab === 'tasks' && (
                      <div className="bg-white rounded-md shadow-sm border border-gray-100 mb-4">
                      <div className="px-5 py-3 border-b border-gray-100">
                        <h2 className="text-lg font-extrabold text-gray-800 font-['Poppins']">Recent Tasks</h2>
                      </div>
                    
                      {tasks.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-200">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wide font-['Poppins']">Project Name</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wide font-['Poppins']">Task Title</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wide font-['Poppins']">Description</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wide font-['Poppins']">Assigned Workers</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wide font-['Poppins']">Due Date</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wide font-['Poppins']">Status</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                              {tasks.map((task) => (
                                <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-4 py-3 text-sm text-gray-700 font-['Poppins']">
                                    {projects.find((project) => project.id === task.project)?.name || 'No Project'}
                                  </td>
                                  <td className="px-4 py-3 text-sm font-medium text-gray-800 font-['Poppins']">{task.task_title}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate font-['Poppins']">{task.description}</td>
                                  <td className="px-4 py-3">
                                    {task.assigned_to && task.assigned_to.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {task.assigned_to.map((worker, index) => (
                                          <span key={index} className="bg-gray-50 px-2 py-0.5 rounded-full text-xs text-gray-600 font-['Poppins']">
                                            {worker}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-gray-400 text-xs font-['Poppins']">Not Assigned</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600 font-['Poppins']">
                                    {task.estimated_completion_datetime ? formatDateTime(task.estimated_completion_datetime) : '—'}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 inline-flex items-center gap-1 text-xs rounded-full font-['Poppins'] ${
                                      task.status === 'pending' ? 'bg-red-50 text-red-700' :
                                      task.status === 'in_progress' ? 'bg-yellow-50 text-yellow-700' :
                                      'bg-green-50 text-green-700'
                                    }`}>
                                      <span className={`h-1.5 w-1.5 rounded-full ${
                                        task.status === 'pending' ? 'bg-red-500' :
                                        task.status === 'in_progress' ? 'bg-yellow-500' :
                                        'bg-green-500'
                                      }`}></span>
                                      {task.status ? task.status.replace('_', ' ') : '—'}
                                    </span>
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
                    )}

                    {/* Workers Tab */}
                    {activeTab === 'workers' && (
                        <div className="bg-white rounded-md shadow-sm border border-gray-100 mb-4">
                        <div className="px-5 py-3 border-b border-gray-100">
                          <h2 className="text-lg font-medium text-gray-800 font-['Poppins']">Worker Details</h2>
                        </div>
                      
                        {workers.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide font-['Poppins']">Username</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide font-['Poppins']">Full Name</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide font-['Poppins']">Email</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide font-['Poppins']">Phone</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide font-['Poppins']">Skills</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-100">
                                {workers.map((worker) => (
                                  <tr key={worker.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-800 font-['Poppins']">{worker.user.username}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700 font-['Poppins']">{worker.user.first_name} {worker.user.last_name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600 font-['Poppins']">{worker.user.email}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600 font-['Poppins']">{worker.phone_number || '—'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600 font-['Poppins']">
                                      {worker.skills ? (
                                        <div className="flex flex-wrap gap-1">
                                          {worker.skills.split(',').map((skill, index) => (
                                            <span key={index} className="bg-gray-50 px-2 py-0.5 rounded-full text-xs text-gray-600 font-['Poppins']">
                                              {skill.trim()}
                                            </span>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className="text-gray-400 text-xs font-['Poppins']">No skills listed</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="px-4 py-8 text-center">
                            <svg className="mx-auto h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-700 font-['Poppins']">No workers</h3>
                            <p className="mt-1 text-xs text-gray-500 font-['Poppins']">Add workers to see them listed here</p>
                          </div>
                        )}
                      </div>
                    )}
                </div>

                {/* Create Project Modal */}
                {showModal && (
                    <CreateProjectModal 
                        workers={workers}
                        onClose={() => setShowModal(false)}
                        onProjectCreated={handleProjectCreated}
                    />
                )}

                {/* Project Details Modal */}
                {showProjectDetailsModal && selectedProject && (
                    <ProjectDetailsModal 
                        project={selectedProject}
                        onClose={() => {
                            setShowProjectDetailsModal(false);
                            refreshProjects();
                        }}
                    />
                )}
            </main>
        </div>
    );
};

// CreateProjectModal Component
const CreateProjectModal = ({ workers, onClose, onProjectCreated }) => {
    const { createNewProject } = useAuth();
    const [newProjectData, setNewProjectData] = useState({
        name: '',
        workers: [],
        status: 'active',
        budget: '',
        start_date: '',
        end_date: '',
        location: '',
        documents: null,
        description:''
    });

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        
        if (type === 'checkbox' && name === 'workers') {
            const selectedWorkers = [...newProjectData.workers];
            if (checked) {
                selectedWorkers.push(value);
            } else {
                const index = selectedWorkers.indexOf(value);
                if (index > -1) {
                    selectedWorkers.splice(index, 1);
                }
            }
            setNewProjectData(prev => ({ ...prev, workers: selectedWorkers }));
        } else if (type === 'file') {
            setNewProjectData(prev => ({ ...prev, documents: files[0] }));
        } else {
            setNewProjectData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('name', newProjectData.name);
        formData.append('status', newProjectData.status);
        formData.append('budget', newProjectData.budget);
        formData.append('start_date', newProjectData.start_date);
        formData.append('end_date', newProjectData.end_date);
        formData.append('location', newProjectData.location);
        formData.append('description', newProjectData.description);
        if (newProjectData.documents) {
            formData.append('documents', newProjectData.documents);
        }
        newProjectData.workers.forEach(worker => {
            formData.append('workers', worker);
        });

        try {
            const result = await createNewProject(formData);
            if (result) {
                onProjectCreated();
            }
        } catch (error) {
            console.error('Error creating project:', error);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Create New Project</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-700 mb-2">Project Name*</label>
                            <input
                                type="text"
                                name="name"
                                value={newProjectData.name}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Status*</label>
                            <select
                                name="status"
                                value={newProjectData.status}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded"
                            >
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="on_hold">On Hold</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-700 mb-2">Budget*</label>
                            <input
                                type="number"
                                name="budget"
                                value={newProjectData.budget}
                                onChange={handleChange}
                                required
                                min="0"
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Location*</label>
                            <input
                                type="text"
                                name="location"
                                value={newProjectData.location}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-700 mb-2">Start Date*</label>
                            <input
                                type="date"
                                name="start_date"
                                value={newProjectData.start_date}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">End Date*</label>
                            <input
                                type="date"
                                name="end_date"
                                value={newProjectData.end_date}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Project Documents</label>
                        <input
                            type="file"
                            name="documents"
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Project Description</label>
                        <textarea
                            name="description"
                            value={newProjectData.description}
                            onChange={handleChange}
                            rows="4"
                            className="w-full p-2 border rounded"
                        ></textarea>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Assign Workers</label>
                        <div className="border rounded p-2 max-h-40 overflow-y-auto">
                            {workers.map((worker) => (
                                <div key={worker.user.username} className="flex items-center p-2 hover:bg-gray-100">
                                    <input
                                        type="checkbox"
                                        name="workers"
                                        value={worker.user.username}
                                        checked={newProjectData.workers.includes(worker.user.username)}
                                        onChange={handleChange}
                                        className="mr-2"
                                    />
                                    <label>
                                        {worker.user.username} ({worker.user.first_name} {worker.user.last_name})
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                        >
                            Create Project
                        </button>
                    </div>
                </form>
                
            </div>
        </div>
    );
};

// ProjectDetailsModal Component
const ProjectDetailsModal = ({ project, onClose }) => {
    const [editMode, setEditMode] = useState(false);
    const [editedProject, setEditedProject] = useState({
        ...project,
        workers: project.workers ? project.workers.map(w => w.id || w) : []
    });
    const [documentFile, setDocumentFile] = useState(null);
    const [workers, setWorkers] = useState([]);
    const [loadingWorkers, setLoadingWorkers] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        const fetchWorkers = async () => {
            setLoadingWorkers(true);
            try {
                const workerList = await getWorkers();
                setWorkers(workerList);
            } catch (error) {
                console.error('Error fetching workers:', error);
            } finally {
                setLoadingWorkers(false);
            }
        };
        
        if (editMode) {
            fetchWorkers();
        }
    }, [editMode]);

    useEffect(() => {
        setEditedProject({
            ...project,
            workers: project.workers ? project.workers.map(w => w.id || w) : []
        });
    }, [project]);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        
        if (type === 'file') {
            setDocumentFile(files[0]);
        } else if (type === 'checkbox' && name === 'workers') {
            const selectedWorkers = [...editedProject.workers];
            const username = value;
            
            if (checked) {
                if (!selectedWorkers.includes(username)) {
                    selectedWorkers.push(username);
                }
            } else {
                const index = selectedWorkers.indexOf(username);
                if (index > -1) {
                    selectedWorkers.splice(index, 1);
                }
            }
            setEditedProject(prev => ({ ...prev, workers: selectedWorkers }));
        } else {
            setEditedProject(prev => ({ ...prev, [name]: value }));
        }
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
            await deleteProject(project.id);
            onClose();
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const formData = new FormData();
        formData.append('name', editedProject.name);
        formData.append('description', editedProject.description);
        formData.append('location', editedProject.location);
        formData.append('status', editedProject.status);
        formData.append('start_date', editedProject.start_date);
        formData.append('end_date', editedProject.end_date);
        formData.append('budget', editedProject.budget);
        formData.append('created_by', editedProject.created_by);
    
        // Add document file if updated
        if (documentFile) {
            formData.append('documents', documentFile);
        }
    
        // Append each worker individually
        if (editedProject.workers && editedProject.workers.length > 0) {
            editedProject.workers.forEach(worker => {
                formData.append('workers', worker);
            });
        }
    
        try {
            const result = await updateProject(project.id, formData);
            if (result) onClose();
        } catch (error) {
            console.error('Error updating project:', error);
        }
    };
    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-100">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {editMode ? `Edit ${project.name}` : project.name}
                        </h2>
                        {!editMode && (
                            <p className="text-sm text-gray-500 mt-1">
                                Last updated: {formatDateTime(project.updated_at)}
                            </p>
                        )}
                    </div>
                    <div className="flex space-x-2">
                        {!editMode && (
                            <>
                                <button onClick={() => setEditMode(true)} className="bg-amber-100 text-amber-800 py-1.5 px-3 rounded-lg hover:bg-amber-200 text-sm">Edit</button>
                                <button onClick={() => setShowDeleteConfirm(true)} className="bg-red-100 text-red-800 py-1.5 px-3 rounded-lg hover:bg-red-200 text-sm">Delete</button>
                            </>
                        )}
                        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors" aria-label="Close">
                            ❌
                        </button>
                    </div>
                </div>

                {/* Delete Confirmation */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm Deletion</h3>
                            <p className="text-gray-600 mb-4">Are you sure you want to delete "{project.name}"?</p>
                            <div className="flex justify-end space-x-3">
                                <button onClick={() => setShowDeleteConfirm(false)} className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
                                <button onClick={handleDelete} className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">Delete Project</button>
                            </div>
                        </div>
                    </div>
                )}

{editMode ? (
    <form onSubmit={handleSubmit} encType="multipart/form-data" className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">Edit Project Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Project Name</label>
                <input 
                    name="name" 
                    value={editedProject.name} 
                    onChange={handleChange} 
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
                />
            </div>
            
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input 
                    name="location" 
                    value={editedProject.location} 
                    onChange={handleChange} 
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
                />
            </div>
            
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input 
                    name="start_date" 
                    type="date" 
                    value={editedProject.start_date} 
                    required 
                    
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
                />
            </div>
            
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input 
                    name="end_date" 
                    type="date" 
                    value={editedProject.end_date} 
                    required
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
                />
            </div>
            
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Budget</label>
                <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input 
                        name="budget" 
                        type="number" 
                        value={editedProject.budget} 
                        onChange={handleChange} 
                        required
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
                    />
                </div>
            </div>
            
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select 
                    name="status" 
                    value={editedProject.status} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors appearance-none bg-white"
                >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                </select>
            </div>
            
            <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                    name="description" 
                    value={editedProject.description} 
                    onChange={handleChange} 
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-vertical"
                ></textarea>
            </div>
            
            <div className="space-y-2 md:col-span-2">
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
                
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Change Document</label>
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                </svg>
                                <p className="mb-1 text-sm text-gray-500">Click to upload document</p>
                                <p className="text-xs text-gray-500">PDF, DOC, DOCX</p>
                            </div>
                            <input name="documents" type="file" onChange={handleChange} className="hidden" />
                        </label>
                    </div>
                </div>
            </div>
            
            <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Update/Choose Workers</label>
                <div className="border border-gray-300 rounded-md p-2 max-h-60 overflow-y-auto bg-white">
                    {workers.map((worker) => (
                        <div key={worker.user.username} className="flex items-center p-2 hover:bg-gray-50 rounded">
                            <input
                                type="checkbox"
                                name="workers"
                                value={worker.user.username}
                                checked={editedProject.workers.includes(worker.user.username)}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label className="ml-3 text-sm text-gray-700">
                                <span className="font-medium">{worker.user.username}</span> 
                                <span className="text-gray-500 ml-1">({worker.user.first_name} {worker.user.last_name})</span>
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="flex justify-end mt-8 border-t pt-4">
            <button 
                type="button" 
                onClick={() => setEditMode(false)} 
                className="mr-4 px-5 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Cancel
            </button>
            <button 
                type="submit" 
                className="px-5 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
                Save Changes
            </button>
        </div>
    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Information */}
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
                                        <span className="text-sm font-medium text-gray-500">Budget</span>
                                        <p className="mt-1 text-gray-800">${project.budget.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Location</span>
                                        <p className="mt-1 text-gray-800">{project.location || '-'}</p>
                                    </div>
                                    <div>
                                    <span className="text-sm font-medium text-gray-500">Documents</span>
                                    <div className="mt-1">
                                        {project.documents ? (
                                            <div>
                                                <span className="text-red-700">{project.documents.replace('/media/projects/documents/', '')}</span>
                                                <a 
                                                    href={`http://localhost:8000/media/projects/documents/${project.documents.replace('/media/projects/documents/', '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline flex items-center space-x-1 mt-2"
                                                >
                                                    <span>View PDF</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </a>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">None</span>
                                        )}
                                
                                </div>

                                </div>

                                                                    

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

                                    {project.status_changed_at && (
                                        <li className="mb-6 ms-4">
                                            <div className="absolute w-3 h-3 bg-purple-500 rounded-full mt-1.5 -start-1.5 border border-white"></div>
                                            <time className="mb-1 text-sm font-normal leading-none text-gray-500">
                                                {formatDateTimeForTimeline(project.status_changed_at)}
                                            </time>
                                            <h3 className="text-base font-semibold text-gray-900">Status Changed</h3>
                                            <p className="text-sm font-normal text-gray-500">
                                                Status was updated to {project.status.replace('_', ' ').toUpperCase()}
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



                                    {project.updated_at && 
                                        (!project.created_at || new Date(project.updated_at).getTime() !== new Date(project.created_at).getTime()) &&
                                        (!project.status_changed_at || new Date(project.updated_at).getTime() !== new Date(project.status_changed_at).getTime()) && (
                                        <li className="mb-6 ms-4">
                                            <div className="absolute w-3 h-3 bg-gray-500 rounded-full mt-1.5 -start-1.5 border border-white"></div>
                                            <time className="mb-1 text-sm font-normal leading-none text-gray-500">
                                                {formatDateTimeForTimeline(project.updated_at)}
                                            </time>
                                            <h3 className="text-base font-semibold text-gray-900">Project Updated</h3>
                                            <p className="text-sm font-normal text-gray-500">
                                                Project details were modified
                                            </p>
                                        </li>
                                    )}
                                </ol>
                            </div>
                        </div>
    
                        {/* Team Members */}
                        <div>
                            <div className="border-b border-gray-100 pb-2">
                                <h3 className="font-semibold text-gray-700">Assigned Workers</h3>
                            </div>
                            {project.workers && project.workers.length > 0 ? (
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {project.workers.map((worker, index) => (
                                        <div key={index} className="bg-gray-50 px-3 py-2 rounded-lg flex items-center">
                                            <div className="bg-blue-100 text-blue-800 h-8 w-8 rounded-full flex items-center justify-center mr-3 text-sm font-medium">
                                                {worker.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-gray-800">{worker}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-3 text-center py-4 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">No Workers assigned</p>
                                </div>
                            )}
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
export default CreateProjectPage;