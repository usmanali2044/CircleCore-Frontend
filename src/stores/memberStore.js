import { create } from 'zustand';

export const useMemberStore = create((set, get) => ({
    members: [],
    isLoading: false,
    error: null,
    successMessage: null,

    fetchMembers: async (communityId) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`/api/communities/${communityId}/members`, {
                credentials: 'include',
                headers: { 'x-community-id': communityId },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to fetch members');
            set({ members: data.members, isLoading: false });
        } catch (err) {
            set({ error: err.message, isLoading: false });
            throw err;
        }
    },

    updateRole: async (communityId, userId, role) => {
        // Optimistic update
        const prev = get().members;
        set((s) => ({
            members: s.members.map((m) =>
                m._id === userId ? { ...m, communityRole: role } : m
            ),
        }));

        try {
            const res = await fetch(`/api/communities/${communityId}/members/${userId}/role`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'x-community-id': communityId,
                },
                body: JSON.stringify({ role }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update role');
            set({ successMessage: data.message });
            return data;
        } catch (err) {
            // Rollback
            set({ members: prev, error: err.message });
            throw err;
        }
    },

    clearError: () => set({ error: null }),
    clearSuccess: () => set({ successMessage: null }),
}));
