

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getManagerRewards, deleteReward, updateReward, getWorkers,logout } from '../../endpoints/api';
import logo from "../../assets/images/LaborSynclogo.png";

const ManagerRewardsView = () => {
  const navigate = useNavigate();
  const [rewards, setRewards] = useState([]);
  const [workers, setWorkers] = useState([]); // New state for workers
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [rewardToDelete, setRewardToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]); // New state for selected users in edit modal

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rewardsResponse, workersResponse] = await Promise.all([
        getManagerRewards(),
        getWorkers()
      ]);
      setRewards(rewardsResponse.data.rewards);
      setWorkers(workersResponse); // Store workers
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (rewardId) => {
    setRewardToDelete(rewardId);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setDeletingId(rewardToDelete);
      await deleteReward(rewardToDelete);
      setRewards(rewards.filter(reward => reward.id !== rewardToDelete));
      setShowConfirmModal(false);
    } catch (error) {
      setError(error.message || 'Failed to delete reward');
    } finally {
      setDeletingId(null);
      setRewardToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setRewardToDelete(null);
  };

  const handleEditClick = (reward) => {
    setEditingReward({
      ...reward,
      eligible_users: reward.eligible_users.map(u => u.username) // Map to usernames for consistency
    });
    setSelectedUsers(reward.eligible_users.map(u => u.username)); // Initialize selected users
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingReward(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUserSelect = (e) => {
    const options = [...e.target.selectedOptions];
    const selectedUsernames = options.map(option => option.value);
    setSelectedUsers(selectedUsernames);
    setEditingReward(prev => ({
      ...prev,
      eligible_users: selectedUsernames
    }));
  };

  const handleSaveEdit = async () => {
    try {
      setUpdatingId(editingReward.id);
      const submissionData = {
        ...editingReward,
        point_cost: Number(editingReward.point_cost),
        cash_value: editingReward.reward_type === 'bonus' ? Number(editingReward.cash_value) : null,
        days_off: editingReward.reward_type === 'timeoff' ? Number(editingReward.days_off) : null,
        eligible_users: editingReward.eligible_users
      };
      await updateReward(editingReward.id, submissionData);
      
      setRewards(rewards.map(reward => 
        reward.id === editingReward.id 
          ? { ...reward, ...submissionData, eligible_users: workers.filter(w => submissionData.eligible_users.includes(w.user.username)) } 
          : reward
      ));
      
      setShowEditModal(false);
    } catch (error) {
      setError(error.message || 'Failed to update reward');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingReward(null);
    setSelectedUsers([]);
  };

 
   const handleLogout = async () => {
          try {
             await logout();
             navigate('/login-manager');
          } catch (error) {
             console.error("Error during logout:", error);
            
          }
        };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading && rewards.length === 0) {
    return <div className="text-center p-8">Loading rewards...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 relative font-['Poppins']">
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Delete Reward</h3>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Are you sure you want to delete this reward? This action cannot be undone.</p>
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancelDelete}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={deletingId === rewardToDelete}
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${deletingId === rewardToDelete ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {deletingId === rewardToDelete ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                      </span>
                    ) : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingReward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden w-full max-w-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Edit Reward</h3>
              <button 
                onClick={handleCancelEdit}
                className="text-white hover:text-blue-100 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Reward Name */}
                <div className="col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Reward Name*</label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={editingReward.name}
                      onChange={handleEditChange}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter reward name"
                      required
                    />
                  </div>
                </div>
                
                {/* Reward Description */}
                <div className="col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    value={editingReward.description}
                    onChange={handleEditChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Describe the reward details"
                  ></textarea>
                </div>
                
                {/* Point Cost */}
                <div>
                  <label htmlFor="point_cost" className="block text-sm font-medium text-gray-700 mb-1">Point Cost*</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">🎯</span>
                    </div>
                    <input
                      type="number"
                      name="point_cost"
                      id="point_cost"
                      min="1"
                      value={editingReward.point_cost}
                      onChange={handleEditChange}
                      className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="100"
                      required
                    />
                  </div>
                </div>
                
                {/* Reward Type */}
                <div>
                  <label htmlFor="reward_type" className="block text-sm font-medium text-gray-700 mb-1">Reward Type*</label>
                  <div className="relative rounded-md shadow-sm">
                    <select
                      name="reward_type"
                      id="reward_type"
                      value={editingReward.reward_type}
                      onChange={handleEditChange}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition appearance-none bg-white"
                    >
                      <option value="bonus">Cash Bonus</option>
                      <option value="timeoff">Time Off</option>
                      <option value="custom">Custom Reward</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Dynamic Fields Based on Reward Type */}
                {editingReward.reward_type === 'bonus' && (
                  <div className="col-span-2">
                    <label htmlFor="cash_value" className="block text-sm font-medium text-gray-700 mb-1">Cash Value*</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        name="cash_value"
                        id="cash_value"
                        min="0"
                        step="0.01"
                        value={editingReward.cash_value}
                        onChange={handleEditChange}
                        className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                )}
                
                {editingReward.reward_type === 'timeoff' && (
                  <div className="col-span-2">
                    <label htmlFor="days_off" className="block text-sm font-medium text-gray-700 mb-1">Days Off*</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">⏳</span>
                      </div>
                      <input
                        type="number"
                        name="days_off"
                        id="days_off"
                        min="0.5"
                        step="0.5"
                        value={editingReward.days_off}
                        onChange={handleEditChange}
                        className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="1.0"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">days</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Eligible Workers */}
                <div className="col-span-2">
                  <label htmlFor="eligible_users" className="block text-sm font-medium text-gray-700 mb-1">Eligible Workers</label>
                  <div className="relative rounded-md shadow-sm">
                    <select
                      multiple
                      name="eligible_users"
                      id="eligible_users"
                      value={selectedUsers}
                      onChange={handleUserSelect}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition h-auto min-h-[120px]"
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
                
                {/* Is Active Toggle */}
                <div className="col-span-2">
                  <div className="flex items-center">
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        name="is_active"
                        id="is_active"
                        checked={editingReward.is_active}
                        onChange={handleEditChange}
                        className="sr-only toggle-checkbox"
                      />
                      <label
                        htmlFor="is_active"
                        className={`block overflow-hidden h-6 rounded-full cursor-pointer ${editingReward.is_active ? 'bg-blue-500' : 'bg-gray-300'}`}
                      >
                        <span
                          className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${editingReward.is_active ? 'translate-x-4' : 'translate-x-0'}`}
                        ></span>
                      </label>
                    </div>
                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                      {editingReward.is_active ? 'Active Reward' : 'Inactive Reward'}
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {editingReward.is_active ? 'This reward is currently available for redemption' : 'This reward is hidden and cannot be redeemed'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={updatingId === editingReward.id}
                className={`px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition ${updatingId === editingReward.id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {updatingId === editingReward.id ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">My Created Rewards</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/create-reward')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
            >
              <i className="fas fa-gift"></i>
              Create New Reward
            </button>
            <button
              onClick={() => navigate('/award-points')}
              className="px-4 py-2 bg-amber-300 text-black rounded-lg hover:bg-amber-400 transition flex items-center gap-2"
            >
              <i className="fas fa-award"></i>
              Award Points
            </button>
            <button
              onClick={() => navigate('/manager-points-history')}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition flex items-center gap-2"
            >
              <i className="fas fa-history"></i>
              Points History
            </button>
          </div>
        </div>

        {rewards.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center font-['Poppins']">
            <h3 className="text-lg font-medium text-gray-700">No rewards created yet</h3>
            <p className="text-gray-500 mt-2">Create your first reward to get started</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden font-['Poppins']">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reward Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eligibility</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rewards.map((reward) => (
                  <tr key={reward.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {reward.reward_type === 'bonus' ? '$' : reward.reward_type === 'timeoff' ? '⏳' : '🎁'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{reward.name}</div>
                          <div className="text-sm text-gray-500">{reward.description}</div>
                          <div className="mt-1 text-xs text-gray-400">
                            {reward.point_cost} points • {reward.reward_type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {reward.reward_type === 'bonus' ? `$${reward.cash_value}` : 
                         reward.reward_type === 'timeoff' ? `${reward.days_off} days off` : 'Custom reward'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        {reward.eligible_users.length > 0 ? (
                          <>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {reward.eligible_users.length} specific workers
                            </span>
                            <div className="text-xs text-gray-500">
                              {reward.eligible_users.slice(0, 2).map(user => user.full_name).join(', ')}
                              {reward.eligible_users.length > 2 && ` +${reward.eligible_users.length - 2} more`}
                            </div>
                          </>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            All workers eligible
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${reward.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {reward.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="mt-1 text-xs text-gray-500">
                          {reward.total_redemptions} redemption{reward.total_redemptions !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(reward.created_at)}
                      <div className="text-xs text-gray-400 mt-1">
                        by {reward.created_by}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        {/* Edit button */}
                        <button
                          onClick={() => handleEditClick(reward)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit reward"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteClick(reward.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete reward"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerRewardsView;