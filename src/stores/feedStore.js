import { create } from 'zustand';
import { apiFetch } from './apiFetch';

const API_URL = 'http://localhost:3000/api/posts';
const UPLOAD_URL = 'http://localhost:3000/api/upload';

export const useFeedStore = create((set, get) => ({
    posts: [],
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
    activeTag: null,
    isLoading: false,
    error: null,

    fetchFeed: async (page = 1, tag = null, channelId = null) => {
        set({
            posts: [
                {
                    _id: 'mock_post_1',
                    content: 'Welcome to CircleCore! This is a mock post since the backend is disabled.',
                    author: { _id: 'mock_user_1', name: 'Demo User', avatar: '' },
                    createdAt: new Date().toISOString(),
                    likesCount: 10,
                    likedBy: [],
                    commentsCount: 2,
                    tags: ['General']
                }
            ],
            currentPage: 1,
            totalPages: 1,
            totalPosts: 1,
            activeTag: tag,
            isLoading: false,
        });
        return { posts: useFeedStore.getState().posts };
    },

    // ── Upload a file to Cloudinary via backend ──────────────────────────────
    uploadFile: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await apiFetch(UPLOAD_URL, {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Upload failed');
        return data.url; // Cloudinary secure_url
    },

    createPost: async ({ content, tags, mediaURLs, poll, channelId }) => {
        set({ isLoading: true, error: null });
        try {
            const res = await apiFetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ content, tags, mediaURLs, poll, channelId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to create post');

            // Don't prepend here — the socket `new_post` event will handle it
            set({ isLoading: false });
            return data;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    reactToPost: async (postId) => {
        try {
            const res = await apiFetch(`${API_URL}/${postId}/react`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to react');
            // Socket event will update the UI
            return data;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    addComment: async (postId, content) => {
        try {
            const res = await apiFetch(`${API_URL}/${postId}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ content }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to add comment');
            // Socket event will update the comments count
            return data;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    fetchComments: async (postId) => {
        try {
            const res = await apiFetch(`${API_URL}/${postId}/comments`, {
                credentials: 'include',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to fetch comments');
            return data.comments;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // ── Vote on Poll ─────────────────────────────────────────────────────────
    voteOnPoll: async (postId, optionIndex) => {
        // Optimistic update
        const userId = null; // Will be updated by socket event
        try {
            const res = await apiFetch(`${API_URL}/${postId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ optionIndex }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to vote');
            return data;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // ── Real-time socket event handlers ──────────────────────────────────────
    handleNewPost: (post) => {
        set((state) => {
            // Avoid duplicates
            if (state.posts.some((p) => p._id === post._id)) return state;
            return {
                posts: [post, ...state.posts],
                totalPosts: state.totalPosts + 1,
            };
        });
    },

    handleNewReaction: ({ postId, likesCount, likedBy }) => {
        set((state) => ({
            posts: state.posts.map((p) =>
                p._id === postId ? { ...p, likesCount, likedBy } : p
            ),
        }));
    },

    handleNewComment: ({ postId, commentsCount }) => {
        set((state) => ({
            posts: state.posts.map((p) =>
                p._id === postId ? { ...p, commentsCount } : p
            ),
        }));
    },

    handlePollVote: ({ postId, poll }) => {
        set((state) => ({
            posts: state.posts.map((p) =>
                p._id === postId ? { ...p, poll } : p
            ),
        }));
    },

    flagPost: async (postId, reason = '') => {
        try {
            const res = await apiFetch('http://localhost:3000/api/moderate/flag', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ postId, reason }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to flag post');
            return data;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
}));

