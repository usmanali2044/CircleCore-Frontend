import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, Sparkles, UserPlus } from 'lucide-react';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { useAuthStore } from '../stores/authStore';
import { useInviteStore } from '../stores/inviteStore';

const SignupPage = () => {
    const [searchParams] = useSearchParams();
    const codeFromUrl = searchParams.get('code');

    const inviteCode = sessionStorage.getItem('circlecore_invite_code') || '';

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [mounted, setMounted] = useState(false);
    const [autoValidating, setAutoValidating] = useState(false);
    const navigate = useNavigate();

    const { signup, isLoading, error, clearError } = useAuthStore();
    const { validateInviteCode } = useInviteStore();

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 80);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        clearError();
    }, []);

    // Magic link: if ?code= is present and not already validated, auto-validate it
    useEffect(() => {
        if (codeFromUrl && !inviteCode) {
            setAutoValidating(true);
            validateInviteCode(codeFromUrl.trim().toUpperCase())
                .catch(() => {
                    // If auto-validation fails, redirect to invite page
                    navigate('/invite', { replace: true });
                })
                .finally(() => setAutoValidating(false));
        }
    }, [codeFromUrl]);

    const validate = () => {
        const errs = {};
        if (!name.trim()) errs.name = 'Name is required';
        if (!email.trim()) errs.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
        if (!password) errs.password = 'Password is required';
        else if (password.length < 6) errs.password = 'Must be at least 6 characters';
        if (!confirmPassword) errs.confirmPassword = 'Please confirm your password';
        else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // Redirect to /invite if no validated code in session (and no URL code being validated)
    useEffect(() => {
        if (!inviteCode && !codeFromUrl) navigate('/invite', { replace: true });
    }, [inviteCode, codeFromUrl, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            await signup(name, email, password, inviteCode);
            sessionStorage.removeItem('circlecore_invite_code');
            navigate('/verify-email');
        } catch {
            // error is set in store
        }
    };

    /* Password strength indicator */
    const getStrength = (pw) => {
        if (!pw) return { level: 0, label: '', color: '' };
        let score = 0;
        if (pw.length >= 6) score++;
        if (pw.length >= 10) score++;
        if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
        if (/\d/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;

        if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-error' };
        if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-amber-400' };
        if (score <= 3) return { level: 3, label: 'Good', color: 'bg-warm-yellow' };
        return { level: 4, label: 'Strong', color: 'bg-success' };
    };

    const strength = getStrength(password);

    return (
        <div className="min-h-screen min-h-[100dvh] bg-cream relative overflow-hidden flex flex-col">
            {/* ── Ambient background ── */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-28 -right-24 w-72 h-72 rounded-full bg-gradient-to-br from-warm-yellow/15 to-amber-300/10 blur-3xl" />
                <div className="absolute bottom-[30%] -left-20 w-56 h-56 rounded-full bg-warm-yellow/[0.06] blur-3xl" />
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
                    Log In
                </Link>
            </header>

            {/* ── Main ── */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-10">
                {/* Icon */}
                <div className={`mb-6 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-warm-yellow via-amber-300 to-warm-yellow-hover shadow-lg flex items-center justify-center">
                            <UserPlus className="w-7 h-7 text-ink" strokeWidth={2} />
                        </div>
                        <div className="absolute inset-0 rounded-full bg-warm-yellow/20 blur-xl -z-10 animate-pulse-glow" />
                    </div>
                </div>

                {/* Heading */}
                <div className={`text-center mb-6 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-ink mb-2">
                        Create your account
                    </h1>
                    <p className="text-sm sm:text-base text-slate font-medium">
                        {inviteCode
                            ? <>Invite code <span className="font-bold text-ink">{inviteCode}</span> verified.</>
                            : 'Set up your CircleCore profile.'}
                    </p>
                </div>

                {/* ── Card ── */}
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

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <InputField
                                id="signup-name"
                                label="Full Name"
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
                                error={errors.name}
                                icon={<User className="w-4 h-4" strokeWidth={2} />}
                            />

                            <InputField
                                id="signup-email"
                                label="Email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
                                error={errors.email}
                                icon={<Mail className="w-4 h-4" strokeWidth={2} />}
                            />

                            <div>
                                <InputField
                                    id="signup-password"
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                                    error={errors.password}
                                    icon={<Lock className="w-4 h-4" strokeWidth={2} />}
                                />
                                {/* Password strength bar */}
                                {password && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="flex-1 flex gap-1">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.level ? strength.color : 'bg-border-warm'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-[11px] font-semibold text-muted">{strength.label}</span>
                                    </div>
                                )}
                            </div>

                            <InputField
                                id="signup-confirm-password"
                                label="Confirm Password"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: '' })); }}
                                error={errors.confirmPassword}
                                icon={<Lock className="w-4 h-4" strokeWidth={2} />}
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                fullWidth
                                loading={isLoading}
                                icon={!isLoading && <UserPlus className="w-4 h-4" strokeWidth={2} />}
                            >
                                {isLoading ? 'Creating account…' : 'Create Account'}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative flex items-center gap-3 my-6">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border-warm to-transparent" />
                            <span className="text-[11px] text-muted font-semibold uppercase tracking-wider">already a member?</span>
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border-warm to-transparent" />
                        </div>

                        {/* Login CTA */}
                        <Button
                            variant="ghost"
                            fullWidth
                            onClick={() => navigate('/login')}
                        >
                            Log In
                        </Button>
                    </div>

                    {/* Back link */}
                    <div className={`text-center mt-6 transition-all duration-500 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-ink transition-colors font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to home
                        </Link>
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

export default SignupPage;
