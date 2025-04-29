// ReportsDashboard.js
import React, { useState, useEffect } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { getProjectStats, getProjects,logout } from '../../endpoints/api';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/images/LaborSynclogo.png';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ReportsDashboard = () => {
  const [productivityData, setProductivityData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('productivity');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [workerStats, projectList] = await Promise.all([
          getProjectStats(),
          getProjects()
        ]);
        
        setProductivityData(Array.isArray(workerStats) ? workerStats : []);
        setProjects(Array.isArray(projectList) ? projectList : []);
      } catch (err) {
        setError(err.message || 'Failed to load data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Worker productivity chart data
  const productivityChartData = {
    labels: productivityData.map(worker => worker.username || 'Unknown'),
    datasets: [
      {
        label: 'Productivity %',
        data: productivityData.map(worker => worker.productivity || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  // Project status chart data
  const getStatusData = () => {
    const statusCounts = {
      active: 0,
      completed: 0,
      on_hold: 0
    };

    projects.forEach(project => {
      if (statusCounts.hasOwnProperty(project.status)) {
        statusCounts[project.status]++;
      }
    });

    return {
      labels: ['Active', 'Completed', 'On Hold'],
      datasets: [
        {
          data: [statusCounts.active, statusCounts.completed, statusCounts.on_hold],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  const handleLogout = async () => {
         try {
            await logout();
            navigate('/login-manager');
         } catch (error) {
            console.error("Error during logout:", error);
           
         }
       };

  return (
    <div className="flex h-screen bg-gray-50 font-['Poppins']">
      {/* Side Panel */}
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
      <div className="p-6 w-full">
        <h2 className="text-2xl font-bold mb-6">Performance Dashboard</h2>

        {/* Tab Navigation */}
        <div className="flex border-b mb-6">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'productivity' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('productivity')}
          >
            Worker Productivity
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'projects' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('projects')}
          >
            Project Status
          </button>
        </div>

        {/* Productivity Tab */}
        {activeTab === 'productivity' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Worker Productivity</h3>
                <div className="h-80">
                  {productivityData.length > 0 ? (
                    <Bar 
                      data={productivityChartData} 
                      options={{ 
                        responsive: true, 
                        maintainAspectRatio: false, 
                        scales: { 
                          y: { 
                            beginAtZero: true, 
                            max: 100, 
                            title: { 
                              display: true, 
                              text: 'Percentage' 
                            } 
                          } 
                        }
                      }} 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      No productivity data available
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
                <div className="space-y-4">
                  {productivityData
                    .sort((a, b) => (b.productivity || 0) - (a.productivity || 0))
                    .slice(0, 5)
                    .map((worker, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <span className="font-medium mr-2">{index + 1}.</span>
                          <span>{worker.username || 'Unknown'}</span>
                        </div>
                        <span className={`font-bold ${(worker.productivity || 0) >= 75 ? 'text-green-600' : (worker.productivity || 0) >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {worker.productivity || 0}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="mt-8 bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Worker Productivity Data</h3>
              <div className="overflow-x-auto">
                {productivityData.length > 0 ? (
                  <table className="min-w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left">Worker</th>
                        <th className="px-4 py-2 text-left">Completed Tasks</th>
                        <th className="px-4 py-2 text-left">Total Tasks</th>
                        <th className="px-4 py-2 text-left">Productivity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productivityData.map((worker, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="px-4 py-2">{worker.username || 'Unknown'}</td>
                          <td className="px-4 py-2">{worker.completed_tasks || 0}</td>
                          <td className="px-4 py-2">{worker.total_tasks || 0}</td>
                          <td className={`px-4 py-2 font-medium ${(worker.productivity || 0) >= 75 ? 'text-green-600' : (worker.productivity || 0) >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {worker.productivity || 0}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-4">No worker productivity data available</div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Project Status Distribution</h3>
                <div className="h-80">
                  {projects.length > 0 ? (
                    <Doughnut 
                      data={getStatusData()} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                              }
                            }
                          }
                        }
                      }} 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      No project data available
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Project Status Summary</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                      <span className="font-medium">Active Projects</span>
                    </div>
                    <span className="font-bold">
                      {projects.filter(p => p.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                      <span className="font-medium">Completed Projects</span>
                    </div>
                    <span className="font-bold">
                      {projects.filter(p => p.status === 'completed').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                      <span className="font-medium">On Hold Projects</span>
                    </div>
                    <span className="font-bold">
                      {projects.filter(p => p.status === 'on_hold').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-500 rounded-full mr-2"></div>
                      <span className="font-medium">Total Projects</span>
                    </div>
                    <span className="font-bold">{projects.length}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Recent Projects</h3>
              {projects.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left">Project Name</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Budget</th>
                        <th className="px-4 py-2 text-left">Start Date</th>
                        <th className="px-4 py-2 text-left">End Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.slice(0, 5).map((project, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="px-4 py-2">{project.name}</td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              project.status === 'active' ? 'bg-green-100 text-green-800' :
                              project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-2">${project.budget}</td>
                          <td className="px-4 py-2">{new Date(project.start_date).toLocaleDateString()}</td>
                          <td className="px-4 py-2">{new Date(project.end_date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">No projects available</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsDashboard;