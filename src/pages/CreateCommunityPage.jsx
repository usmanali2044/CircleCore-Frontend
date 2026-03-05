import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Building2, Globe, FileText, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { useCommunityStore } from '../stores/communityStore';
import { useAuthStore } from '../stores/authStore';

const CreateCommunityPage = () => {
    const [mounted, setMounted] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const [wsName, setWsName] = useState('');
    const [wsDesc, setWsDesc] = useState('');
    const [wsSlug, setWsSlug] = useState('');
    const [wsErrors, setWsErrors] = useState({});

    const { createCommunity, isLoading, error, clearError } = useCommunityStore();
    const { checkAuth } = useAuthStore();

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 80);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => { clearError(); }, []);

    // Auto-generate slug from name
    useEffect(() => {
        if (wsName) {
            setWsSlug(
                wsName.trim().toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '')
            );
        } else {
            setWsSlug('');
        }
    }, [wsName]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = {};
        if (!wsName.trim()) errs.name = 'Community name is required';
        else if (wsName.trim().length < 3) errs.name = 'Name must be at least 3 characters';
        setWsErrors(errs);
        if (Object.keys(errs).length > 0) return;

        try {
            await createCommunity(wsName.trim(), wsDesc.trim(), wsSlug.trim());
            await checkAuth(); // refresh user (now admin + invite-verified)
            setSuccess(true);
            setTimeout(() => navigate('/admin/invites'), 1500);
        } catch {
            // error in store
        }
    };

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
                className={`relative z-10 flex items-center justify-between px-5 sm:px-8 py-4
                    transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}
            >
                <Link to="/dashboard" className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-warm-yellow to-warm-yellow-hover flex items-center justify-center shadow-sm">
                        <Sparkles className="w-4 h-4 text-ink" strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-bold tracking-tight text-ink">CircleCore</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
                    <span className="ml-1">Back</span>
                </Button>
            </header>

            {/* Main */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-10">
                {/* Icon */}
                <div className={`mb-6 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-warm-yellow via-amber-300 to-warm-yellow-hover shadow-lg flex items-center justify-center">
                            {success
                                ? <ShieldCheck className="w-7 h-7 text-ink" strokeWidth={2} />
                                : <Building2 className="w-7 h-7 text-ink" strokeWidth={2} />
                            }
                        </div>
                        <div className="absolute inset-0 rounded-full bg-warm-yellow/20 blur-xl -z-10 animate-pulse-glow" />
                    </div>
                </div>

                {/* Heading */}
                <div className={`text-center mb-6 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-ink mb-2">
                        {success ? 'Community Created!' : 'Create Your Community'}
                    </h1>
                    <p className="text-sm sm:text-base text-slate font-medium max-w-sm mx-auto">
                        {success
                            ? 'You are now an admin. Redirecting to invite management…'
                            : 'Set up your workspace and become its admin.'
                        }
                    </p>
                </div>

                {/* Success state */}
                {success && (
                    <div className="animate-scale-in">
                        <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                            <ShieldCheck className="w-6 h-6 text-success" strokeWidth={2} />
                        </div>
                    </div>
                )}

                {/* Form */}
                {!success && (
                    <section
                        className={`w-full max-w-[420px] mx-auto transition-all duration-700 delay-300
                            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    >
                        <div className="relative bg-white/70 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-xl border border-white/60">
                            <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-warm-yellow/20 via-transparent to-transparent -z-10 blur-sm" />

                            {error && (
                                <div className="mb-5 px-4 py-3 bg-error/10 border border-error/20 rounded-xl text-sm text-error font-medium text-center animate-shake">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <InputField
                                    id="community-name"
                                    label="Community Name"
                                    type="text"
                                    placeholder="e.g. Design Guild"
                                    value={wsName}
                                    onChange={(e) => {
                                        setWsName(e.target.value);
                                        setWsErrors((p) => ({ ...p, name: '' }));
                                        clearError();
                                    }}
                                    error={wsErrors.name}
                                    icon={<Building2 className="w-4 h-4" strokeWidth={2} />}
                                />

                                <InputField
                                    id="community-slug"
                                    label="Slug (URL-friendly)"
                                    type="text"
                                    placeholder="auto-generated-from-name"
                                    value={wsSlug}
                                    onChange={(e) => setWsSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    icon={<Globe className="w-4 h-4" strokeWidth={2} />}
                                />

                                <InputField
                                    id="community-desc"
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
                                    loading={isLoading}
                                    icon={!isLoading && <ArrowRight className="w-4 h-4" strokeWidth={2} />}
                                >
                                    {isLoading ? 'Creating…' : 'Create Community'}
                                </Button>
                            </form>
                        </div>
                    </section>
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

export default CreateCommunityPage;
