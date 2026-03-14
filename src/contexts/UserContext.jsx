import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('admin_auth_token');
            if (!token) {
                setIsAuthenticated(false);
                setUser(null);
                return;
            }

            const data = await authAPI.getMe();
            
            // Strictly enforce admin role
            if (data.user?.role !== 'admin') {
                setIsAuthenticated(false);
                setUser(null);
                localStorage.removeItem('admin_auth_token');
                return;
            }

            setUser(data.user);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Auth check failed:', error);
            setIsAuthenticated(false);
            setUser(null);
            localStorage.removeItem('admin_auth_token');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (err) {
            console.error('Logout error:', err);
        }
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('admin_auth_token');
    };

    return (
        <UserContext.Provider value={{ user, isAuthenticated, loading, checkAuth, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
