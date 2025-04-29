import React, { useState, useEffect } from 'react';
import { workersPoints,logout } from '../../endpoints/api';
import { useNavigate } from 'react-router-dom';
import logo from "../../assets/images/LaborSynclogo.png";

const WorkersPointsHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllPointsHistory = async () => {
      try {
        setLoading(true);
        // Instead of paginating, we'll fetch all data
        // You might need to modify the API to support this or handle multiple requests
        const response = await workersPoints(1, { all: true });
        setTransactions(response.transactions || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch points history');
      } finally {
        setLoading(false);
      }
    };

    fetchAllPointsHistory();
  }, []);

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
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
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
                  { label: "View Project", route: "/view-project" },
                  { label: "View Tasks", route: "/view-task" },
                  { label: "Rewards", route: "/worker-rewards", active: true },
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

    {/* Main Content */}
<div className="w-full md:w-5/6 p-6  font-['Poppins']">
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-2xl font-bold flex items-center">
      <i className="fas fa-history text-blue-500 mr-2"></i>
      Points Transaction History
    </h2>
    
    {!loading && !error && (
      <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
        <i className="fas fa-chart-bar text-blue-500 mr-2"></i>
        <span className="text-lg font-semibold text-blue-700">
          Total records: <span className="text-red-600">{transactions.length}</span>
        </span>
      </div>
    )}
  </div>
  
  {loading ? (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ) : error ? (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md" role="alert">
      <p className="flex items-center">
        <i className="fas fa-exclamation-circle mr-2"></i>
        {error}
      </p>
    </div>
  ) : (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <i className="far fa-calendar-alt mr-1"></i> Date & Time
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <i className="fas fa-exchange-alt mr-1"></i> Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <i className="fas fa-coins mr-1"></i> Points
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <i className="far fa-file-alt mr-1"></i> Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <i className="fas fa-tasks mr-1"></i> Related Task
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <i className="fas fa-gift mr-1"></i> Reward
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <i className="far fa-clock text-gray-400 mr-1"></i>
                    {new Date(transaction.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${transaction.transaction_type === 'redeem' ? 
                        'bg-red-100 text-red-800' : 
                        'bg-green-100 text-green-800'}`}>
                      {transaction.transaction_type === 'redeem' ? 
                        <i className="fas fa-arrow-down mr-1"></i> : 
                        <i className="fas fa-arrow-up mr-1"></i>}
                      {transaction.transaction_type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium
                    ${transaction.points < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    <i className={`mr-1 ${transaction.points < 0 ? 'fas fa-minus-circle' : 'fas fa-plus-circle'}`}></i>
                    {transaction.points > 0 ? `+${transaction.points}` : transaction.points}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <i className="far fa-comment-dots text-gray-400 mr-2"></i>
                      {transaction.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {transaction.related_task ? (
                      <div className="flex items-start">
                        <i className="fas fa-clipboard-check text-blue-400 mt-1 mr-2"></i>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.task_title}</p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <i className="far fa-clock mr-1"></i>
                            {transaction.related_task.assigned_shift} Shift
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {transaction.reward_details ? (
                      <div className="flex items-center">
                        <i className={`fas ${transaction.reward_details.type === 'bonus' ? 
                          'fa-money-bill-wave text-green-500' : 
                          'fa-umbrella-beach text-amber-500'} mr-2`}></i>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border 
                          ${transaction.reward_details.type === 'bonus' ? 
                            'border-green-200 text-green-800' : 
                            'border-gray-200 text-gray-800'}`}>
                          {transaction.reward_details.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <i className="fas fa-inbox text-gray-300 text-4xl mb-2"></i>
                    <p className="text-gray-500">No transactions found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )}
</div>
       
      </div>
 
  );
};

export default WorkersPointsHistory;