import { useAuth } from "../hooks/useAuth";

export const ProtectedRoute = ({children}) => {
    
    const {user} = useAuth();

    if(!user) {
        const fallbackUser = {
            name: "Diego Cruz",
            email: "diegoa.cruz@softtek.com"
        };

        localStorage.setItem("user", JSON.stringify(fallbackUser));
        window.location.reload();
        return null;
    }

    return children;
}
