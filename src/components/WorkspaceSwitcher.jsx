import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useFeedStore } from '../stores/feedStore';
import { useChannelStore } from '../stores/channelStore';
import { useEventStore } from '../stores/eventStore';

const WorkspaceSwitcher = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { activeCommunityId, setActiveCommunity } = useWorkspaceStore();
    const { fetchFeed } = useFeedStore();
    const { fetchChannels, setActiveChannel } = useChannelStore();
    const { fetchEvents } = useEventStore();

    const memberships = user?.memberships || [];

    const handleSwitch = (communityId) => {
        if (communityId === activeCommunityId) return;
        setActiveCommunity(communityId);
        // Reset channel selection and refetch everything for new community
        setActiveChannel(null);
        // Slight delay so the store updates before fetches read the new header
        setTimeout(() => {
            fetchFeed(1, null, null);
            fetchChannels();
            fetchEvents();
        }, 0);
    };

    const getInitial = (membership) => {
        const community = membership.communityId;
        const name = community?.name || community?.slug || '?';
        return name.charAt(0).toUpperCase();
    };

    const getName = (membership) => {
        const community = membership.communityId;
        return community?.name || community?.slug || 'Community';
    };

    const getId = (membership) => {
        const community = membership.communityId;
        return community?._id || community;
    };

    // Color palette for community icons
    const colors = [
        'from-violet-500 to-purple-600',
        'from-blue-500 to-cyan-600',
        'from-emerald-500 to-teal-600',
        'from-rose-500 to-pink-600',
        'from-amber-500 to-orange-600',
        'from-indigo-500 to-blue-600',
    ];

    return (
        <aside className="workspace-switcher hidden md:flex flex-col items-center w-[72px] shrink-0 bg-ink/[0.03] border-r border-border-warm/30 py-3 gap-2 overflow-y-auto">
            {memberships.map((m, i) => {
                const id = getId(m);
                const isActive = id === activeCommunityId;
                const colorClass = colors[i % colors.length];

                return (
                    <div key={id} className="relative group flex items-center justify-center">
                        {/* Active pill indicator */}
                        <div
                            className={`absolute left-0 w-1 rounded-r-full bg-ink transition-all duration-300
                                ${isActive ? 'h-10' : 'h-0 group-hover:h-5'}`}
                        />

                        <button
                            onClick={() => handleSwitch(id)}
                            className={`w-12 h-12 flex items-center justify-center text-white font-black text-sm
                                transition-all duration-300 cursor-pointer select-none shadow-sm
                                ${isActive
                                    ? `bg-gradient-to-br ${colorClass} rounded-2xl scale-105 shadow-md`
                                    : `bg-gradient-to-br ${colorClass} rounded-[24px] hover:rounded-2xl opacity-70 hover:opacity-100`
                                }`}
                            title={getName(m)}
                        >
                            {getInitial(m)}
                        </button>

                        {/* Tooltip */}
                        <div className="absolute left-full ml-3 px-3 py-1.5 bg-ink text-white text-xs font-semibold rounded-lg
                            whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible
                            transition-all duration-200 pointer-events-none z-50 shadow-lg">
                            {getName(m)}
                            {m.role === 'admin' && (
                                <span className="ml-1.5 text-[10px] text-warm-yellow font-bold uppercase">Admin</span>
                            )}
                            <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0
                                border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent
                                border-r-[6px] border-r-ink" />
                        </div>
                    </div>
                );
            })}

            {/* Separator */}
            {memberships.length > 0 && (
                <div className="w-8 h-px bg-border-warm/50 my-1" />
            )}

            {/* Create / Join community */}
            <div className="relative group flex items-center justify-center">
                <button
                    onClick={() => navigate('/create-community')}
                    className="w-12 h-12 rounded-[24px] hover:rounded-2xl bg-white/80 border-2 border-dashed border-border-warm
                        flex items-center justify-center transition-all duration-300 cursor-pointer
                        hover:border-success hover:bg-success/5 group"
                    title="Create or join a community"
                >
                    <Plus className="w-5 h-5 text-muted group-hover:text-success transition-colors" strokeWidth={2} />
                </button>

                {/* Tooltip */}
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-ink text-white text-xs font-semibold rounded-lg
                    whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible
                    transition-all duration-200 pointer-events-none z-50 shadow-lg">
                    Add a Community
                    <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0
                        border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent
                        border-r-[6px] border-r-ink" />
                </div>
            </div>
        </aside>
    );
};

export default WorkspaceSwitcher;
