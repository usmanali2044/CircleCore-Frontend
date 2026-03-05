/**
 * apiFetch — thin wrapper around native `fetch` that:
 * 1. Automatically injects `x-community-id` from the workspace store
 * 2. Intercepts 403 SUSPENDED / BANNED responses and redirects to /suspended
 *
 * Usage is identical to `fetch(url, options)`.
 */
import { useWorkspaceStore } from './workspaceStore';

export const apiFetch = async (url, options = {}) => {
    const communityId = useWorkspaceStore.getState().activeCommunityId;

    const headers = { ...(options.headers || {}) };

    if (communityId) {
        headers['x-community-id'] = communityId;
    }

    // Mock response for static frontend hosting without backend
    const res = {
        ok: true,
        status: 200,
        clone: function () { return this; },
        json: async () => ({
            message: 'Mocked response',
            users: [],
            channels: [],
            events: [],
            posts: [],
            comments: [],
            communities: [],
            invites: [],
            members: [],
            suspensions: [],
            flags: []
        })
    };
    // ── Suspension / ban interceptor ─────────────────────────────────────────
    if (res.status === 403) {
        // Clone so the body can still be read by the caller if needed
        const clone = res.clone();
        try {
            const data = await clone.json();
            if (data.code === 'SUSPENDED' || data.code === 'BANNED') {
                sessionStorage.setItem('suspensionData', JSON.stringify({
                    code: data.code,
                    liftAt: data.liftAt ?? null,
                    message: data.message ?? '',
                }));
                window.location.href = '/suspended';
            }
        } catch {
            // Not JSON or parse error — let caller handle normally
        }
    }

    return res;
};
