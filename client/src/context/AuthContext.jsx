import { createContext, useState } from "react";
import { loginUser, registerUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));

    const login = async (credentials) => {
        const { token } = await loginUser(credentials);
        localStorage.setItem("token", token);
        setToken(token);
        window.location.href = "/";
    };

    const register = async (credentials) => {
        await registerUser(credentials);
        await login(credentials);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        window.location.href = "/login";
    };

    return (
      <AuthContext.Provider value={{ token, login, register, logout }}>
        {children}
      </AuthContext.Provider>
    );
};