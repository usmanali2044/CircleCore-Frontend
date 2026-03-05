import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Sparkles, LogOut, ArrowLeft, Mail, Send, Check,
    Shield, Users, Ticket, AlertTriangle, Link2, ChevronDown, Building2,
} from 'lucide-react';
import Button from '../components/Button';
import InputField from '../components/InputField';
import { useCommunityStore } from '../stores/communityStore';
import { useAuthStore } from '../stores/authStore';

const InviteManagementPage = () => {
    const [mounted, setMounted] = useState(false);
    const [guestEmail, setGuestEmail] = useState('');
    const [copiedId, setCopiedId] = useState(null);
    const [toastMsg, setToastMsg] = useState('');
    const [pickerOpen, setPickerOpen] = useState(false);
    const navigate = useNavigate();

    const {
        community, myCommunities, inviteCodes, isLoading, error, successMessage,
        fetchMyCommunities, generateInvite, fetchInviteCodes,
        selectCommunity, clearError, clearSuccess,
    } = useCommunityStore();
    const { logout } = useAuthStore();

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 80);
        return () => clearTimeout(t);
    }, []);

    // Fetch all admin-owned communities on mount
    useEffect(() => {
        fetchMyCommunities().catch(() => { /* handled in store */ });
    }, []);

    // Whenever the selected community changes, refresh its invite codes
    useEffect(() => {
        if (community?._id) {
            fetchInviteCodes(community._id);
        }
    }, [community?._id]);

    // Show toast on success
    useEffect(() => {
        if (successMessage) {
            setToastMsg(successMessage);
            const t = setTimeout(() => {
                setToastMsg('');
                clearSuccess();
            }, 3000);
            return () => clearTimeout(t);
        }
    }, [successMessage]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleSendInvite = async (e) => {
        e.preventDefault();
        if (!community?._id) return;
        try {
            await generateInvite(community._id, guestEmail.trim() || undefined);
            setGuestEmail('');
        } catch {
            // error in store
        }
    };

    const handleSelectCommunity = (c) => {
        selectCommunity(c);
        setPickerOpen(false);
        setGuestEmail('');
    };

    const copyLink = useCallback(async (code) => {
        const link = `${window.location.origin}/signup?code=${code}`;
        try {
            await navigator.clipboard.writeText(link);
            setCopiedId(code);
            setToastMsg('Link copied to clipboard!');
            setTimeout(() => { setCopiedId(null); setToastMsg(''); }, 2000);
        } catch {
            const el = document.createElement('textarea');
            el.value = link;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            setCopiedId(code);
            setTimeout(() => setCopiedId(null), 2000);
        }
    }, []);

    const noCommunity = !community && !isLoading;
    const multiCommunity = myCommunities.length > 1;

    const COLORS = [
        'from-violet-500 to-purple-600',
        'from-blue-500 to-cyan-600',
        'from-emerald-500 to-teal-600',
        'from-rose-500 to-pink-600',
        'from-amber-500 to-orange-600',
    ];

    return (
        <div className="min-h-screen min-h-[100dvh] bg-cream relative overflow-hidden flex flex-col">
            {/* Ambient background */}
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

            {/* Header */}
            <header
                className={`sticky top-0 z-30 bg-cream/80 backdrop-blur-xl border-b border-border-warm/30
                    flex items-center justify-between px-4 sm:px-8 py-3.5
                    transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}
            >
                <div className="flex items-center gap-2 shrink-0">
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-warm-yellow to-warm-yellow-hover flex items-center justify-center shadow-sm">
                            <Sparkles className="w-4 h-4 text-ink" strokeWidth={2.5} />
                        </div>
                        <span className="text-sm font-bold tracking-tight text-ink hidden sm:inline">CircleCore</span>
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-warm-yellow/10 border border-warm-yellow/20">
                        <Shield className="w-3.5 h-3.5 text-amber-600" strokeWidth={2} />
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Admin</span>
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
            {toastMsg && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
                    <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-ink text-white text-sm font-semibold shadow-2xl">
                        <Check className="w-4 h-4 text-emerald-400" strokeWidth={2.5} />
                        {toastMsg}
                    </div>
                </div>
            )}

            {/* Body */}
            <main className="relative z-40 flex-1 w-full max-w-[900px] mx-auto px-4 sm:px-8 py-8">

                {/* Title + Community Picker */}
                <div className={`relative z-50 mb-8 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warm-yellow to-amber-500 flex items-center justify-center shadow-md">
                                <Users className="w-5 h-5 text-white" strokeWidth={2} />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink">Invite Management</h1>
                                <p className="text-sm text-slate font-medium">
                                    {community?.name ? `Managing invites for ${community.name}` : 'Send invites and manage access codes.'}
                                </p>
                            </div>
                        </div>

                        {/* ── Community Picker (only shown when admin has multiple communities) ── */}
                        {multiCommunity && (
                            <div className="relative shrink-0 z-50">
                                <button
                                    id="community-picker-btn"
                                    onClick={() => setPickerOpen((o) => !o)}
                                    className="flex items-center gap-2.5 px-4 py-2.5 bg-white/70 backdrop-blur-xl border border-white/60
                                        rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer text-sm font-semibold text-ink"
                                >
                                    <Building2 className="w-4 h-4 text-amber-500 shrink-0" strokeWidth={2} />
                                    <span className="max-w-[140px] truncate">{community?.name || 'Select Community'}</span>
                                    <ChevronDown
                                        className={`w-4 h-4 text-muted transition-transform duration-200 ${pickerOpen ? 'rotate-180' : ''}`}
                                        strokeWidth={2}
                                    />
                                </button>

                                {/* Dropdown */}
                                {pickerOpen && (
                                    <>
                                        {/* Backdrop */}
                                        <div className="fixed inset-0 z-30" onClick={() => setPickerOpen(false)} />
                                        <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-2xl z-40 overflow-hidden animate-slide-down">
                                            <div className="px-3 py-2 border-b border-border-warm/30">
                                                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Your Communities</span>
                                            </div>
                                            <div className="py-1.5 max-h-64 overflow-y-auto">
                                                {myCommunities.map((c, i) => {
                                                    const isSelected = c._id === community?._id;
                                                    return (
                                                        <button
                                                            key={c._id}
                                                            onClick={() => handleSelectCommunity(c)}
                                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer
                                                                ${isSelected ? 'bg-warm-yellow/10' : 'hover:bg-cream-dark/60'}`}
                                                        >
                                                            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${COLORS[i % COLORS.length]} flex items-center justify-center shrink-0 text-white font-black text-xs`}>
                                                                {c.name?.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-sm font-semibold truncate ${isSelected ? 'text-amber-700' : 'text-ink'}`}>{c.name}</p>
                                                                <p className="text-[11px] text-muted truncate">{c.members?.length ?? 0} members</p>
                                                            </div>
                                                            {isSelected && (
                                                                <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" strokeWidth={2.5} />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Loading state */}
                {isLoading && !community && (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 rounded-full border-3 border-warm-yellow border-t-transparent animate-spin" />
                    </div>
                )}

                {/* No community prompt */}
                {noCommunity && (
                    <div className={`transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <div className="bg-white/70 backdrop-blur-2xl rounded-2xl p-8 border border-white/60 shadow-sm text-center">
                            <div className="w-16 h-16 rounded-2xl bg-warm-yellow/10 flex items-center justify-center mx-auto mb-4">
                                <Ticket className="w-7 h-7 text-amber-500" strokeWidth={1.5} />
                            </div>
                            <p className="text-sm font-bold text-ink mb-2">No community found</p>
                            <p className="text-xs text-muted mb-4 max-w-sm mx-auto">
                                You haven't created a community yet. Head to the invite page to create your workspace first.
                            </p>
                            <Button variant="primary" onClick={() => navigate('/invite')}>
                                Create Workspace
                            </Button>
                        </div>
                    </div>
                )}

                {/* Main content when community is selected */}
                {community && (
                    <>
                        {/* Stats bar */}
                        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            <div className="bg-white/70 backdrop-blur-2xl rounded-xl p-4 border border-white/60 shadow-sm">
                                <div className="flex items-center gap-2 mb-1">
                                    <Ticket className="w-4 h-4 text-amber-500" strokeWidth={2} />
                                    <span className="text-xs font-semibold text-muted uppercase tracking-wider">Total Codes</span>
                                </div>
                                <p className="text-2xl font-black text-ink">{inviteCodes.length}</p>
                            </div>
                            <div className="bg-white/70 backdrop-blur-2xl rounded-xl p-4 border border-white/60 shadow-sm">
                                <div className="flex items-center gap-2 mb-1">
                                    <Check className="w-4 h-4 text-emerald-500" strokeWidth={2} />
                                    <span className="text-xs font-semibold text-muted uppercase tracking-wider">Active</span>
                                </div>
                                <p className="text-2xl font-black text-ink">{inviteCodes.filter((c) => !c.isUsed).length}</p>
                            </div>
                            <div className="bg-white/70 backdrop-blur-2xl rounded-xl p-4 border border-white/60 shadow-sm">
                                <div className="flex items-center gap-2 mb-1">
                                    <Users className="w-4 h-4 text-blue-500" strokeWidth={2} />
                                    <span className="text-xs font-semibold text-muted uppercase tracking-wider">Redeemed</span>
                                </div>
                                <p className="text-2xl font-black text-ink">{inviteCodes.filter((c) => c.isUsed).length}</p>
                            </div>
                        </div>

                        {/* Error banner */}
                        {error && (
                            <div className="mb-4 p-3 rounded-xl bg-error/10 border border-error/20 flex items-center gap-2 animate-fade-in">
                                <AlertTriangle className="w-4 h-4 text-error shrink-0" strokeWidth={2} />
                                <p className="text-xs font-semibold text-error flex-1">{error}</p>
                                <button onClick={clearError} className="text-xs font-bold text-error hover:underline cursor-pointer">Dismiss</button>
                            </div>
                        )}

                        {/* Send Invite Form */}
                        <div className={`mb-8 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            <div className="bg-white/70 backdrop-blur-2xl rounded-2xl p-5 sm:p-6 border border-white/60 shadow-sm">
                                <h2 className="text-lg font-bold text-ink mb-1 flex items-center gap-2">
                                    <Send className="w-4 h-4 text-amber-500" strokeWidth={2} />
                                    Send Invite
                                </h2>
                                <p className="text-xs text-muted mb-4 font-medium">
                                    Inviting to: <span className="font-bold text-ink">{community.name}</span>
                                </p>
                                <form onSubmit={handleSendInvite} className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1">
                                        <InputField
                                            id="guest-email"
                                            label=""
                                            type="email"
                                            placeholder="Guest's email (optional — leave blank for code-only)"
                                            value={guestEmail}
                                            onChange={(e) => setGuestEmail(e.target.value)}
                                            icon={<Mail className="w-4 h-4" strokeWidth={2} />}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        loading={isLoading}
                                        icon={!isLoading && <Send className="w-4 h-4" strokeWidth={2} />}
                                        className="sm:self-start sm:mt-0.5"
                                    >
                                        {isLoading ? 'Sending…' : guestEmail.trim() ? 'Send Invite' : 'Generate Code'}
                                    </Button>
                                </form>
                                <p className="mt-3 text-xs text-muted font-medium">
                                    {guestEmail.trim()
                                        ? 'An HTML invite email will be sent with a unique code and "Join Now" link.'
                                        : 'A unique invite code will be generated. You can share the link manually.'
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Invite Codes Table */}
                        <div className={`transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
                                <Ticket className="w-4 h-4 text-amber-500" strokeWidth={2} />
                                Invite Codes
                                <span className="text-xs font-medium text-muted">— {community.name}</span>
                            </h2>

                            {isLoading && inviteCodes.length === 0 ? (
                                <div className="flex items-center justify-center py-16">
                                    <div className="w-8 h-8 rounded-full border-3 border-warm-yellow border-t-transparent animate-spin" />
                                </div>
                            ) : inviteCodes.length > 0 ? (
                                <div className="space-y-2">
                                    {inviteCodes.map((inv) => (
                                        <div
                                            key={inv._id || inv.code}
                                            className="bg-white/70 backdrop-blur-2xl rounded-xl border border-white/60 shadow-sm
                                                flex items-center gap-3 p-3.5 sm:p-4 hover:shadow-md transition-all duration-200"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-ink font-mono tracking-wide truncate">{inv.code}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${inv.isUsed
                                                        ? 'bg-muted/10 text-muted'
                                                        : 'bg-emerald-500/10 text-emerald-600'
                                                        }`}>
                                                        {inv.isUsed ? 'Used' : 'Active'}
                                                    </span>
                                                    {inv.expiresAt && (
                                                        <span className="text-[10px] text-muted">
                                                            Expires {new Date(inv.expiresAt).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {!inv.isUsed && (
                                                <button
                                                    onClick={() => copyLink(inv.code)}
                                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold
                                                        bg-warm-yellow/10 text-amber-700 border border-warm-yellow/20
                                                        hover:bg-warm-yellow/20 transition-all cursor-pointer shrink-0"
                                                >
                                                    {copiedId === inv.code ? (
                                                        <>
                                                            <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
                                                            <span className="hidden sm:inline">Copied!</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Link2 className="w-3.5 h-3.5" strokeWidth={2} />
                                                            <span className="hidden sm:inline">Copy Link</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="w-16 h-16 rounded-2xl bg-warm-yellow/10 flex items-center justify-center mx-auto mb-4">
                                        <Ticket className="w-7 h-7 text-amber-400" strokeWidth={1.5} />
                                    </div>
                                    <p className="text-sm font-bold text-ink mb-1">No invite codes yet</p>
                                    <p className="text-xs text-muted">Generate your first invite code using the form above.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>

            {/* Wave accent */}
            <div className="pointer-events-none relative z-0 mt-auto">
                <svg viewBox="0 0 390 50" className="w-full block" preserveAspectRatio="none">
                    <path d="M0 25 Q97.5 0 195 25 Q292.5 50 390 25 L390 50 L0 50Z" fill="rgba(255,215,0,0.12)" />
                </svg>
            </div>
        </div>
    );
};

export default InviteManagementPage;
