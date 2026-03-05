import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, ShieldCheck, RotateCw } from 'lucide-react';
import Button from '../components/Button';
import { useAuthStore } from '../stores/authStore';

const EmailVerificationPage = () => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [mounted, setMounted] = useState(false);
    const [success, setSuccess] = useState(false);
    const inputRefs = useRef([]);
    const navigate = useNavigate();

    const { verifyEmail, isLoading, error, clearError } = useAuthStore();

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 80);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        clearError();
        // Auto-focus first input
        inputRefs.current[0]?.focus();
    }, []);

    // Auto-submit when all 6 digits are filled
    useEffect(() => {
        if (code.every((digit) => digit !== '')) {
            handleSubmit();
        }
    }, [code]);

    const handleSubmit = async (e) => {
        e?.preventDefault();
        const verificationCode = code.join('');
        if (verificationCode.length !== 6) return;

        try {
            await verifyEmail(verificationCode);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 1500);
        } catch {
            // error is set in store
        }
    };

    const handleChange = (index, value) => {
        const newCode = [...code];

        // Handle paste
        if (value.length > 1) {
            const pasted = value.slice(0, 6).split('');
            for (let i = 0; i < 6; i++) {
                newCode[i] = pasted[i] || '';
            }
            setCode(newCode);
            const next = newCode.findIndex((d) => d === '');
            inputRefs.current[next === -1 ? 5 : next]?.focus();
            return;
        }

        // Normal typing — only digits
        if (value && !/^\d$/.test(value)) return;
        newCode[index] = value;
        setCode(newCode);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleReset = () => {
        setCode(['', '', '', '', '', '']);
        clearError();
        inputRefs.current[0]?.focus();
    };

    return (
        <div className="min-h-screen min-h-[100dvh] bg-cream relative overflow-hidden flex flex-col">
            {/* ── Ambient background ── */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-28 -right-24 w-72 h-72 rounded-full bg-gradient-to-br from-warm-yellow/15 to-amber-300/10 blur-3xl" />
                <div className="absolute bottom-[20%] -left-20 w-56 h-56 rounded-full bg-warm-yellow/[0.06] blur-3xl" />
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
            </header>

            {/* ── Main ── */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-10">
                {/* Icon */}
                <div className={`mb-6 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-warm-yellow via-amber-300 to-warm-yellow-hover shadow-lg flex items-center justify-center">
                            <ShieldCheck className="w-7 h-7 text-ink" strokeWidth={2} />
                        </div>
                        <div className="absolute inset-0 rounded-full bg-warm-yellow/20 blur-xl -z-10 animate-pulse-glow" />
                    </div>
                </div>

                {/* Heading */}
                <div className={`text-center mb-6 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-ink mb-2">
                        Verify Your Email
                    </h1>
                    <p className="text-sm sm:text-base text-slate font-medium max-w-xs mx-auto">
                        Enter the 6-digit code sent to your email address.
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

                        {/* Success state */}
                        {success ? (
                            <div className="text-center py-6 animate-scale-in">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
                                    <ShieldCheck className="w-8 h-8 text-success" strokeWidth={2} />
                                </div>
                                <h2 className="text-xl font-bold text-ink mb-1">Email Verified!</h2>
                                <p className="text-sm text-slate">Redirecting you to the app…</p>
                            </div>
                        ) : (
                            <>
                                {/* Server error */}
                                {error && (
                                    <div className="mb-5 px-4 py-3 bg-error/10 border border-error/20 rounded-xl text-sm text-error font-medium text-center animate-shake">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    {/* 6-digit code inputs */}
                                    <div className="flex justify-center gap-2 sm:gap-3 mb-6">
                                        {code.map((digit, index) => (
                                            <input
                                                key={index}
                                                ref={(el) => (inputRefs.current[index] = el)}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength="1"
                                                value={digit}
                                                onChange={(e) => handleChange(index, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(index, e)}
                                                className={`
                                                    w-11 h-13 sm:w-13 sm:h-15
                                                    text-center text-xl sm:text-2xl font-bold text-ink
                                                    bg-cream/60 border-2 rounded-xl
                                                    outline-none transition-all duration-200
                                                    focus:bg-white focus:border-warm-yellow focus:shadow-[0_0_0_3px_var(--color-warm-yellow-glow)]
                                                    ${error ? 'border-error/50' : 'border-border-warm'}
                                                    ${digit ? 'bg-white border-warm-yellow/50' : ''}
                                                `}
                                            />
                                        ))}
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        fullWidth
                                        loading={isLoading}
                                        disabled={code.some((d) => d === '')}
                                        icon={!isLoading && <ShieldCheck className="w-4 h-4" strokeWidth={2} />}
                                    >
                                        {isLoading ? 'Verifying…' : 'Verify Email'}
                                    </Button>
                                </form>

                                {/* Resend */}
                                <div className="text-center mt-5">
                                    <button
                                        onClick={handleReset}
                                        className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-ink transition-colors font-medium cursor-pointer"
                                    >
                                        <RotateCw className="w-3.5 h-3.5" />
                                        Clear & try again
                                    </button>
                                </div>
                            </>
                        )}
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

export default EmailVerificationPage;
