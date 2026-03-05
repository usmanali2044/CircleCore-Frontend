import { create } from 'zustand';
import { apiFetch } from './apiFetch';

const API_URL = 'http://localhost:3000/api/events';

export const useEventStore = create((set, get) => ({
    events: [],
    isLoading: false,
    error: null,

    fetchEvents: async () => {
        set({
            events: [
                {
                    _id: 'mock_event_1',
                    title: 'Welcome Townhall',
                    description: 'Introduction to CircleCore.',
                    date: new Date(Date.now() + 86400000).toISOString(),
                    location: 'General Voice Channel',
                    creator: { name: 'Admin', avatar: '' },
                    rsvpList: ['mock_user_1']
                }
            ],
            isLoading: false
        });
        return useEventStore.getState().events;
    },

    createEvent: async ({ title, description, date, location }) => {
        set({ isLoading: true, error: null });
        try {
            const res = await apiFetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ title, description, date, location }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to create event');

            // Socket `new_event` will handle the UI push
            set({ isLoading: false });
            return data;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    toggleRsvp: async (eventId, userId) => {
        // ── Optimistic update ──
        const prevEvents = get().events;
        set((state) => ({
            events: state.events.map((e) => {
                if (e._id !== eventId) return e;
                const isRsvped = e.rsvpList.includes(userId);
                return {
                    ...e,
                    rsvpList: isRsvped
                        ? e.rsvpList.filter((id) => id !== userId)
                        : [...e.rsvpList, userId],
                };
            }),
        }));

        try {
            const res = await apiFetch(`${API_URL}/${eventId}/rsvp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to toggle RSVP');
            // Socket `rsvp_update` will reconcile the authoritative state
            return data;
        } catch (error) {
            // ── Revert on failure ──
            set({ events: prevEvents, error: error.message });
            throw error;
        }
    },

    // ── Real-time socket event handlers ──────────────────────────────────────
    handleNewEvent: (event) => {
        set((state) => {
            if (state.events.some((e) => e._id === event._id)) return state;
            // Insert in date-sorted order
            const updated = [...state.events, event].sort(
                (a, b) => new Date(a.date) - new Date(b.date)
            );
            return { events: updated };
        });
    },

    handleRsvpUpdate: ({ eventId, rsvpList }) => {
        set((state) => ({
            events: state.events.map((e) =>
                e._id === eventId ? { ...e, rsvpList } : e
            ),
        }));
    },

    clearError: () => set({ error: null }),
}));
