/**
 * Hook to check if user is logged in by checking stored auth token
 */
import { useEffect, useState } from 'react';

import { clearStoredAuthToken, decodeAuthToken, getStoredAuthToken } from '@/lib/auth-token';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getStoredAuthToken();

    if (!token) {
      setIsLoading(false);
      return;
    }

    const decoded = decodeAuthToken(token);

    if (!decoded) {
      clearStoredAuthToken();
      setIsLoading(false);
      return;
    }

    setIsLoggedIn(true);
    setRole(decoded.role);
    setIsAdmin(decoded.role === 'admin' || decoded.role === 'superadmin');
    setIsLoading(false);
  }, []);

  return { isLoggedIn, isAdmin, isLoading, role };
}
