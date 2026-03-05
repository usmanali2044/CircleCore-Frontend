import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Compass, Calendar, Shield, Users, Building2, UserCircle, Key } from 'lucide-react';

const demoRoutes = [
    { path: '/', label: 'Landing Page', icon: Compass },
    { path: '/feed', label: 'Feed', icon: Compass },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/events', label: 'Events', icon: Calendar },
    { path: '/create-community', label: 'Create Community', icon: Building2 },
    { path: '/onboarding', label: 'Onboarding', icon: UserCircle },
    { path: '/admin/moderation', label: 'Moderation', icon: Shield },
    { path: '/admin/invites', label: 'Invites', icon: Key },
    { path: '/admin/members', label: 'Members', icon: Users },
    { path: '/suspended', label: 'Suspended Paged', icon: Shield },
    { path: '/login', label: 'Login', icon: Key },
    { path: '/signup', label: 'Signup', icon: UserCircle },
];

export default function DemoNav() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleNavigate = (path) => {
        navigate(path);
        setIsOpen(false);
    };

    if (!mounted) return null;

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-[9999] w-12 h-12 rounded-full bg-ink text-cream shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200"
                title="Demo Navigation"
            >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-ink/20 backdrop-blur-sm z-[9998] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Menu Drawer */}
            <div className={`fixed bottom-24 right-6 w-64 bg-white/90 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-4 z-[9999] transition-all duration-300 transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
                <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-sm font-black text-ink uppercase tracking-wider">Demo Navigation</h3>
                </div>

                <div className="space-y-1.5 max-h-[60vh] overflow-y-auto scrollbar-hide pr-1">
                    {demoRoutes.map((route) => {
                        const isActive = location.pathname === route.path;
                        const Icon = route.icon;

                        return (
                            <button
                                key={route.path}
                                onClick={() => handleNavigate(route.path)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left ${isActive
                                        ? 'bg-warm-yellow/20 text-ink font-bold border border-warm-yellow/30'
                                        : 'text-slate hover:bg-cream-dark/50 hover:text-ink font-medium'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-warm-yellow-hover' : 'text-muted'}`} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-sm">{route.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
