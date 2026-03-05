import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Sparkles,
    Lock,
    ArrowRight,
    Users,
    Globe,
    Zap,
    Ticket,
} from 'lucide-react';
import Button from '../components/Button';
import InputField from '../components/InputField';

const HomePage = () => {
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 80);
        return () => clearTimeout(t);
    }, []);

    /* ── Validate invite code via API (public route) ── */
    const handleSignUp = async () => {
        const code = inviteCode.trim();
        if (!code) {
            setError('Please enter an invite code');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/invites/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            });

            const data = await res.json().catch(() => null);

            if (res.ok) {
                // Store validated code so the signup page can automatically use it
                sessionStorage.setItem('circlecore_invite_code', code);
                navigate('/signup');
            } else {
                setError(data?.message || 'Invalid or expired invite code');
            }
        } catch {
            setError('Could not connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSignUp();
    };

    const features = [
        { icon: Users, label: 'Curated Members' },
        { icon: Zap, label: 'Real-time Sync' },
        { icon: Globe, label: 'Global Circles' },
    ];

    return (
        <div className="min-h-screen min-h-[100dvh] bg-cream relative overflow-hidden flex flex-col">

            {/* ── Ambient background ── */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-28 -right-24 w-72 h-72 rounded-full bg-gradient-to-br from-warm-yellow/15 to-amber-300/10 blur-3xl" />
                <div className="absolute top-[40%] -left-20 w-56 h-56 rounded-full bg-warm-yellow/[0.06] blur-3xl" />
                <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-warm-yellow/[0.12] to-transparent" />
                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #1A1A1A 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                    }}
                />
            </div>

            {/* ═══════════  HEADER  ═══════════ */}
            <header
                className={`relative z-10 flex items-center justify-between px-5 sm:px-8 py-4
          transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}
            >
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-warm-yellow to-warm-yellow-hover flex items-center justify-center shadow-sm">
                        <Sparkles className="w-4 h-4 text-ink" strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-bold tracking-tight text-ink">CircleCore</span>
                </div>

                <button
                    onClick={() => navigate('/login')}
                    className="text-sm font-semibold text-slate hover:text-ink transition-colors cursor-pointer"
                >
                    Log In
                </button>
            </header>

            {/* ═══════════  HERO  ═══════════ */}
            <main className="relative z-10 flex-1 flex flex-col items-center px-5 sm:px-8 pt-10 sm:pt-20 pb-10">

                {/* Logo mark */}
                <div className={`mb-7 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                    <div className="relative">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-warm-yellow via-amber-300 to-warm-yellow-hover shadow-xl flex items-center justify-center animate-float">
                            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-cream/90 backdrop-blur flex items-center justify-center">
                                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-ink flex items-center justify-center">
                                    <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-warm-yellow" />
                                </div>
                            </div>
                        </div>
                        <div className="absolute inset-0 rounded-full bg-warm-yellow/20 blur-2xl -z-10 animate-pulse-glow" />
                    </div>
                </div>

                {/* Headline */}
                <div className={`text-center mb-5 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-ink leading-[1.08] mb-3">
                        Your circle,{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-warm-yellow to-amber-500">
                            your&nbsp;rules.
                        </span>
                    </h1>
                    <p className="text-base sm:text-lg text-slate font-medium max-w-xs sm:max-w-sm mx-auto leading-relaxed">
                        Invite-only communities built around trust, quality, and real conversations.
                    </p>
                </div>

                {/* Feature pills */}
                <div className={`flex flex-wrap justify-center gap-2.5 mb-10 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-2 px-3.5 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-border-warm/50 shadow-sm"
                        >
                            <f.icon className="w-3.5 h-3.5 text-warm-yellow" strokeWidth={2.2} />
                            <span className="text-xs font-semibold text-ink">{f.label}</span>
                        </div>
                    ))}
                </div>

                {/* ═══════════  INVITE CARD  ═══════════ */}
                <section
                    className={`w-full max-w-[400px] mx-auto transition-all duration-700 delay-400
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                >
                    <div className="relative bg-white/70 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-xl border border-white/60">
                        {/* Subtle glow edge */}
                        <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-warm-yellow/20 via-transparent to-transparent -z-10 blur-sm" />

                        {/* Badge */}
                        <div className="flex justify-center mb-5">
                            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-warm-yellow-light/70 rounded-full border border-warm-yellow/20">
                                <Lock className="w-3 h-3 text-ink" strokeWidth={2.5} />
                                <span className="text-[11px] font-bold tracking-widest uppercase text-ink">Invite Only</span>
                            </span>
                        </div>

                        {/* Title */}
                        <h2 className="text-xl sm:text-2xl font-bold text-ink text-center mb-1">
                            Join CircleCore
                        </h2>
                        <p className="text-sm text-slate text-center mb-6">
                            Enter your invite code to get started.
                        </p>

                        {/* Invite Input */}
                        <InputField
                            placeholder="Enter invite code"
                            value={inviteCode}
                            onChange={(e) => {
                                setInviteCode(e.target.value.toUpperCase());
                                setError('');
                            }}
                            onKeyDown={handleKeyDown}
                            error={error}
                            icon={<Ticket className="w-4 h-4" strokeWidth={2} />}
                        />

                        {/* Sign Up Button */}
                        <div className="mt-4">
                            <Button
                                variant="primary"
                                fullWidth
                                loading={loading}
                                disabled={!inviteCode.trim()}
                                icon={!loading && <ArrowRight className="w-4 h-4" strokeWidth={2} />}
                                onClick={handleSignUp}
                            >
                                {loading ? 'Verifying…' : 'Sign Up'}
                            </Button>
                        </div>

                        {/* Divider */}
                        <div className="relative flex items-center gap-3 my-6">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border-warm to-transparent" />
                            <span className="text-[11px] text-muted font-semibold uppercase tracking-wider">or</span>
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border-warm to-transparent" />
                        </div>

                        {/* Login Button */}
                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => navigate('/login')}
                        >
                            Log In
                        </Button>
                    </div>

                    {/* Request invite */}
                    <div className={`text-center mt-7 transition-all duration-500 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                        <p className="text-sm text-muted">
                            Don&apos;t have a code?{' '}
                            <button className="text-ink font-semibold underline underline-offset-4 decoration-warm-yellow decoration-2 hover:decoration-warm-yellow-hover transition-colors cursor-pointer">
                                Request an invite
                            </button>
                        </p>
                    </div>
                </section>

                {/* ═══════════  STATS BAR  ═══════════ */}
                <section className={`w-full max-w-[400px] mx-auto mt-14 transition-all duration-700 delay-600 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-5 border border-border-warm/30 flex items-center justify-around">
                        {[
                            { icon: Users, value: '12K+', label: 'Members' },
                            { icon: Globe, value: '500+', label: 'Circles' },
                            { icon: Zap, value: '98%', label: 'Engaged' },
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                                <stat.icon className="w-4 h-4 text-warm-yellow mb-0.5" strokeWidth={2.2} />
                                <p className="text-xl font-black text-ink leading-none">{stat.value}</p>
                                <p className="text-[11px] text-muted font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </section>
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

export default HomePage;
