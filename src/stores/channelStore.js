import { create } from 'zustand';
import { apiFetch } from './apiFetch';

const API_URL = 'http://localhost:3000/api/channels';

export const useChannelStore = create((set, get) => ({
    channels: [],
    activeChannelId: null,
    isLoading: false,
    error: null,

    fetchChannels: async () => {
        set({
            channels: [
                { _id: 'chan_1', name: 'general', description: 'General discussion', isPrivate: false },
                { _id: 'chan_2', name: 'announcements', description: 'Server announcements', isPrivate: false },
            ],
            isLoading: false
        });
        return useChannelStore.getState().channels;
    },

    createChannel: async (name, description = '') => {
        set({ isLoading: true, error: null });
        try {
            const res = await apiFetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name, description }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to create channel');

            set((state) => ({
                channels: [...state.channels, data.channel],
                isLoading: false,
            }));
            return data.channel;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    setActiveChannel: (channelId) => {
        set({ activeChannelId: channelId });
    },

    clearError: () => set({ error: null }),
}));
