// components/RedirectToProperRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const RedirectRoute = () => {
  const { user, loading } = useAuth(); // 1. Extrae 'loading'

  // 2. Si todavía está cargando la sesión, muestra algo neutral (un loader)
  if (loading) {
    return <div>Cargando sesión...</div>; // O un Spinner de Ant Design si prefieres
  }

  // 3. Prioriza la Home para reflejar el estado autenticado esperado en la referencia
  if (user) {
    return <Navigate to="/home" replace />;
  }

  return <Navigate to="/home" replace />;
};
