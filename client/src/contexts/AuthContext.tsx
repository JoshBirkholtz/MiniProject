import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import axios from 'axios';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    checkSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    loading: true,
    checkSession: async () => false
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const checkSession = async () => {
        try {
            const response = await axios.get('http://localhost:5500/api/auth/check-session', {
                withCredentials: true
            });
            
            if (response.data.valid && response.data.user) {
                // If session is valid, get the current Firebase user
                const user = auth.currentUser;
                if (user) {
                    setCurrentUser(user);
                }
            }
            return response.data.valid;
        } catch (error) {
            console.error('Session check failed:', error);
            return false;
        }
    };

    useEffect(() => {
        // Listen for Firebase auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
            } else {
                // If no Firebase user, check for valid session
                const isValid = await checkSession();
                if (!isValid) {
                    setCurrentUser(null);
                }
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ currentUser, loading, checkSession }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);