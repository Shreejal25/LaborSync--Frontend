import React from 'react';
import { useNavigate } from 'react-router-dom';
import useRole from './userRole';
import { useAuth } from '../../context/useAuth';

const RoleProtectedRoute = ({ role, children }) => {
    const { userRole, loading } = useRole();
    const { isAuthenticated } = useAuth(); // Get isAuthenticated from context
    const navigate = useNavigate();

    // Check if user is authenticated first
    if (!isAuthenticated) {
        navigate('/login'); // Redirect to login if not authenticated
        return null; // Prevent further rendering
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    if (userRole !== role) {
        navigate('/unauthorized');
        return null;
    }

    return children;
};

export default RoleProtectedRoute;