import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { logout } from '@/redux/features/authSlice';
import { AppDispatch } from '@/redux/store';

// Returns expiry time in ms, or null if the token is missing/undecodable
const getExpiryMs = (token?: string | null): number | null => {
  if (!token) return null;
  try {
    const { exp } = jwtDecode<{ exp?: number }>(token);
    return exp ? exp * 1000 : null;
  } catch {
    return null;
  }
};

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: any) => state.auth.user);
  const refreshToken = useSelector((state: any) => state.auth.refreshToken);

  // Auto-logout the moment the refresh token (the session) expires
  useEffect(() => {
    if (!user) return;
    const expiresAt = getExpiryMs(refreshToken);
    if (!expiresAt) return; // cookie-only session: axios interceptor handles logout

    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      dispatch(logout());
      return;
    }
    // setTimeout max is ~24.8 days
    const timer = setTimeout(
      () => dispatch(logout()),
      Math.min(remaining, 2147483647)
    );
    return () => clearTimeout(timer);
  }, [user, refreshToken, dispatch]);

  if (!user || (getExpiryMs(refreshToken) ?? Infinity) <= Date.now()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
