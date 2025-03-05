import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { logoutFirebase, userListener } from "../config/authCall";
import useLocalStorage from "./useLocalStorage";

//Inicializamos el contexto vacío
export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    //Null es como si estuviera no logueado
    const [user, setUser] = useLocalStorage('user', null);
    const [mounted, setMounted] = useState(false);

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
    }

    const value = useMemo(
        () => ({
            user,
            logout
        }),
        [user]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    return useContext(AuthContext);
}