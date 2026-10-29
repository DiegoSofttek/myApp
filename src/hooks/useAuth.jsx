import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { logoutFirebase, userListener } from "../config/authCall";
import useLocalStorage from "./useLocalStorage";

//Inicializamos el contexto vacío
export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    //Null es como si estuviera no logueado
    const [user, setUser] = useLocalStorage('user', null);
    const [mounted, setMounted] = useState(false);
    // true hasta que Firebase reporte el primer estado de autenticación
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        //Válidar si el usuario esta logueado
        if(mounted) userListener(listenUser)
        else setMounted(true);
    }, [mounted]);

    const logout = () => {
        logoutFirebase();
        setUser(null);
    }

    const listenUser = (user) => {
        //console.log(user);
        setUser(user);
        setLoading(false);
    }

    const value = useMemo(
        () => ({
            user,
            loading,
            logout
        }),
        [user, loading]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    return useContext(AuthContext);
}