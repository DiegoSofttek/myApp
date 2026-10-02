import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { logoutFirebase, userListener } from "../config/authCall";
import useLocalStorage from "./useLocalStorage";

// Inicializamos el contexto vacío
export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    // Null es como si estuviera no logueado
    const [user, setUser] = useLocalStorage('user', {
        displayName: "Diego Cruz",
        email: "diegoa.cruz@softtek.com"
    });
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true); // 1. Añadimos el estado loading

    useEffect(() => {
        // Válidar si el usuario esta logueado
        if (mounted) {
            userListener((userData) => {
                setUser(userData);
                setLoading(false); // 2. Desactivamos el loading cuando Firebase responde
            });
        } else {
            setMounted(true);
        }
    }, [mounted]);

    const logout = () => {
        logoutFirebase();
        setUser(null);
    }

    const listenUser = (user) => {
        setUser(user);
        setLoading(false); // Aseguramos que también se apague aquí si se usa directamente
    }

    const value = useMemo(
        () => ({
            user,
            loading, // 3. Lo exponemos en el contexto para que Home y RedirectRoute lo lean
            logout
        }),
        [user, loading]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    return useContext(AuthContext);
}
