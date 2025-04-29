import React, { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { getWorkers, getProjects, getManagerDashboard } from '../../endpoints/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const ProjectStatus = () => {
  const [workers, setWorkers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workerList, projectList, dashboardData] = await Promise.all([
          getWorkers(),
          getProjects(),
          getManagerDashboard()
        ]);

        setWorkers(workerList || []);
        setProjects(projectList || []);
        setTasks(dashboardData?.recent_tasks || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleWorkerSelect = (worker) => {
    setSelectedWorker(selectedWorker?.id === worker.id ? null : worker);
  };

  const calculateProductivity = () => {
    return workers.map(worker => {
      const workerTasks = tasks.filter(task => 
        task.assigned_to?.includes(worker.user.username)
      );
      
      const completedTasks = workerTasks.filter(task => 
        task.status === 'completed'
      ).length;

      const inProgressTasks = workerTasks.filter(task => 
        task.status === 'in_progress'
      ).length;

      const pendingTasks = workerTasks.filter(task => 
        task.status === 'pending'
      ).length;

      const totalTasks = workerTasks.length;

      // Calculate average completion time for completed tasks
      let avgCompletionTime = 0;
      const completedWithDates = workerTasks.filter(task => 
        task.status === 'completed' && task.completed_at && task.created_at
      );
      
      if (completedWithDates.length > 0) {
        const totalDays = completedWithDates.reduce((sum, task) => {
          const created = new Date(task.created_at);
          const completed = new Date(task.completed_at);
          return sum + (completed - created) / (1000 * 60 * 60 * 24);
        }, 0);
        avgCompletionTime = totalDays / completedWithDates.length;
      }

      return {
        ...worker,
        username: worker.user.username,
        name: `${worker.user.first_name} ${worker.user.last_name}`,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        totalTasks,
        avgCompletionTime: avgCompletionTime.toFixed(1)
      };
    }).filter(worker => worker.totalTasks > 0); // Only show workers with tasks
  };

  const productivityData = calculateProductivity();

  // Overall completion rate chart data
  const completionRateChartData = {
    labels: productivityData.map(worker => worker.name),
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: productivityData.map(worker => worker.completionRate),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }
    ]
  };

  // Tasks breakdown chart data
  const tasksBreakdownChartData = {
    labels: productivityData.map(worker => worker.name),
    datasets: [
      {
        label: 'Completed',
        data: productivityData.map(worker => worker.completedTasks),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'In Progress',
        data: productivityData.map(worker => worker.inProgressTasks),
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
      },
      {
        label: 'Pending',
        data: productivityData.map(worker => worker.pendingTasks),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      }
    ]
  };

  // Average completion time chart data
  const completionTimeChartData = {
    labels: productivityData.map(worker => worker.name),
    datasets: [
      {
        label: 'Average Completion Time (Days)',
        data: productivityData.map(worker => worker.avgCompletionTime),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      }
    ]
  };

  // Worker distribution pie chart
  const workerDistributionData = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [
      {
        data: [
          productivityData.reduce((sum, worker) => sum + worker.completedTasks, 0),
          productivityData.reduce((sum, worker) => sum + worker.inProgressTasks, 0),
          productivityData.reduce((sum, worker) => sum + worker.pendingTasks, 0)
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1,
      }
    ]
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center text-gray-600">Loading worker productivity data...</div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
      <p className="font-bold">Error</p>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Worker Productivity Dashboard</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 rounded ${timeRange === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 rounded ${timeRange === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1 rounded ${timeRange === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            All Time
          </button>
        </div>
      </div>

      <div className="mb-6 border-b">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-4 font-medium ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('detailed')}
            className={`py-2 px-4 font-medium ${activeTab === 'detailed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            Detailed View
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`py-2 px-4 font-medium ${activeTab === 'comparison' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            Team Comparison
          </button>
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Task Completion Rates</h3>
            <div className="h-64">
              <Bar 
                data={completionRateChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        callback: function(value) {
                          return value + '%';
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Task Distribution</h3>
            <div className="h-64">
              <Pie 
                data={workerDistributionData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false 
                }} 
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'detailed' && selectedWorker && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">{selectedWorker.name}'s Productivity</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white p-3 rounded shadow">
                <p className="text-sm text-gray-500">Total Tasks</p>
                <p className="text-2xl font-bold">{selectedWorker.totalTasks}</p>
              </div>
              <div className="bg-white p-3 rounded shadow">
                <p className="text-sm text-gray-500">Completion Rate</p>
                <p className="text-2xl font-bold">{selectedWorker.completionRate}%</p>
              </div>
              <div className="bg-white p-3 rounded shadow">
                <p className="text-sm text-gray-500">Avg. Completion Time</p>
                <p className="text-2xl font-bold">{selectedWorker.avgCompletionTime} days</p>
              </div>
            </div>
            <div className="h-64">
              <Bar 
                data={{
                  labels: ['Completed', 'In Progress', 'Pending'],
                  datasets: [{
                    label: 'Tasks',
                    data: [
                      selectedWorker.completedTasks,
                      selectedWorker.inProgressTasks,
                      selectedWorker.pendingTasks
                    ],
                    backgroundColor: [
                      'rgba(75, 192, 192, 0.6)',
                      'rgba(255, 206, 86, 0.6)',
                      'rgba(255, 99, 132, 0.6)'
                    ],
                    borderColor: [
                      'rgba(75, 192, 192, 1)',
                      'rgba(255, 206, 86, 1)',
                      'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                  }]
                }} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'comparison' && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Task Breakdown by Worker</h3>
            <div className="h-96">
              <Bar 
                data={tasksBreakdownChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      stacked: true,
                    },
                    y: {
                      stacked: true,
                      beginAtZero: true
                    }
                  }
                }} 
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Average Completion Time</h3>
            <div className="h-64">
              <Line 
                data={completionTimeChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Days'
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'detailed' && !selectedWorker && (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <h3 className="text-lg font-semibold mb-2">Select a Worker to View Details</h3>
          <p className="text-gray-600 mb-4">Click on a worker below to see their detailed productivity metrics</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productivityData.map(worker => (
              <div 
                key={worker.id} 
                onClick={() => handleWorkerSelect(worker)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedWorker?.id === worker.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300 hover:bg-gray-100'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{worker.name}</h4>
                    <p className="text-sm text-gray-500">{worker.username}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    worker.completionRate >= 75 ? 'bg-green-100 text-green-800' :
                    worker.completionRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {worker.completionRate}%
                  </span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span>{worker.totalTasks} tasks</span>
                  <span>Avg. {worker.avgCompletionTime} days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab !== 'detailed' && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Worker Productivity Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border border-gray-300 text-left">Worker</th>
                  <th className="px-4 py-2 border border-gray-300">Total Tasks</th>
                  <th className="px-4 py-2 border border-gray-300">Completed</th>
                  <th className="px-4 py-2 border border-gray-300">In Progress</th>
                  <th className="px-4 py-2 border border-gray-300">Pending</th>
                  <th className="px-4 py-2 border border-gray-300">Completion Rate</th>
                  <th className="px-4 py-2 border border-gray-300">Avg. Days</th>
                </tr>
              </thead>
              <tbody>
                {productivityData.map((worker, index) => (
                  <tr 
                    key={index} 
                    className={`hover:bg-gray-100 ${activeTab === 'detailed' ? 'cursor-pointer' : ''}`}
                    onClick={() => activeTab === 'detailed' ? handleWorkerSelect(worker) : null}
                  >
                    <td className="px-4 py-2 border border-gray-300">
                      <div className="flex items-center">
                        <div className="mr-2 w-2 h-2 rounded-full bg-blue-500"></div>
                        {worker.name}
                      </div>
                    </td>
                    <td className="px-4 py-2 border border-gray-300 text-center">{worker.totalTasks}</td>
                    <td className="px-4 py-2 border border-gray-300 text-center text-green-600">{worker.completedTasks}</td>
                    <td className="px-4 py-2 border border-gray-300 text-center text-yellow-600">{worker.inProgressTasks}</td>
                    <td className="px-4 py-2 border border-gray-300 text-center text-red-600">{worker.pendingTasks}</td>
                    <td className="px-4 py-2 border border-gray-300 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        worker.completionRate >= 75 ? 'bg-green-100 text-green-800' :
                        worker.completionRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {worker.completionRate}%
                      </span>
                    </td>
                    <td className="px-4 py-2 border border-gray-300 text-center">{worker.avgCompletionTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectStatus;