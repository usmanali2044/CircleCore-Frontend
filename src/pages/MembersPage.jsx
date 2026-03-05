import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Sparkles, LogOut, ArrowLeft, Users, Shield, Check, AlertTriangle,
    ChevronDown, Building2, ShieldCheck, UserCheck, UserMinus, Clock,
    Star, Search,
} from 'lucide-react';
import Button from '../components/Button';
import { createPortal } from 'react-dom';
import { useMemberStore } from '../stores/memberStore';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useAuthStore } from '../stores/authStore';

// ── Role badge ────────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
    const map = {
        admin: { label: 'Admin', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
        moderator: { label: 'Moderator', cls: 'bg-violet-100 text-violet-700 border-violet-200' },
        member: { label: 'Member', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
    };
    const { label, cls } = map[role] ?? map.member;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cls}`}>
            {role === 'admin' && <Shield className="w-2.5 h-2.5" strokeWidth={2.5} />}
            {role === 'moderator' && <ShieldCheck className="w-2.5 h-2.5" strokeWidth={2.5} />}
            {label}
        </span>
    );
};

// ── Avatar initial ─────────────────────────────────────────────────────────────
const Avatar = ({ name, avatar, size = 'md' }) => {
    const sizeMap = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm' };
    const cls = sizeMap[size] ?? sizeMap.md;
    const initial = name?.charAt(0).toUpperCase() ?? '?';
    if (avatar) {
        return <img src={avatar} alt={name} className={`${cls} rounded-full object-cover border-2 border-white shadow-sm shrink-0`} />;
    }
    return (
        <div className={`${cls} rounded-full bg-gradient-to-br from-warm-yellow to-amber-400 flex items-center justify-center font-black text-ink shadow-sm shrink-0`}>
            {initial}
        </div>
    );
};

// ── Role action dropdown ───────────────────────────────────────────────────────
const RoleDropdown = ({ member, communityId, onUpdate }) => {
    const [open, setOpen] = useState(false);
    const [dropPos, setDropPos] = useState({ top: 0, right: 0 });
    const [loading, setLoading] = useState(false);
    const btnRef = useRef(null);
    const { updateRole } = useMemberStore();

    if (member.communityRole === 'admin') {
        return <span className="text-[11px] text-muted font-medium italic">—</span>;
    }

    const actions = member.communityRole === 'moderator'
        ? [{ label: 'Demote to Member', role: 'member', icon: UserMinus, cls: 'text-rose-600 hover:bg-rose-50' }]
        : [{ label: 'Promote to Moderator', role: 'moderator', icon: UserCheck, cls: 'text-violet-600 hover:bg-violet-50' }];

    const handleToggle = () => {
        if (!open && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setDropPos({
                top: rect.bottom + 6,
                right: window.innerWidth - rect.right,
            });
        }
        setOpen((o) => !o);
    };

    const handleSelect = async (role) => {
        setOpen(false);
        setLoading(true);
        try {
            await updateRole(communityId, member._id, role);
            onUpdate?.();
        } catch {
            // error shown via store
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <button
                ref={btnRef}
                onClick={handleToggle}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                    bg-cream-dark/60 text-slate hover:bg-warm-yellow/10 hover:text-ink
                    border border-border-warm transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
                {loading
                    ? <div className="w-3 h-3 rounded-full border-2 border-ink border-t-transparent animate-spin" />
                    : <>Manage <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={2} /></>
                }
            </button>

            {open && createPortal(
                <>
                    {/* Full-screen backdrop to catch outside clicks */}
                    <div
                        className="fixed inset-0 z-[9990]"
                        onClick={() => setOpen(false)}
                    />
                    {/* Dropdown panel — fixed so it escapes any overflow:hidden ancestor */}
                    <div
                        style={{ top: dropPos.top, right: dropPos.right }}
                        className="fixed w-52 bg-white/95 backdrop-blur-2xl border border-white/60
                            rounded-xl shadow-2xl z-[9999] overflow-hidden animate-slide-down"
                    >
                        {actions.map(({ label, role, icon: Icon, cls }) => (
                            <button
                                key={role}
                                onClick={() => handleSelect(role)}
                                className={`w-full flex items-center gap-2.5 px-4 py-3 text-left text-xs font-semibold transition-colors cursor-pointer ${cls}`}
                            >
                                <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                                {label}
                            </button>
                        ))}
                    </div>
                </>,
                document.body
            )}
        </div>
    );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const MembersPage = () => {
    const [mounted, setMounted] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [toastMsg, setToastMsg] = useState('');
    const navigate = useNavigate();

    const { logout, user } = useAuthStore();
    const { activeCommunityId, setActiveCommunity } = useWorkspaceStore();
    const { members, isLoading, error, successMessage, fetchMembers, clearError, clearSuccess } = useMemberStore();

    // Build the list of communities where this user is admin or moderator
    // Sourced directly from user.memberships (populated communityId objects)
    const managedCommunities = (user?.memberships ?? []).filter(
        (m) => ['admin', 'moderator'].includes(m.role) && m.communityId?._id
    );

    // The currently selected community — match activeCommunityId against managed list
    const activeMembership = managedCommunities.find(
        (m) => (m.communityId?._id ?? m.communityId) === activeCommunityId
    ) ?? managedCommunities[0] ?? null;

    const activeCommunity = activeMembership
        ? { _id: activeMembership.communityId._id ?? activeMembership.communityId, name: activeMembership.communityId.name ?? 'Community' }
        : null;

    const isAdmin = user?.role === 'admin';
    const hasAccess = managedCommunities.length > 0;

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 80);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (activeCommunity?._id) fetchMembers(activeCommunity._id);
    }, [activeCommunity?._id]);

    useEffect(() => {
        if (successMessage) {
            setToastMsg(successMessage);
            const t = setTimeout(() => { setToastMsg(''); clearSuccess(); }, 3000);
            return () => clearTimeout(t);
        }
    }, [successMessage]);

    const handleLogout = async () => { await logout(); navigate('/login'); };
    const handleSelectCommunity = (membership) => {
        const id = membership.communityId?._id ?? membership.communityId;
        setActiveCommunity(id);
        setPickerOpen(false);
    };

    const COLORS = [
        'from-violet-500 to-purple-600', 'from-blue-500 to-cyan-600',
        'from-emerald-500 to-teal-600', 'from-rose-500 to-pink-600',
        'from-amber-500 to-orange-600',
    ];

    const multiCommunity = managedCommunities.length > 1;
    const noCommunity = !activeCommunity && !isLoading;

    const filtered = members.filter((m) =>
        m.name?.toLowerCase().includes(search.toLowerCase()) ||
        m.email?.toLowerCase().includes(search.toLowerCase())
    );

    const adminCount = members.filter((m) => m.communityRole === 'admin').length;
    const modCount = members.filter((m) => m.communityRole === 'moderator').length;
    const memberCount = members.filter((m) => m.communityRole === 'member').length;

    // === Non-member / no-access screen ===
    if (!hasAccess) {
        return (
            <div className="min-h-screen min-h-[100dvh] bg-cream flex flex-col items-center justify-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center mb-5">
                    <Shield className="w-7 h-7 text-rose-500" strokeWidth={1.5} />
                </div>
                <h1 className="text-xl font-black text-ink mb-2">Access Denied</h1>
                <p className="text-sm text-muted text-center max-w-xs mb-6">
                    You must be an admin or moderator of a community to view its member directory.
                </p>
                <Button variant="primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen min-h-[100dvh] bg-cream relative overflow-hidden flex flex-col">
            {/* Ambient background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-28 -left-24 w-72 h-72 rounded-full bg-gradient-to-br from-warm-yellow/15 to-amber-300/10 blur-3xl" />
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
            <main className="relative z-40 flex-1 w-full max-w-[960px] mx-auto px-4 sm:px-8 py-8">

                {/* Title + Community Picker */}
                <div className={`relative z-50 mb-8 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                                <Users className="w-5 h-5 text-white" strokeWidth={2} />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink">Member Directory</h1>
                                <p className="text-sm text-slate font-medium">
                                    {activeCommunity?.name ? `Members of ${activeCommunity.name}` : 'Select a community to view members.'}
                                </p>
                            </div>
                        </div>

                        {multiCommunity && (
                            <div className="relative shrink-0 z-50">
                                <button
                                    onClick={() => setPickerOpen((o) => !o)}
                                    className="flex items-center gap-2.5 px-4 py-2.5 bg-white/70 backdrop-blur-xl border border-white/60
                                        rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer text-sm font-semibold text-ink"
                                >
                                    <Building2 className="w-4 h-4 text-amber-500 shrink-0" strokeWidth={2} />
                                    <span className="max-w-[140px] truncate">{activeCommunity?.name || 'Select Community'}</span>
                                    <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-200 ${pickerOpen ? 'rotate-180' : ''}`} strokeWidth={2} />
                                </button>

                                {pickerOpen && (
                                    <>
                                        <div className="fixed inset-0 z-30" onClick={() => setPickerOpen(false)} />
                                        <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-2xl z-40 overflow-hidden animate-slide-down">
                                            <div className="px-3 py-2 border-b border-border-warm/30">
                                                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Your Communities</span>
                                            </div>
                                            <div className="py-1.5 max-h-64 overflow-y-auto">
                                                {managedCommunities.map((m, i) => {
                                                    const id = m.communityId?._id ?? m.communityId;
                                                    const name = m.communityId?.name ?? 'Community';
                                                    const isSelected = id === activeCommunity?._id;
                                                    return (
                                                        <button key={id} onClick={() => handleSelectCommunity(m)}
                                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer
                                                                ${isSelected ? 'bg-warm-yellow/10' : 'hover:bg-cream-dark/60'}`}>
                                                            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${COLORS[i % COLORS.length]} flex items-center justify-center shrink-0 text-white font-black text-xs`}>
                                                                {name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-sm font-semibold truncate ${isSelected ? 'text-amber-700' : 'text-ink'}`}>{name}</p>
                                                                <p className="text-[11px] text-muted capitalize">{m.role}</p>
                                                            </div>
                                                            {isSelected && <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" strokeWidth={2.5} />}
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

                {/* Loading skeleton */}
                {isLoading && !members.length && (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 rounded-full border-3 border-warm-yellow border-t-transparent animate-spin" />
                    </div>
                )}

                {/* No community prompt */}
                {noCommunity && (
                    <div className={`transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <div className="bg-white/70 backdrop-blur-2xl rounded-2xl p-8 border border-white/60 shadow-sm text-center">
                            <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
                                <Users className="w-7 h-7 text-violet-500" strokeWidth={1.5} />
                            </div>
                            <p className="text-sm font-bold text-ink mb-2">No community found</p>
                            <p className="text-xs text-muted mb-4 max-w-sm mx-auto">Create a community first, then come back to manage your members.</p>
                            <Button variant="primary" onClick={() => navigate('/create-community')}>Create Community</Button>
                        </div>
                    </div>
                )}

                {/* Stats + Table */}
                {activeCommunity && !isLoading && (
                    <>
                        {/* Stats row */}
                        <div className={`grid grid-cols-3 gap-3 mb-6 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            {[
                                { label: 'Total Members', value: members.length, color: 'text-ink', icon: Users },
                                { label: 'Moderators', value: modCount, color: 'text-violet-600', icon: ShieldCheck },
                                { label: 'Members', value: memberCount, color: 'text-slate', icon: UserCheck },
                            ].map(({ label, value, color, icon: Icon }) => (
                                <div key={label} className="bg-white/70 backdrop-blur-2xl rounded-xl p-4 border border-white/60 shadow-sm">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Icon className={`w-3.5 h-3.5 ${color}`} strokeWidth={2} />
                                        <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">{label}</span>
                                    </div>
                                    <p className={`text-2xl font-black ${color}`}>{value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Error banner */}
                        {error && (
                            <div className="mb-4 p-3 rounded-xl bg-error/10 border border-error/20 flex items-center gap-2 animate-fade-in">
                                <AlertTriangle className="w-4 h-4 text-error shrink-0" strokeWidth={2} />
                                <p className="text-xs font-semibold text-error flex-1">{error}</p>
                                <button onClick={clearError} className="text-xs font-bold text-error hover:underline cursor-pointer">Dismiss</button>
                            </div>
                        )}

                        {/* Search bar */}
                        <div className={`mb-4 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" strokeWidth={2} />
                                <input
                                    type="text"
                                    placeholder="Search members by name or email…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-border-warm bg-white/60
                                        text-sm text-ink placeholder:text-muted/60 font-medium
                                        outline-none focus:border-warm-yellow focus:bg-white transition-all duration-200"
                                />
                            </div>
                        </div>

                        {/* Member table */}
                        <div className={`transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            <div className="bg-white/70 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-sm overflow-hidden">

                                {/* Table header */}
                                <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-border-warm/20 bg-cream-dark/30">
                                    {['Member', 'Role', 'Reputation', 'Joined', 'Actions'].map((h) => (
                                        <span key={h} className="text-[10px] font-bold text-muted uppercase tracking-wider">{h}</span>
                                    ))}
                                </div>

                                {/* Rows */}
                                {filtered.length === 0 ? (
                                    <div className="text-center py-16">
                                        <Users className="w-8 h-8 text-muted mx-auto mb-3" strokeWidth={1.5} />
                                        <p className="text-sm font-semibold text-ink mb-1">No members found</p>
                                        <p className="text-xs text-muted">{search ? 'Try a different search term.' : 'This community has no members yet.'}</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border-warm/15">
                                        {filtered.map((member) => (
                                            <div
                                                key={member._id}
                                                className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 sm:gap-4 px-5 py-4 hover:bg-warm-yellow/[0.03] transition-colors items-center"
                                            >
                                                {/* Member info */}
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <Avatar name={member.name} avatar={member.avatar} />
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-ink truncate flex items-center gap-1.5">
                                                            {member.name}
                                                            {member.isSuspended && (
                                                                <span className="text-[9px] font-bold uppercase bg-error/10 text-error border border-error/20 px-1.5 py-0.5 rounded-full">
                                                                    Suspended
                                                                </span>
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-muted truncate">{member.email}</p>
                                                    </div>
                                                </div>

                                                {/* Role */}
                                                <div className="flex items-center sm:block">
                                                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider sm:hidden mr-2">Role:</span>
                                                    <RoleBadge role={member.communityRole} />
                                                </div>

                                                {/* Reputation */}
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider sm:hidden">Rep:</span>
                                                    <Star className="w-3.5 h-3.5 text-warm-yellow hidden sm:block" strokeWidth={2} />
                                                    <span className="text-sm font-bold text-ink">{member.reputation ?? 0}</span>
                                                </div>

                                                {/* Joined */}
                                                <div className="flex items-center gap-1.5 text-xs text-slate">
                                                    <Clock className="w-3.5 h-3.5 text-muted hidden sm:block" strokeWidth={2} />
                                                    <span>
                                                        {member.joinedAt
                                                            ? new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                            : '—'
                                                        }
                                                    </span>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex justify-start sm:justify-end">
                                                    {isAdmin
                                                        ? <RoleDropdown member={member} communityId={activeCommunity._id} />
                                                        : <span className="text-[11px] text-muted font-medium italic">—</span>
                                                    }
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <p className="text-center text-xs text-muted mt-3">
                                Showing {filtered.length} of {members.length} member{members.length !== 1 ? 's' : ''}
                            </p>
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

export default MembersPage;
