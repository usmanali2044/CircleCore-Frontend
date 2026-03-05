import { create } from 'zustand';

const API_URL = 'http://localhost:3000/api/profile';

export const useProfileStore = create((set) => ({
    profile: null,
    isLoading: false,
    error: null,

    fetchProfile: async (id) => {
        set({
            profile: {
                _id: 'mock_profile_1',
                user: 'mock_user_1',
                avatar: 'https://i.pravatar.cc/150?u=mock_user_1',
                bio: 'A developer exploring CircleCore.',
                skills: ['React', 'Node.js', 'Tailwind'],
                interests: ['Web Dev', 'UI/UX'],
                reputation: 42,
                tier: 'pro',
                isOnboarded: true,
            },
            isLoading: false
        });
        return { profile: useProfileStore.getState().profile };
    },

    updateProfile: async (id, profileData) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(profileData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update profile');
            set({ profile: data.profile, isLoading: false });
            return data;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
}));
