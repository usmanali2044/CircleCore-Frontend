import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, LogOut, ChevronLeft, ChevronRight, Newspaper, Menu, Hash, Lock, Layers, Plus } from 'lucide-react';
import Button from '../components/Button';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import NotificationBell from '../components/NotificationBell';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import WorkspaceSwitcher from '../components/WorkspaceSwitcher';
import { useFeedStore } from '../stores/feedStore';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useChannelStore } from '../stores/channelStore';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useEventStore } from '../stores/eventStore';
import useSocket from '../hooks/useSocket';

const FILTER_TAGS = ['All', 'General', 'Question', 'Discussion', 'Showcase', 'Help', 'React', 'Node.js'];

const FeedPage = () => {
    const [mounted, setMounted] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const { posts, currentPage, totalPages, activeTag, fetchFeed, isLoading, handleNewPost, handleNewReaction, handleNewComment, handlePollVote } = useFeedStore();
    const { user, logout } = useAuthStore();
    const { addNotification } = useNotificationStore();
    const { channels, activeChannelId, setActiveChannel, fetchChannels } = useChannelStore();
    const { activeCommunityId, setActiveCommunity } = useWorkspaceStore();
    const { fetchEvents } = useEventStore();

    const memberships = user?.memberships || [];

    // Community switcher colors (same palette as WorkspaceSwitcher)
    const wsColors = [
        'from-violet-500 to-purple-600',
        'from-blue-500 to-cyan-600',
        'from-emerald-500 to-teal-600',
        'from-rose-500 to-pink-600',
        'from-amber-500 to-orange-600',
        'from-indigo-500 to-blue-600',
    ];

    const handleSwitchCommunity = (communityId) => {
        if (communityId === activeCommunityId) return;
        setActiveCommunity(communityId);
        setActiveChannel(null);
        setTimeout(() => {
            fetchFeed(1, null, null);
            fetchChannels();
            fetchEvents();
        }, 0);
    };

    useEffect(() => {
        fetchChannels();
    }, [activeCommunityId]);
    const socket = useSocket(user?._id);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 80);
        return () => clearTimeout(t);
    }, []);

    // Re-fetch feed when activeChannelId or activeCommunityId changes
    useEffect(() => {
        if (activeCommunityId) {
            fetchFeed(1, null, activeChannelId);
        }
    }, [activeChannelId, activeCommunityId]);

    // ── Socket listeners ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;

        const onConnect = () => setSocketConnected(true);
        const onDisconnect = () => setSocketConnected(false);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('new_post', handleNewPost);
        socket.on('new_reaction', handleNewReaction);
        socket.on('new_comment', handleNewComment);
        socket.on('new_notification', addNotification);
        socket.on('poll_vote', handlePollVote);

        // If already connected
        if (socket.connected) setSocketConnected(true);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('new_post', handleNewPost);
            socket.off('new_reaction', handleNewReaction);
            socket.off('new_comment', handleNewComment);
            socket.off('new_notification', addNotification);
            socket.off('poll_vote', handlePollVote);
        };
    }, [socket, handleNewPost, handleNewReaction, handleNewComment, addNotification, handlePollVote]);

    const handleTagFilter = (tag) => {
        const filterTag = tag === 'All' ? null : tag;
        fetchFeed(1, filterTag, activeChannelId);
    };

    const handlePagination = (page) => {
        fetchFeed(page, activeTag, activeChannelId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="h-screen h-[100dvh] bg-cream relative flex flex-col overflow-hidden">
            {/* ── Ambient background ── */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-28 -left-24 w-72 h-72 rounded-full bg-gradient-to-br from-warm-yellow/15 to-amber-300/10 blur-3xl" />
                <div className="absolute bottom-[20%] -right-20 w-56 h-56 rounded-full bg-warm-yellow/[0.06] blur-3xl" />
                <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-warm-yellow/[0.12] to-transparent" />
                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #1A1A1A 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                    }}
                />
            </div>

            {/* ── Header ── */}
            <header
                className={`sticky top-0 z-30 bg-cream/80 backdrop-blur-xl border-b border-border-warm/30
                    flex items-center justify-between px-4 sm:px-8 py-3.5
                    transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}
            >
                <div className="flex items-center gap-2 shrink-0">
                    {/* Mobile sidebar toggle */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="w-8 h-8 rounded-lg hover:bg-cream-dark flex items-center justify-center transition-colors cursor-pointer md:hidden"
                    >
                        <Menu className="w-4 h-4 text-ink" strokeWidth={2} />
                    </button>
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-warm-yellow to-warm-yellow-hover flex items-center justify-center shadow-sm">
                            <Sparkles className="w-4 h-4 text-ink" strokeWidth={2.5} />
                        </div>
                        <span className="text-sm font-bold tracking-tight text-ink hidden sm:inline">CircleCore</span>
                    </Link>
                </div>

                {/* Search bar — center */}
                <div className="hidden sm:flex flex-1 justify-center mx-4">
                    <SearchBar />
                </div>

                <div className="flex items-center gap-2">
                    {/* Live indicator */}
                    <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate/30'}`} />
                        <span className="text-[10px] font-semibold text-muted uppercase tracking-wider hidden sm:inline">
                            {socketConnected ? 'Live' : 'Offline'}
                        </span>
                    </div>
                    <NotificationBell />
                    <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                        <span className="hidden sm:inline">Dashboard</span>
                        <span className="sm:hidden text-xs">Home</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleLogout} icon={<LogOut className="w-3.5 h-3.5" strokeWidth={2} />}>
                        <span className="hidden sm:inline">Log Out</span>
                    </Button>
                </div>
            </header>

            {/* ── Mobile search bar ── */}
            <div className="sm:hidden px-4 pt-3">
                <SearchBar />
            </div>

            {/* ── Mobile community switcher ── */}
            {memberships.length > 0 && (
                <div className="md:hidden flex items-center gap-2.5 px-4 pt-2.5 pb-2 overflow-x-auto scrollbar-hide border-b border-border-warm/20">
                    {memberships.map((m, i) => {
                        const community = m.communityId;
                        const id = community?._id || community;
                        const name = community?.name || community?.slug || 'Community';
                        const initial = name.charAt(0).toUpperCase();
                        const isActive = id === activeCommunityId;
                        const colorClass = wsColors[i % wsColors.length];
                        return (
                            <button
                                key={id}
                                onClick={() => handleSwitchCommunity(id)}
                                title={name}
                                className={`flex items-center gap-2 shrink-0 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer select-none
                                    ${isActive
                                        ? 'bg-warm-yellow/15 border-2 border-warm-yellow text-ink shadow-sm'
                                        : 'bg-white/60 border border-border-warm text-slate hover:bg-white hover:text-ink'
                                    }`}
                            >
                                <span className={`w-5 h-5 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white text-[10px] font-black shrink-0`}>
                                    {initial}
                                </span>
                                <span className="max-w-[80px] truncate">{name}</span>
                            </button>
                        );
                    })}
                    {/* Add community button */}
                    <button
                        onClick={() => navigate('/create-community')}
                        title="Add a community"
                        className="shrink-0 w-8 h-8 rounded-full bg-white/60 border border-dashed border-border-warm flex items-center justify-center hover:border-ink/40 hover:bg-white transition-all duration-200 cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5 text-muted" strokeWidth={2.5} />
                    </button>
                </div>
            )}

            {/* ── Mobile channel bar ── */}
            <div className="md:hidden flex items-center gap-2 px-4 pt-2 pb-1 overflow-x-auto scrollbar-hide border-b border-border-warm/20">
                {/* All Posts pill */}
                <button
                    onClick={() => setActiveChannel(null)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer
                        ${!activeChannelId
                            ? 'bg-gradient-to-r from-warm-yellow to-amber-400 text-ink shadow-sm'
                            : 'bg-white/60 text-slate border border-border-warm hover:bg-white'
                        }`}
                >
                    <Layers className="w-3 h-3" strokeWidth={2.5} />
                    All Posts
                </button>

                {channels.map((ch) => (
                    <button
                        key={ch._id}
                        onClick={() => setActiveChannel(ch._id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer
                            ${activeChannelId === ch._id
                                ? 'bg-gradient-to-r from-warm-yellow to-amber-400 text-ink shadow-sm'
                                : 'bg-white/60 text-slate border border-border-warm hover:bg-white'
                            }`}
                    >
                        {ch.isPrivate
                            ? <Lock className="w-3 h-3" strokeWidth={2.5} />
                            : <Hash className="w-3 h-3" strokeWidth={2.5} />}
                        {ch.name}
                    </button>
                ))}
            </div>

            {/* ── Body: Sidebar + Feed ── */}
            <div className="relative z-10 flex flex-1 overflow-hidden">
                <WorkspaceSwitcher />
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <main className="flex-1 overflow-y-auto"><div className="w-full max-w-[640px] mx-auto px-5 sm:px-8 py-8">
                    {/* Page title */}
                    <div className={`mb-6 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                        <div className="flex items-center gap-3 mb-1">
                            <Newspaper className="w-5 h-5 text-warm-yellow" strokeWidth={2} />
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink">Community Feed</h1>
                        </div>
                        <p className="text-sm text-slate font-medium ml-8">See what the community is talking about.</p>
                    </div>

                    {/* Tag filters */}
                    <div className={`flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        {FILTER_TAGS.map((tag) => {
                            const isActive = tag === 'All' ? !activeTag : activeTag === tag;
                            return (
                                <button
                                    key={tag}
                                    onClick={() => handleTagFilter(tag)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer select-none shrink-0
                                        ${isActive
                                            ? 'bg-gradient-to-r from-warm-yellow to-amber-400 text-ink shadow-sm shadow-warm-yellow-glow'
                                            : 'bg-white/50 text-slate border border-border-warm hover:border-ink/20 hover:bg-white/70'
                                        }`}
                                >
                                    {tag}
                                </button>
                            );
                        })}
                    </div>

                    {/* Create post */}
                    <div className={`mb-6 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <CreatePost />
                    </div>

                    {/* Posts list */}
                    <div className="space-y-4">
                        {isLoading && posts.length === 0 ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="w-8 h-8 rounded-full border-3 border-warm-yellow border-t-transparent animate-spin" />
                            </div>
                        ) : posts.length > 0 ? (
                            posts.map((post, i) => (
                                <div
                                    key={post._id}
                                    className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                                    style={{ transitionDelay: `${300 + i * 80}ms` }}
                                >
                                    <PostCard post={post} />
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-14 h-14 rounded-full bg-cream-dark flex items-center justify-center mx-auto mb-4">
                                    <Newspaper className="w-6 h-6 text-muted" strokeWidth={1.5} />
                                </div>
                                <p className="text-sm font-semibold text-ink mb-1">No posts yet</p>
                                <p className="text-xs text-muted">Be the first to share something with the community!</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 mt-8">
                            <button
                                onClick={() => handlePagination(currentPage - 1)}
                                disabled={currentPage <= 1}
                                className="w-9 h-9 rounded-xl bg-white/60 border border-border-warm flex items-center justify-center hover:bg-white transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4 text-ink" strokeWidth={2} />
                            </button>
                            <span className="text-sm font-bold text-ink">
                                {currentPage} <span className="text-muted font-medium">of</span> {totalPages}
                            </span>
                            <button
                                onClick={() => handlePagination(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                                className="w-9 h-9 rounded-xl bg-white/60 border border-border-warm flex items-center justify-center hover:bg-white transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4 text-ink" strokeWidth={2} />
                            </button>
                        </div>
                    )}
                </div></main>
            </div>
        </div>
    );
};

export default FeedPage;
