import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Ticket, ArrowRight, ShieldCheck, Plus, Building2, Globe, FileText } from 'lucide-react';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { useInviteStore } from '../stores/inviteStore';
import { useCommunityStore } from '../stores/communityStore';
import { useAuthStore } from '../stores/authStore';

const InviteCodePage = () => {
    const [code, setCode] = useState('');
    const [fieldError, setFieldError] = useState('');
    const [mounted, setMounted] = useState(false);
    const [success, setSuccess] = useState(false);
    const [mode, setMode] = useState('invite'); // 'invite' | 'create'
    const navigate = useNavigate();

    // Create workspace form state
    const [wsName, setWsName] = useState('');
    const [wsDesc, setWsDesc] = useState('');
    const [wsSlug, setWsSlug] = useState('');
    const [wsErrors, setWsErrors] = useState({});

    const { validateInviteCode, isLoading, error, clearError } = useInviteStore();
    const { createCommunity, isLoading: wsLoading, error: wsError, clearError: clearWsError } = useCommunityStore();
    const { user, checkAuth } = useAuthStore();

    // Only show "Create Workspace" to logged-in users (not yet invite-verified)
    const canCreateWorkspace = !!user;

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 80);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        clearError();
        clearWsError();
    }, []);

    // Auto-generate slug from name
    useEffect(() => {
        if (wsName) {
            setWsSlug(
                wsName
                    .trim()
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '')
            );
        } else {
            setWsSlug('');
        }
    }, [wsName]);

    const handleInviteSubmit = async (e) => {
        e.preventDefault();
        setFieldError('');

        if (!code.trim()) {
            setFieldError('Please enter your invite code');
            return;
        }

        try {
            await validateInviteCode(code.trim());
            setSuccess(true);
            setTimeout(() => navigate('/signup'), 1200);
        } catch {
            // error is set in store
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        const errs = {};
        if (!wsName.trim()) errs.name = 'Community name is required';
        if (wsName.trim().length < 3) errs.name = 'Name must be at least 3 characters';
        setWsErrors(errs);
        if (Object.keys(errs).length > 0) return;

        try {
            await createCommunity(wsName.trim(), wsDesc.trim(), wsSlug.trim());
            // Refresh auth state (user is now admin + invite verified)
            await checkAuth();
            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 1200);
        } catch {
            // error in store
        }
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
                className={`relative z-10 flex items-center justify-between px-5 sm:px-8 py-4
                    transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}
            >
                <Link to="/" className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-warm-yellow to-warm-yellow-hover flex items-center justify-center shadow-sm">
                        <Sparkles className="w-4 h-4 text-ink" strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-bold tracking-tight text-ink">CircleCore</span>
                </Link>
                <Link
                    to="/login"
                    className="text-sm font-semibold text-slate hover:text-ink transition-colors"
                >
                    Already a member? Log in
                </Link>
            </header>

            {/* ── Main ── */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-10">
                {/* Icon */}
                <div className={`mb-6 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-warm-yellow via-amber-300 to-warm-yellow-hover shadow-lg flex items-center justify-center">
                            {success
                                ? <ShieldCheck className="w-7 h-7 text-ink" strokeWidth={2} />
                                : mode === 'create'
                                    ? <Building2 className="w-7 h-7 text-ink" strokeWidth={2} />
                                    : <Ticket className="w-7 h-7 text-ink" strokeWidth={2} />
                            }
                        </div>
                        <div className="absolute inset-0 rounded-full bg-warm-yellow/20 blur-xl -z-10 animate-pulse-glow" />
                    </div>
                </div>

                {/* Heading */}
                <div className={`text-center mb-6 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-ink mb-2">
                        {success
                            ? (mode === 'create' ? 'Workspace Created!' : "You're in!")
                            : mode === 'create'
                                ? 'Create Your Workspace'
                                : 'Got an invite?'
                        }
                    </h1>
                    <p className="text-sm sm:text-base text-slate font-medium max-w-sm mx-auto">
                        {success
                            ? (mode === 'create'
                                ? 'Your community is ready. Redirecting to dashboard…'
                                : 'Code verified! Redirecting you to create your account…')
                            : mode === 'create'
                                ? 'Set up your community and become its admin.'
                                : 'CircleCore is invite-only. Enter your code to get started.'
                        }
                    </p>
                </div>

                {/* ── Invite Card ── */}
                {!success && mode === 'invite' && (
                    <section
                        className={`w-full max-w-[420px] mx-auto transition-all duration-700 delay-300
                            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    >
                        <div className="relative bg-white/70 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-xl border border-white/60">
                            {/* Glow edge */}
                            <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-warm-yellow/20 via-transparent to-transparent -z-10 blur-sm" />

                            {/* Server error */}
                            {error && (
                                <div className="mb-5 px-4 py-3 bg-error/10 border border-error/20 rounded-xl text-sm text-error font-medium text-center animate-shake">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleInviteSubmit} className="space-y-4">
                                <InputField
                                    id="invite-code"
                                    label="Invite Code"
                                    type="text"
                                    placeholder="e.g. CIRCLE-XXXX-XXXX"
                                    value={code}
                                    onChange={(e) => {
                                        setCode(e.target.value.toUpperCase());
                                        setFieldError('');
                                        clearError();
                                    }}
                                    error={fieldError}
                                    icon={<Ticket className="w-4 h-4" strokeWidth={2} />}
                                    autoComplete="off"
                                />

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    loading={isLoading}
                                    icon={!isLoading && <ArrowRight className="w-4 h-4" strokeWidth={2} />}
                                >
                                    {isLoading ? 'Validating…' : 'Continue'}
                                </Button>
                            </form>

                            {/* Show Create Workspace only to logged-in users */}
                            {canCreateWorkspace && (
                                <>
                                    {/* Divider */}
                                    <div className="relative flex items-center gap-3 my-6">
                                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border-warm to-transparent" />
                                        <span className="text-[11px] text-muted font-semibold uppercase tracking-wider">or</span>
                                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border-warm to-transparent" />
                                    </div>

                                    {/* Create Workspace CTA */}
                                    <Button
                                        variant="ghost"
                                        fullWidth
                                        onClick={() => {
                                            setMode('create');
                                            clearError();
                                        }}
                                        icon={<Plus className="w-4 h-4" strokeWidth={2} />}
                                    >
                                        Create a New Workspace
                                    </Button>
                                </>
                            )}

                            {/* Info note */}
                            <p className="mt-5 text-xs text-center text-muted font-medium leading-relaxed">
                                {canCreateWorkspace
                                    ? "Don't have a code? Create your own community instead."
                                    : "Don't have a code? Ask a current member or check your email for an invitation."
                                }
                            </p>
                        </div>
                    </section>
                )}

                {/* ── Create Workspace Card (only for logged-in users) ── */}
                {!success && mode === 'create' && canCreateWorkspace && (
                    <section
                        className={`w-full max-w-[420px] mx-auto transition-all duration-700 delay-300
                            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    >
                        <div className="relative bg-white/70 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-xl border border-white/60">
                            <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-warm-yellow/20 via-transparent to-transparent -z-10 blur-sm" />

                            {wsError && (
                                <div className="mb-5 px-4 py-3 bg-error/10 border border-error/20 rounded-xl text-sm text-error font-medium text-center animate-shake">
                                    {wsError}
                                </div>
                            )}

                            <form onSubmit={handleCreateSubmit} className="space-y-4">
                                <InputField
                                    id="ws-name"
                                    label="Community Name"
                                    type="text"
                                    placeholder="e.g. Design Guild"
                                    value={wsName}
                                    onChange={(e) => {
                                        setWsName(e.target.value);
                                        setWsErrors((p) => ({ ...p, name: '' }));
                                        clearWsError();
                                    }}
                                    error={wsErrors.name}
                                    icon={<Building2 className="w-4 h-4" strokeWidth={2} />}
                                />

                                <InputField
                                    id="ws-slug"
                                    label="Slug (URL-friendly)"
                                    type="text"
                                    placeholder="auto-generated-from-name"
                                    value={wsSlug}
                                    onChange={(e) => setWsSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    icon={<Globe className="w-4 h-4" strokeWidth={2} />}
                                />

                                <InputField
                                    id="ws-desc"
                                    label="Description (optional)"
                                    type="text"
                                    placeholder="What's this community about?"
                                    value={wsDesc}
                                    onChange={(e) => setWsDesc(e.target.value)}
                                    icon={<FileText className="w-4 h-4" strokeWidth={2} />}
                                />

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    loading={wsLoading}
                                    icon={!wsLoading && <ArrowRight className="w-4 h-4" strokeWidth={2} />}
                                >
                                    {wsLoading ? 'Creating…' : 'Create Workspace'}
                                </Button>
                            </form>

                            {/* Divider */}
                            <div className="relative flex items-center gap-3 my-6">
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border-warm to-transparent" />
                                <span className="text-[11px] text-muted font-semibold uppercase tracking-wider">or</span>
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border-warm to-transparent" />
                            </div>

                            <Button
                                variant="ghost"
                                fullWidth
                                onClick={() => {
                                    setMode('invite');
                                    clearWsError();
                                }}
                                icon={<Ticket className="w-4 h-4" strokeWidth={2} />}
                            >
                                I Have an Invite Code
                            </Button>
                        </div>
                    </section>
                )}

                {/* Success animation */}
                {success && (
                    <div className="animate-scale-in">
                        <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                            <ShieldCheck className="w-6 h-6 text-success" strokeWidth={2} />
                        </div>
                    </div>
                )}
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

export default InviteCodePage;
