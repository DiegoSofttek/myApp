import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"

export const PublicRoute = ({children}) => {
    const {user} = useAuth();

    //Si esta logueado redirige a home
    if(user){
        <Navigate to="/home" replace></Navigate>
    }

    // Si no está logueado, permite mostrar el componente (Login o Register)
    return children;
}