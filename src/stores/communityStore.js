import { create } from 'zustand';

const API_URL = 'http://localhost:3000/api/communities';

export const useCommunityStore = create((set, get) => ({
    community: null,
    myCommunities: [],      // all communities the admin owns
    inviteCodes: [],
    isLoading: false,
    error: null,
    successMessage: null,

    // Create a new community
    createCommunity: async (name, description, slug) => {
        set({ isLoading: true, error: null, successMessage: null });
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name, description, slug }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to create community');
            set({
                community: data.community,
                isLoading: false,
                successMessage: 'Community created successfully!',
            });
            return data;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    // Generate invite code + optional email
    generateInvite: async (communityId, email) => {
        set({ isLoading: true, error: null, successMessage: null });
        try {
            const res = await fetch(`${API_URL}/${communityId}/invites`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email: email || undefined }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to generate invite');

            // Optimistically add the new code to the list
            set((s) => ({
                inviteCodes: [
                    {
                        code: data.code,
                        isUsed: false,
                        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        _id: Date.now().toString(),
                    },
                    ...s.inviteCodes,
                ],
                isLoading: false,
                successMessage: data.message,
            }));
            return data;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    // Fetch all invite codes for a community
    fetchInviteCodes: async (communityId) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`${API_URL}/${communityId}/invites`, {
                credentials: 'include',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to fetch invite codes');
            set({
                inviteCodes: data.inviteCodes || [],
                community: { ...get().community, name: data.communityName },
                isLoading: false,
            });
            return data;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    // Fetch the community owned by the current user (single)
    fetchMyCommunity: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`${API_URL}/mine`, {
                credentials: 'include',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'No community found');
            set({ community: data.community, isLoading: false });
            return data.community;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    // Fetch ALL communities owned by the current user (for multi-community admins)
    fetchMyCommunities: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`${API_URL}/mine-all`, {
                credentials: 'include',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to fetch communities');
            const communities = data.communities || [];
            set({
                myCommunities: communities,
                // Auto-select first community if none selected yet
                community: get().community || (communities[0] ?? null),
                isLoading: false,
            });
            return communities;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    // Switch the active community shown in invite management
    selectCommunity: (communityObj) => {
        set({ community: communityObj, inviteCodes: [] });
    },

    clearError: () => set({ error: null }),
    clearSuccess: () => set({ successMessage: null }),
}));
