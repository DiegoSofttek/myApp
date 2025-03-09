// components/RedirectToProperRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const RedirectRoute = () => {
  const { user } = useAuth();

  // Si está logueado, manda a /home
  if (user) {
    return <Navigate to="/home" replace />;
  }

  // Si no está logueado, manda a /login
  return <Navigate to="/login" replace />;
};