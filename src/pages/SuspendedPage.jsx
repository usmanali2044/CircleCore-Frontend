import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOff, Clock, LogOut, AlertTriangle } from 'lucide-react';
import Button from '../components/Button';
import { useAuthStore } from '../stores/authStore';

const SuspendedPage = () => {
    const navigate = useNavigate();
    const { logout } = useAuthStore();
    const [timeLeft, setTimeLeft] = useState('');
    const [mounted, setMounted] = useState(false);

    // Suspension data stored by the API interceptor
    const raw = sessionStorage.getItem('suspensionData');
    const suspensionData = raw ? JSON.parse(raw) : null;
    const liftAt = suspensionData?.liftAt ? new Date(suspensionData.liftAt) : null;
    const isBanned = suspensionData?.code === 'BANNED';

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 60);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (!liftAt || isBanned) return;
        const tick = () => {
            const diff = liftAt - new Date();
            if (diff <= 0) { setTimeLeft('Suspension lifted — please refresh.'); return; }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${h > 0 ? `${h}h ` : ''}${m}m ${s}s`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [liftAt, isBanned]);

    const handleLogout = async () => {
        sessionStorage.removeItem('suspensionData');
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen min-h-[100dvh] bg-cream flex flex-col items-center justify-center px-4 relative overflow-hidden">
            {/* Ambient */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-rose-500/[0.07] blur-3xl" />
                <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-rose-500/[0.04] to-transparent" />
            </div>

            <div className={`relative z-10 w-full max-w-md text-center transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                {/* Icon */}
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-rose-500/20">
                    {isBanned
                        ? <AlertTriangle className="w-8 h-8 text-white" strokeWidth={2} />
                        : <ShieldOff className="w-8 h-8 text-white" strokeWidth={2} />
                    }
                </div>

                {/* Headline */}
                <h1 className="text-3xl font-black text-ink mb-2">
                    {isBanned ? 'You\'ve Been Banned' : 'Account Suspended'}
                </h1>
                <p className="text-sm text-slate font-medium mb-8 max-w-xs mx-auto">
                    {isBanned
                        ? 'You have been permanently banned from this community by an administrator.'
                        : 'A moderator has temporarily suspended your access to this community.'
                    }
                </p>

                {/* Countdown card */}
                {!isBanned && liftAt && (
                    <div className="bg-white/70 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-sm p-6 mb-6">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-rose-500" strokeWidth={2} />
                            <span className="text-xs font-bold text-muted uppercase tracking-wider">Suspension lifts in</span>
                        </div>
                        <p className="text-3xl font-black text-ink tabular-nums">{timeLeft || '…'}</p>
                        <p className="text-xs text-muted mt-1.5">
                            {liftAt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                )}

                {/* What to do */}
                <div className="bg-white/70 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-sm p-5 mb-8 text-left">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-3">What you can do</p>
                    <ul className="space-y-2 text-sm text-slate">
                        {!isBanned && <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold shrink-0 mt-0.5">→</span>Wait for the suspension to lift, then refresh the page.</li>}
                        <li className="flex items-start gap-2"><span className="text-rose-400 font-bold shrink-0 mt-0.5">→</span>If you believe this was a mistake, contact a community admin.</li>
                        <li className="flex items-start gap-2"><span className="text-amber-500 font-bold shrink-0 mt-0.5">→</span>Review the community guidelines to avoid future actions.</li>
                    </ul>
                </div>

                <Button variant="ghost" onClick={handleLogout} icon={<LogOut className="w-4 h-4" strokeWidth={2} />}>
                    Sign out
                </Button>
            </div>
        </div>
    );
};

export default SuspendedPage;
