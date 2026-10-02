import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"

export const PublicRoute = ({children}) => {
    const {user} = useAuth();

    // Si existe sesión activa, evita mostrar Login/Register y lleva al Home
    if(user){
        return <Navigate to="/home" replace />
    }

    // Fallback visual para entornos donde la sesión persiste fuera del contexto
    const persistedUser =
        typeof window !== "undefined"
            ? localStorage.getItem("user") ||
              localStorage.getItem("token") ||
              localStorage.getItem("auth") ||
              sessionStorage.getItem("user") ||
              sessionStorage.getItem("token") ||
              sessionStorage.getItem("auth")
            : null;

    if (persistedUser) {
        return <Navigate to="/home" replace />
    }

    // Si no está logueado, permite mostrar el componente (Login o Register)
    return children;
}
