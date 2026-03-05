import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
    Shield, Sparkles, LogOut, Trash2, XCircle, UserX,
    AlertTriangle, Flag, ChevronDown, ChevronUp, ArrowLeft,
    AlertOctagon, Clock, ShieldOff, BookOpen, Check, Search,
    RefreshCw, ShieldCheck, UserCheck
} from 'lucide-react';
import Button from '../components/Button';
import { useAdminStore } from '../stores/adminStore';
import { useAuthStore } from '../stores/authStore';
import { useWorkspaceStore } from '../stores/workspaceStore';

// ── Action type badge ─────────────────────────────────────────────────────────
const ActionBadge = ({ type }) => {
    const map = {
        warn: { label: 'Warn', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
        suspend: { label: 'Suspend', cls: 'bg-orange-100 text-orange-700 border-orange-200' },
        ban: { label: 'Ban', cls: 'bg-rose-100 text-rose-700 border-rose-200' },
        unban: { label: 'Unban', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
        delete_post: { label: 'Delete Post', cls: 'bg-red-100 text-red-700 border-red-200' },
        dismiss: { label: 'Dismiss', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
    };
    const { label, cls } = map[type] ?? { label: type, cls: 'bg-slate-100 text-slate-600 border-slate-200' };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cls}`}>
            {label}
        </span>
    );
};

// ── Quick action dropdown (portal) ────────────────────────────────────────────
const ActionDropdown = ({ item, communityId, onAction, isAdmin }) => {
    const [open, setOpen] = useState(false);
    const [dropPos, setDropPos] = useState({ top: 0, right: 0 });
    const [reasonInput, setReasonInput] = useState('');
    const [step, setStep] = useState('menu'); // 'menu' | 'reason'
    const [pendingAction, setPendingAction] = useState(null);
    const [loading, setLoading] = useState(false);
    const btnRef = useRef(null);

    const authorId = item.authorId?._id ?? item.author?._id;

    const handleToggle = () => {
        if (!open && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setDropPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
        }
        if (open) { setStep('menu'); setReasonInput(''); setPendingAction(null); }
        setOpen((o) => !o);
    };

    const handlePickAction = (action) => {
        if (action === 'dismiss') { execAction(action); return; }
        if (action === 'delete') { execAction(action); return; }
        setPendingAction(action);
        setStep('reason');
    };

    const execAction = async (action, reason = '') => {
        setLoading(true);
        setOpen(false);
        setStep('menu');
        setReasonInput('');
        setPendingAction(null);
        await onAction(action, item._id, authorId, reason);
        setLoading(false);
    };

    const menuItems = [
        { id: 'warn', label: 'Warn User', icon: AlertTriangle, cls: 'text-amber-600 hover:bg-amber-50' },
        { id: 'suspend_24h', label: 'Suspend 24h', icon: Clock, cls: 'text-orange-600 hover:bg-orange-50' },
        { id: 'suspend_7d', label: 'Suspend 7 Days', icon: Clock, cls: 'text-orange-600 hover:bg-orange-50' },
        ...(isAdmin ? [{ id: 'ban', label: 'Ban User', icon: ShieldOff, cls: 'text-rose-600 hover:bg-rose-50' }] : []),
        { id: 'delete', label: 'Delete Content', icon: Trash2, cls: 'text-red-600 hover:bg-red-50', border: true },
        { id: 'dismiss', label: 'Dismiss Flag', icon: XCircle, cls: 'text-emerald-600 hover:bg-emerald-50' },
    ];

    return (
        <div>
            <button
                ref={btnRef}
                onClick={handleToggle}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                    bg-ink text-white hover:bg-ink/80
                    transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
                {loading
                    ? <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    : <>Actions <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={2} /></>
                }
            </button>

            {open && createPortal(
                <>
                    <div className="fixed inset-0 z-[9990]" onClick={handleToggle} />
                    <div
                        style={{ top: dropPos.top, right: dropPos.right }}
                        className="fixed w-52 bg-white/98 backdrop-blur-2xl border border-white/60 rounded-xl shadow-2xl z-[9999] overflow-hidden animate-slide-down"
                    >
                        {step === 'menu' ? (
                            <>
                                <div className="px-3 py-2 border-b border-slate-100">
                                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Moderation Actions</span>
                                </div>
                                {menuItems.map(({ id, label, icon: Icon, cls, border }) => (
                                    <button
                                        key={id}
                                        onClick={() => handlePickAction(id)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-xs font-semibold transition-colors cursor-pointer ${cls} ${border ? 'border-t border-slate-100 mt-1' : ''}`}
                                    >
                                        <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                                        {label}
                                    </button>
                                ))}
                            </>
                        ) : (
                            <div className="p-3">
                                <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Reason (optional)</p>
                                <textarea
                                    autoFocus
                                    value={reasonInput}
                                    onChange={(e) => setReasonInput(e.target.value)}
                                    placeholder="Enter a reason…"
                                    rows={3}
                                    className="w-full text-xs text-ink placeholder:text-muted/60 bg-cream rounded-lg border border-border-warm p-2 resize-none outline-none focus:border-warm-yellow transition-colors"
                                />
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => { setStep('menu'); setPendingAction(null); }}
                                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-border-warm text-slate hover:bg-cream-dark/60 cursor-pointer transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => execAction(pendingAction, reasonInput)}
                                        className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 cursor-pointer transition-colors"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>,
                document.body
            )}
        </div>
    );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const ModerationPage = () => {
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('queue');
    const [expandedId, setExpandedId] = useState(null);
    const [logSearch, setLogSearch] = useState('');
    const [toast, setToast] = useState('');
    const navigate = useNavigate();

    const { queue, total, auditLogs, isLoading, isLogsLoading, error, fetchQueue, fetchAuditLogs, resolveFlag, deletePost, warnUser, suspendUser, banUser, clearError } = useAdminStore();
    const { user, logout } = useAuthStore();
    const { activeCommunityId } = useWorkspaceStore();

    const isAdmin = user?.role === 'admin';

    // Derive communityId — prefer workspace store, fall back to first admin/mod membership
    const fallbackCommunityId = (() => {
        const adminMembership = (user?.memberships ?? []).find(
            (m) => ['admin', 'moderator'].includes(m.role)
        );
        return adminMembership?.communityId?._id ?? adminMembership?.communityId ?? null;
    })();
    const communityId = activeCommunityId || fallbackCommunityId;

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 80);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (communityId) fetchQueue(communityId);
    }, [communityId]);

    useEffect(() => {
        if (activeTab === 'logs' && communityId) fetchAuditLogs(communityId);
    }, [activeTab, communityId]);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleLogout = async () => { await logout(); navigate('/login'); };

    const handleAction = async (action, postId, authorId, reason = '') => {
        try {
            if (action === 'dismiss') {
                await resolveFlag(postId, communityId);
                showToast('Flag dismissed');
            } else if (action === 'delete') {
                await deletePost(postId, communityId, reason);
                showToast('Post deleted');
            } else if (action === 'warn') {
                await warnUser(authorId, communityId, reason);
                showToast('Warning issued');
            } else if (action === 'suspend_24h') {
                await suspendUser(authorId, communityId, '24h', reason);
                showToast('User suspended for 24h');
            } else if (action === 'suspend_7d') {
                await suspendUser(authorId, communityId, '7d', reason);
                showToast('User suspended for 7 days');
            } else if (action === 'ban') {
                await banUser(authorId, communityId, reason);
                showToast('User banned from community');
            }
            // Refresh logs quietly if tab is active
            if (activeTab === 'logs') fetchAuditLogs(communityId);
        } catch { /* error in store */ }
    };

    const timeAgo = (date) => {
        if (!date) return '';
        const s = Math.floor((new Date() - new Date(date)) / 1000);
        if (s < 60) return 'just now';
        const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
        const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
        const d = Math.floor(h / 24); if (d < 30) return `${d}d ago`;
        return new Date(date).toLocaleDateString();
    };

    const filteredLogs = auditLogs.filter((l) => {
        const q = logSearch.toLowerCase();
        return (
            l.moderatorId?.name?.toLowerCase().includes(q) ||
            l.targetUserId?.name?.toLowerCase().includes(q) ||
            l.actionType?.toLowerCase().includes(q) ||
            l.reason?.toLowerCase().includes(q)
        );
    });

    const tabs = [
        { id: 'queue', label: 'Review Queue', icon: Flag, count: total },
        { id: 'logs', label: 'Audit Logs', icon: BookOpen, count: null },
    ];

    return (
        <div className="min-h-screen min-h-[100dvh] bg-cream relative overflow-hidden flex flex-col">
            {/* Ambient */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-28 -left-24 w-72 h-72 rounded-full bg-gradient-to-br from-rose-500/10 to-amber-300/10 blur-3xl" />
                <div className="absolute bottom-[20%] -right-20 w-56 h-56 rounded-full bg-warm-yellow/[0.06] blur-3xl" />
                <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-warm-yellow/[0.12] to-transparent" />
                <div className="absolute inset-0 opacity-[0.025]"
                    style={{ backgroundImage: 'radial-gradient(circle, #1A1A1A 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            </div>

            {/* Header */}
            <header className={`sticky top-0 z-30 bg-cream/80 backdrop-blur-xl border-b border-border-warm/30
                flex items-center justify-between px-4 sm:px-8 py-3.5
                transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}>
                <div className="flex items-center gap-2 shrink-0">
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-warm-yellow to-warm-yellow-hover flex items-center justify-center shadow-sm">
                            <Sparkles className="w-4 h-4 text-ink" strokeWidth={2.5} />
                        </div>
                        <span className="text-sm font-bold tracking-tight text-ink hidden sm:inline">CircleCore</span>
                    </Link>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20">
                        <Shield className="w-3.5 h-3.5 text-rose-500" strokeWidth={2} />
                        <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider capitalize">{user?.role || 'Mod'}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/feed')}>
                        <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
                        <span className="hidden sm:inline ml-1">Back to Feed</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleLogout} icon={<LogOut className="w-3.5 h-3.5" strokeWidth={2} />}>
                        <span className="hidden sm:inline">Log Out</span>
                    </Button>
                </div>
            </header>

            {/* Toast */}
            {toast && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
                    <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-ink text-white text-sm font-semibold shadow-2xl">
                        <Check className="w-4 h-4 text-emerald-400" strokeWidth={2.5} />
                        {toast}
                    </div>
                </div>
            )}

            {/* Body */}
            <main className="relative z-10 flex-1 w-full max-w-[960px] mx-auto px-4 sm:px-8 py-8">

                {/* Title + Stats */}
                <div className={`mb-6 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-md">
                            <Shield className="w-5 h-5 text-white" strokeWidth={2} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink">Moderation</h1>
                            <p className="text-sm text-slate font-medium">Review flagged content and manage community safety.</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Flagged', value: total, icon: Flag, color: 'text-rose-500', bg: 'text-rose-500' },
                            { label: 'High Priority', value: queue.filter((p) => p.flagCount >= 3).length, icon: AlertOctagon, color: 'text-amber-500' },
                            { label: 'Your Role', value: <span className="capitalize text-lg">{user?.role || 'mod'}</span>, icon: ShieldCheck, color: 'text-emerald-500' },
                        ].map(({ label, value, icon: Icon, color }) => (
                            <div key={label} className="bg-white/70 backdrop-blur-2xl rounded-xl p-4 border border-white/60 shadow-sm">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Icon className={`w-3.5 h-3.5 ${color}`} strokeWidth={2} />
                                    <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">{label}</span>
                                </div>
                                <p className="text-2xl font-black text-ink">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className={`flex gap-1 mb-6 bg-white/50 backdrop-blur rounded-xl p-1 border border-white/60 shadow-sm transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    {tabs.map(({ id, label, icon: Icon, count }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer
                                ${activeTab === id ? 'bg-white shadow-sm text-ink' : 'text-muted hover:text-ink'}`}
                        >
                            <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                            {label}
                            {count != null && count > 0 && (
                                <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                                    {count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Error banner */}
                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-error/10 border border-error/20 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-error shrink-0" strokeWidth={2} />
                        <p className="text-xs font-semibold text-error flex-1">{error}</p>
                        <button onClick={clearError} className="text-xs font-bold text-error hover:underline cursor-pointer">Dismiss</button>
                    </div>
                )}

                {/* ── Review Queue Tab ── */}
                {activeTab === 'queue' && (
                    <div className={`space-y-3 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-muted font-semibold">{queue.length} item{queue.length !== 1 ? 's' : ''} in queue</p>
                            <button onClick={() => fetchQueue(communityId)} className="flex items-center gap-1 text-xs text-muted hover:text-ink cursor-pointer transition-colors">
                                <RefreshCw className="w-3 h-3" strokeWidth={2} /> Refresh
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-8 h-8 rounded-full border-3 border-rose-500 border-t-transparent animate-spin" />
                            </div>
                        ) : queue.length > 0 ? (
                            queue.map((item, i) => {
                                const initials = item.author?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';
                                const isExpanded = expandedId === item._id;
                                return (
                                    <div
                                        key={item._id}
                                        className="bg-white/70 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                                        style={{ animationDelay: `${i * 40}ms` }}
                                    >
                                        <div className="flex items-center gap-3 p-4 sm:p-5">
                                            {/* Priority dot */}
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.flagCount >= 3 ? 'bg-gradient-to-br from-rose-500 to-rose-600' : 'bg-gradient-to-br from-amber-400 to-amber-500'}`}>
                                                <Flag className="w-4 h-4 text-white" strokeWidth={2.5} />
                                            </div>

                                            {/* Author */}
                                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                {item.author?.avatar
                                                    ? <img src={item.author.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-border-warm shrink-0" />
                                                    : <div className="w-8 h-8 rounded-full bg-cream-dark flex items-center justify-center text-[10px] font-bold text-slate shrink-0">{initials}</div>
                                                }
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold text-ink truncate">{item.author?.name || 'Unknown'}</p>
                                                        <span className="text-[10px] font-semibold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded shrink-0">
                                                            {item.flagCount} {item.flagCount === 1 ? 'flag' : 'flags'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted truncate">{timeAgo(item.flaggedAt)}</p>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <ActionDropdown
                                                    item={item}
                                                    communityId={communityId}
                                                    onAction={handleAction}
                                                    isAdmin={isAdmin}
                                                />
                                                <button
                                                    onClick={() => setExpandedId(isExpanded ? null : item._id)}
                                                    className="w-8 h-8 rounded-lg hover:bg-cream-dark/60 flex items-center justify-center cursor-pointer transition-colors"
                                                >
                                                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted" strokeWidth={2} /> : <ChevronDown className="w-4 h-4 text-muted" strokeWidth={2} />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded content */}
                                        {isExpanded && (
                                            <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 animate-fade-in">
                                                <div className="p-4 rounded-xl bg-cream-dark/30 border border-border-warm/50">
                                                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Post Content</p>
                                                    <p className="text-sm text-ink-light leading-relaxed whitespace-pre-wrap">
                                                        {item.content || <span className="italic text-muted">No text content</span>}
                                                    </p>
                                                    {item.mediaURLs?.length > 0 && (
                                                        <div className="flex gap-2 mt-3 overflow-x-auto">
                                                            {item.mediaURLs.map((url, mi) => (
                                                                <img key={mi} src={url} alt="" className="w-20 h-20 rounded-lg object-cover border border-border-warm shrink-0" />
                                                            ))}
                                                        </div>
                                                    )}
                                                    {item.flagReason && (
                                                        <div className="mt-3 p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/10">
                                                            <p className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider mb-0.5">Flag Reason</p>
                                                            <p className="text-xs text-ink-light">{item.flagReason}</p>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-4 mt-3 text-[11px] text-muted">
                                                        <span>❤️ {item.likesCount || 0} likes</span>
                                                        <span>💬 {item.commentsCount || 0} comments</span>
                                                        {item.author?.reputation > 0 && <span>⭐ {item.author.reputation} rep</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-20">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                                    <Shield className="w-7 h-7 text-emerald-500" strokeWidth={1.5} />
                                </div>
                                <p className="text-sm font-bold text-ink mb-1">All Clear!</p>
                                <p className="text-xs text-muted">No flagged content to review 🎉</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Audit Logs Tab ── */}
                {activeTab === 'logs' && (
                    <div className={`transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        {/* Search + refresh */}
                        <div className="flex gap-2 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" strokeWidth={2} />
                                <input
                                    type="text"
                                    placeholder="Search logs by user, action, reason…"
                                    value={logSearch}
                                    onChange={(e) => setLogSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-border-warm bg-white/60
                                        text-xs text-ink placeholder:text-muted/60 font-medium
                                        outline-none focus:border-warm-yellow focus:bg-white transition-all"
                                />
                            </div>
                            <button
                                onClick={() => fetchAuditLogs(communityId)}
                                className="px-3 py-2.5 rounded-xl border-2 border-border-warm bg-white/60 text-muted hover:text-ink cursor-pointer transition-colors"
                            >
                                <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />
                            </button>
                        </div>

                        {isLogsLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-8 h-8 rounded-full border-3 border-rose-500 border-t-transparent animate-spin" />
                            </div>
                        ) : (
                            <div className="bg-white/70 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-sm overflow-hidden">
                                {/* Table head */}
                                <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_1fr_auto] gap-4 px-5 py-3 border-b border-border-warm/20 bg-cream-dark/30">
                                    {['Moderator', 'Target', 'Action', 'Reason', 'Time'].map((h) => (
                                        <span key={h} className="text-[10px] font-bold text-muted uppercase tracking-wider">{h}</span>
                                    ))}
                                </div>

                                {filteredLogs.length === 0 ? (
                                    <div className="text-center py-16">
                                        <BookOpen className="w-8 h-8 text-muted mx-auto mb-3" strokeWidth={1.5} />
                                        <p className="text-sm font-semibold text-ink mb-1">No log entries yet</p>
                                        <p className="text-xs text-muted">{logSearch ? 'Try a different search.' : 'Moderator actions will appear here.'}</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border-warm/15">
                                        {filteredLogs.map((log) => (
                                            <div key={log._id} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_1fr_auto] gap-2 sm:gap-4 px-5 py-3.5 hover:bg-warm-yellow/[0.03] transition-colors items-center">
                                                {/* Moderator */}
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                                                        {log.moderatorId?.name?.charAt(0).toUpperCase() ?? '?'}
                                                    </div>
                                                    <span className="text-xs font-semibold text-ink truncate">{log.moderatorId?.name ?? 'Unknown'}</span>
                                                </div>

                                                {/* Target */}
                                                <div className="flex items-center gap-2">
                                                    {log.targetUserId ? (
                                                        <>
                                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                                                                {log.targetUserId?.name?.charAt(0).toUpperCase() ?? '?'}
                                                            </div>
                                                            <span className="text-xs text-slate truncate">{log.targetUserId?.name ?? '—'}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-muted italic">—</span>
                                                    )}
                                                </div>

                                                {/* Action badge */}
                                                <div><ActionBadge type={log.actionType} /></div>

                                                {/* Reason */}
                                                <p className="text-xs text-muted truncate">{log.reason || <span className="italic">No reason given</span>}</p>

                                                {/* Time */}
                                                <p className="text-[11px] text-muted font-medium whitespace-nowrap">{timeAgo(log.createdAt)}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <p className="text-center text-xs text-muted mt-3">
                            Showing {filteredLogs.length} of {auditLogs.length} log{auditLogs.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                )}
            </main>

            {/* Wave */}
            <div className="pointer-events-none relative z-0 mt-auto">
                <svg viewBox="0 0 390 50" className="w-full block" preserveAspectRatio="none">
                    <path d="M0 25 Q97.5 0 195 25 Q292.5 50 390 25 L390 50 L0 50Z" fill="rgba(255,215,0,0.12)" />
                </svg>
            </div>
        </div>
    );
};

export default ModerationPage;
