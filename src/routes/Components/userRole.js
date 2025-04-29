// src/hooks/useRole.js

import { useState, useEffect, useCallback } from 'react';
import { getUserRole } from '../../endpoints/api';  // Import the getUserRole function

const useRole = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true); // To handle loading state

  const fetchUserRole = useCallback(async () => {
    try {
      setLoading(true); // Start loading when fetching the role
      const role = await getUserRole();  // Call your API function to get the role
      setUserRole(role);  // Set the role in the state
    } catch (error) {
      console.error("Error fetching user role:", error);
    } finally {
      setLoading(false);  // End loading once fetching is complete
    }
  }, []);

  useEffect(() => {
    fetchUserRole();  // Fetch user role when the component mounts
  }, [fetchUserRole]);

  return { userRole, loading };  // Return the user role and loading state
};

export default useRole;
