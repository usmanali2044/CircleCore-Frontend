import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, LogOut, Code, Heart, Star, ChevronRight, Building2, Users, Newspaper, ShieldCheck, Shield } from 'lucide-react';
import Button from '../components/Button';
import NotificationBell from '../components/NotificationBell';
import { useAuthStore } from '../stores/authStore';
import { useProfileStore } from '../stores/profileStore';
import { useNotificationStore } from '../stores/notificationStore';
import useSocket from '../hooks/useSocket';

const DashboardPage = () => {
    const [mounted, setMounted] = useState(false);
    const navigate = useNavigate();

    const { user, logout } = useAuthStore();
    const { profile, fetchProfile } = useProfileStore();
    const { addNotification } = useNotificationStore();
    const socket = useSocket(user?._id);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 80);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (user?._id) fetchProfile(user._id);
    }, [user]);

    useEffect(() => {
        if (!socket) return;
        socket.on('new_notification', addNotification);
        return () => { socket.off('new_notification', addNotification); };
    }, [socket, addNotification]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    const quickActions = [
        {
            label: 'Community Feed',
            desc: 'See posts, share ideas, and connect',
            icon: <Newspaper className="w-4 h-4 text-ink" strokeWidth={2} />,
            iconBg: 'bg-warm-yellow-light',
            path: '/feed',
            delay: 'delay-[400ms]',
        },
        {
            label: 'Events & Meetups',
            desc: 'Browse and RSVP to upcoming events',
            icon: <Star className="w-4 h-4 text-ink" strokeWidth={2} />,
            iconBg: 'bg-warm-yellow-light',
            path: '/events',
            delay: 'delay-[500ms]',
        },
        {
            label: 'Create Community',
            desc: 'Start your own workspace and invite members',
            icon: <Building2 className="w-4 h-4 text-ink" strokeWidth={2} />,
            iconBg: 'bg-gradient-to-br from-amber-100 to-warm-yellow-light',
            path: '/create-community',
            delay: 'delay-[600ms]',
        },
        ...(user?.role === 'admin' ? [
            {
                label: 'Manage Invites',
                desc: 'Send invite emails and manage access codes',
                icon: <Users className="w-4 h-4 text-ink" strokeWidth={2} />,
                iconBg: 'bg-gradient-to-br from-amber-200 to-warm-yellow',
                border: 'border-amber-200/40',
                path: '/admin/invites',
                delay: 'delay-700',
            },
            {
                label: 'Member Directory',
                desc: 'View members and delegate moderator roles',
                icon: <ShieldCheck className="w-4 h-4 text-ink" strokeWidth={2} />,
                iconBg: 'bg-gradient-to-br from-violet-200 to-purple-300',
                border: 'border-violet-200/40',
                path: '/admin/members',
                delay: 'delay-[800ms]',
            },
            {
                label: 'Moderation',
                desc: 'Review flagged content and manage community safety',
                icon: <Shield className="w-4 h-4 text-white" strokeWidth={2} />,
                iconBg: 'bg-gradient-to-br from-rose-400 to-rose-600',
                border: 'border-rose-200/40',
                path: '/admin/moderation',
                delay: 'delay-[900ms]',
            },
        ] : []),
    ];

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
                    <span className="text-sm font-bold tracking-tight text-ink">CircleCore</span>
                </Link>
                <div className="flex items-center gap-2">
                    <NotificationBell />
                    <Button variant="ghost" size="sm" onClick={() => navigate('/feed')}>
                        <Newspaper className="w-3.5 h-3.5" strokeWidth={2} />
                        <span className="hidden sm:inline ml-1">Feed</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        icon={<LogOut className="w-3.5 h-3.5" strokeWidth={2} />}
                    >
                        <span className="hidden sm:inline">Log Out</span>
                    </Button>
                </div>
            </header>

            {/* ── Body ── */}
            <main className="relative z-10 flex-1 w-full max-w-[560px] mx-auto px-4 sm:px-6 py-8">

                {/* Welcome */}
                <div className={`text-center mb-7 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink mb-1">
                        Welcome back, {user?.name?.split(' ')[0] || 'there'}!
                    </h1>
                    <p className="text-sm text-slate font-medium">Your community hub is ready.</p>
                </div>

                {/* ── Profile Card ── */}
                <section className={`transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="relative bg-white/70 backdrop-blur-2xl rounded-3xl p-5 sm:p-7 shadow-xl border border-white/60">
                        {/* Glow edge */}
                        <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-warm-yellow/20 via-transparent to-transparent -z-10 blur-sm" />

                        {/* Avatar + Name */}
                        <div className="flex items-center gap-3 sm:gap-4 mb-5">
                            {profile?.avatar ? (
                                <img
                                    src={profile.avatar}
                                    alt="Avatar"
                                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-3 border-warm-yellow shadow-md shrink-0"
                                />
                            ) : (
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-warm-yellow to-amber-400 flex items-center justify-center shadow-md text-xl font-black text-ink shrink-0">
                                    {initials}
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <h2 className="text-base sm:text-lg font-bold text-ink truncate">{user?.name}</h2>
                                <p className="text-xs sm:text-sm text-slate truncate">{user?.email}</p>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full bg-warm-yellow-light border border-warm-yellow/30 text-xs font-bold text-ink shrink-0">
                                <Star className="w-3.5 h-3.5" strokeWidth={2.5} />
                                <span className="hidden sm:inline">
                                    {(profile?.tier?.charAt(0).toUpperCase() ?? '') + (profile?.tier?.slice(1) ?? 'Free')}
                                </span>
                            </div>
                        </div>

                        {/* Bio */}
                        {profile?.bio && (
                            <div className="mb-4 p-3.5 bg-cream-dark/50 rounded-2xl">
                                <p className="text-sm text-ink-light leading-relaxed">{profile.bio}</p>
                            </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                            {[
                                { label: 'Rep', value: profile?.reputation ?? 0 },
                                { label: 'Skills', value: profile?.skills?.length ?? 0 },
                                { label: 'Interests', value: profile?.interests?.length ?? 0 },
                            ].map(({ label, value }) => (
                                <div key={label} className="text-center p-2.5 sm:p-3 bg-cream-dark/40 rounded-2xl">
                                    <div className="text-lg sm:text-xl font-black text-ink">{value}</div>
                                    <div className="text-[10px] sm:text-[11px] font-semibold text-muted uppercase tracking-wider mt-0.5">{label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Tags */}
                        {(profile?.skills?.length > 0 || profile?.interests?.length > 0) && (
                            <div className="space-y-3">
                                {profile.skills?.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <Code className="w-3.5 h-3.5 text-muted" strokeWidth={2} />
                                            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Skills</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {profile.skills.map((skill) => (
                                                <span key={skill} className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-warm-yellow/20 to-amber-300/15 text-xs font-semibold text-ink border border-warm-yellow/20">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {profile.interests?.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <Heart className="w-3.5 h-3.5 text-muted" strokeWidth={2} />
                                            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Interests</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {profile.interests.map((interest) => (
                                                <span key={interest} className="px-2.5 py-1.5 rounded-lg bg-ink/5 text-xs font-semibold text-ink-light border border-border-warm">
                                                    {interest}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* ── Quick Actions ── */}
                <div className="mt-4 space-y-2.5">
                    {quickActions.map((action) => (
                        <div
                            key={action.path}
                            onClick={() => navigate(action.path)}
                            className={`flex items-center justify-between px-4 sm:px-5 py-4
                                bg-white/50 backdrop-blur-xl rounded-2xl border ${action.border ?? 'border-white/40'}
                                hover:bg-white/70 active:scale-[0.98] transition-all duration-200 cursor-pointer group
                                transition-all duration-700 ${action.delay} ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-full ${action.iconBg} flex items-center justify-center shrink-0`}>
                                    {action.icon}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-ink">{action.label}</p>
                                    <p className="text-xs text-muted">{action.desc}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted group-hover:text-ink transition-colors shrink-0" strokeWidth={2} />
                        </div>
                    ))}
                </div>
            </main>

            {/* ── Wave accent ── */}
            <div className="pointer-events-none relative z-0 mt-auto">
                <svg viewBox="0 0 390 50" className="w-full block" preserveAspectRatio="none">
                    <path d="M0 25 Q97.5 0 195 25 Q292.5 50 390 25 L390 50 L0 50Z" fill="rgba(255,215,0,0.12)" />
                </svg>
            </div>
        </div>
    );
};

export default DashboardPage;
