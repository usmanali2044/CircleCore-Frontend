import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, LogOut, CalendarDays } from 'lucide-react';
import Button from '../components/Button';
import EventsDash from '../components/EventsDash';
import WorkspaceSwitcher from '../components/WorkspaceSwitcher';
import { useEventStore } from '../stores/eventStore';
import { useAuthStore } from '../stores/authStore';
import { useWorkspaceStore } from '../stores/workspaceStore';
import useSocket from '../hooks/useSocket';

const EventsPage = () => {
    const [mounted, setMounted] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const navigate = useNavigate();

    const { fetchEvents, handleNewEvent, handleRsvpUpdate } = useEventStore();
    const { logout } = useAuthStore();
    const { activeCommunityId } = useWorkspaceStore();
    const socket = useSocket();

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 80);
        return () => clearTimeout(t);
    }, []);

    // Re-fetch events when the active community changes
    useEffect(() => {
        if (activeCommunityId) fetchEvents();
    }, [activeCommunityId]);

    // ── Socket listeners ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;

        const onConnect = () => {
            setSocketConnected(true);
            socket.emit('join_events');
        };
        const onDisconnect = () => setSocketConnected(false);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('new_event', handleNewEvent);
        socket.on('rsvp_update', handleRsvpUpdate);

        // If already connected
        if (socket.connected) {
            setSocketConnected(true);
            socket.emit('join_events');
        }

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('new_event', handleNewEvent);
            socket.off('rsvp_update', handleRsvpUpdate);
        };
    }, [socket, handleNewEvent, handleRsvpUpdate]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen min-h-[100dvh] bg-cream relative overflow-hidden flex flex-col">
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
                <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-warm-yellow to-warm-yellow-hover flex items-center justify-center shadow-sm">
                        <Sparkles className="w-4 h-4 text-ink" strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-bold tracking-tight text-ink hidden sm:inline">CircleCore</span>
                </Link>
                <div className="flex items-center gap-2">
                    {/* Live indicator */}
                    <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate/30'}`} />
                        <span className="text-[10px] font-semibold text-muted uppercase tracking-wider hidden sm:inline">
                            {socketConnected ? 'Live' : 'Offline'}
                        </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                        <span className="hidden sm:inline">Dashboard</span>
                        <span className="sm:hidden text-xs">Home</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/feed')}>
                        Feed
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleLogout} icon={<LogOut className="w-3.5 h-3.5" strokeWidth={2} />}>
                        <span className="hidden sm:inline">Log Out</span>
                    </Button>
                </div>
            </header>

            {/* ── Body: WorkspaceSwitcher + Main ── */}
            <div className="relative z-10 flex flex-1">
                <WorkspaceSwitcher />
                <main className="flex-1 w-full max-w-[640px] mx-auto px-5 sm:px-8 py-8">
                    {/* Page title */}
                    <div className={`mb-6 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                        <div className="flex items-center gap-3 mb-1">
                            <CalendarDays className="w-5 h-5 text-warm-yellow" strokeWidth={2} />
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink">Events & Meetups</h1>
                        </div>
                        <p className="text-sm text-slate font-medium ml-8">Upcoming events in the community.</p>
                    </div>

                    {/* Events dashboard */}
                    <div className={`transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <EventsDash />
                    </div>
                </main>
            </div>

            {/* ── Wave accent ── */}
            <div className="pointer-events-none relative z-0 mt-auto">
                <svg viewBox="0 0 390 50" className="w-full block" preserveAspectRatio="none">
                    <path d="M0 25 Q97.5 0 195 25 Q292.5 50 390 25 L390 50 L0 50Z" fill="rgba(255,215,0,0.12)" />
                </svg>
            </div>
        </div>
    );
};

export default EventsPage;
