import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, LogIn, Sparkles } from 'lucide-react';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { useAuthStore } from '../stores/authStore';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [mounted, setMounted] = useState(false);
    const navigate = useNavigate();

    const { login, isLoading, error, clearError } = useAuthStore();

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 80);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        clearError();
    }, []);

    const validate = () => {
        const errs = {};
        if (!email.trim()) errs.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
        if (!password) errs.password = 'Password is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            await login(email, password);
            navigate('/feed');
        } catch {
            // error is set in store
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
                    to="/signup"
                    className="text-sm font-semibold text-slate hover:text-ink transition-colors"
                >
                    Sign Up
                </Link>
            </header>

            {/* ── Main ── */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-10">
                {/* Icon */}
                <div className={`mb-6 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-warm-yellow via-amber-300 to-warm-yellow-hover shadow-lg flex items-center justify-center">
                            <LogIn className="w-7 h-7 text-ink" strokeWidth={2} />
                        </div>
                        <div className="absolute inset-0 rounded-full bg-warm-yellow/20 blur-xl -z-10 animate-pulse-glow" />
                    </div>
                </div>

                {/* Heading */}
                <div className={`text-center mb-6 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-ink mb-2">
                        Welcome back
                    </h1>
                    <p className="text-sm sm:text-base text-slate font-medium">
                        Log in to your CircleCore account.
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
                                id="login-email"
                                label="Email"
                                type="email"
                                placeholder="@mail.com"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
                                error={errors.email}
                                icon={<Mail className="w-4 h-4" strokeWidth={2} />}
                            />

                            <InputField
                                id="login-password"
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                                error={errors.password}
                                icon={<Lock className="w-4 h-4" strokeWidth={2} />}
                            />

                            {/* Forgot password link */}
                            <div className="flex justify-end">
                                <Link
                                    to="/forgot-password"
                                    className="text-xs font-semibold text-slate hover:text-ink transition-colors underline underline-offset-4 decoration-warm-yellow decoration-2"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                fullWidth
                                loading={isLoading}
                                icon={!isLoading && <LogIn className="w-4 h-4" strokeWidth={2} />}
                            >
                                {isLoading ? 'Logging in…' : 'Log In'}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative flex items-center gap-3 my-6">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border-warm to-transparent" />
                            <span className="text-[11px] text-muted font-semibold uppercase tracking-wider">new here?</span>
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border-warm to-transparent" />
                        </div>

                        {/* Sign Up CTA */}
                        <Button
                            variant="ghost"
                            fullWidth
                            onClick={() => navigate('/signup')}
                        >
                            Create an account
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

export default LoginPage;
