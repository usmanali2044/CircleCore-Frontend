import { create } from 'zustand';
import { useWorkspaceStore } from './workspaceStore';

const API_URL = 'http://localhost:3000/api/auth';

export const useAuthStore = create((set) => ({
    user: {
        _id: 'mock_user_1',
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'admin',
        isInviteVerified: true,
        memberships: [
            { communityId: { _id: 'com_1', name: 'CircleCore', slug: 'circlecore' } }
        ]
    },
    isLoading: false,
    error: null,
    message: null,
    isCheckingAuth: false,

    signup: async (name, email, password, inviteCode) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name, email, password, inviteCode }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Signup failed');
            set({ user: data.user, isLoading: false });
            // Initialise the active workspace from memberships
            if (data.user?.memberships) {
                useWorkspaceStore.getState().initFromMemberships(data.user.memberships);
            }
            return data;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Login failed');
            set({ user: data.user, isLoading: false });
            // Initialise the active workspace from memberships
            if (data.user?.memberships) {
                useWorkspaceStore.getState().initFromMemberships(data.user.memberships);
            }
            return data;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await fetch(`${API_URL}/logout`, {
                method: 'POST',
                credentials: 'include',
            });
            useWorkspaceStore.getState().clearWorkspace();
            set({ user: null, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    checkAuth: async () => {
        set({ isCheckingAuth: false, error: null });
        const user = useAuthStore.getState().user;
        if (user?.memberships) {
            useWorkspaceStore.getState().initFromMemberships(user.memberships);
        }
    },

    verifyEmail: async (code) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`${API_URL}/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ code }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Verification failed');
            set({ user: data.user, isLoading: false });
            return data;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    forgotPassword: async (email) => {
        set({ isLoading: true, error: null, message: null });
        try {
            const res = await fetch(`${API_URL}/forgotpassword`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to send reset email');
            set({ message: data.message, isLoading: false });
            return data;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    resetPassword: async (token, password) => {
        set({ isLoading: true, error: null, message: null });
        try {
            const res = await fetch(`${API_URL}/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to reset password');
            set({ message: data.message, isLoading: false });
            return data;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    clearError: () => set({ error: null, message: null }),
}));
