import { useState, useEffect } from 'react';
import { Hash, Plus, X, ChevronDown, Lock, Menu, Layers } from 'lucide-react';
import { useChannelStore } from '../stores/channelStore';
import { useAuthStore } from '../stores/authStore';
import { useWorkspaceStore } from '../stores/workspaceStore';

const Sidebar = ({ isOpen, onClose }) => {
    const [showForm, setShowForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [formError, setFormError] = useState('');

    const { channels, activeChannelId, fetchChannels, createChannel, setActiveChannel, isLoading } = useChannelStore();
    const { user } = useAuthStore();
    const { activeCommunityId } = useWorkspaceStore();
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchChannels();
    }, [activeCommunityId]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!newName.trim()) {
            setFormError('Channel name is required');
            return;
        }
        try {
            await createChannel(newName, newDesc);
            setNewName('');
            setNewDesc('');
            setShowForm(false);
        } catch (err) {
            setFormError(err.message);
        }
    };

    const handleChannelClick = (channelId) => {
        setActiveChannel(channelId);
        onClose?.();
    };

    // ── Sidebar inner content ──────────────────────────────────────────────
    const content = (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border-warm/30">
                <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-warm-yellow" strokeWidth={2.5} />
                    <span className="text-sm font-black tracking-tight text-ink">Channels</span>
                </div>
                <div className="flex items-center gap-1">
                    {isAdmin && (
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="w-7 h-7 rounded-lg hover:bg-warm-yellow/10 flex items-center justify-center transition-colors cursor-pointer"
                            title="Create channel"
                        >
                            <Plus className="w-4 h-4 text-slate" strokeWidth={2} />
                        </button>
                    )}
                    {/* Close button — mobile only */}
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg hover:bg-cream-dark flex items-center justify-center transition-colors cursor-pointer md:hidden"
                    >
                        <X className="w-4 h-4 text-slate" strokeWidth={2} />
                    </button>
                </div>
            </div>

            {/* Create channel form */}
            {showForm && (
                <form onSubmit={handleCreate} className="px-4 pt-3 pb-2 border-b border-border-warm/20 animate-slide-down">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => { setNewName(e.target.value); setFormError(''); }}
                        placeholder="channel-name"
                        maxLength={30}
                        className="w-full rounded-lg border-2 border-border-warm bg-cream/40 text-xs text-ink font-medium placeholder:text-muted/50 outline-none transition-all duration-200 focus:bg-white focus:border-warm-yellow focus:shadow-[0_0_0_3px_var(--color-warm-yellow-glow)] px-3 py-2 mb-2"
                    />
                    <input
                        type="text"
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        placeholder="Description (optional)"
                        maxLength={120}
                        className="w-full rounded-lg border-2 border-border-warm bg-cream/40 text-xs text-ink font-medium placeholder:text-muted/50 outline-none transition-all duration-200 focus:bg-white focus:border-warm-yellow focus:shadow-[0_0_0_3px_var(--color-warm-yellow-glow)] px-3 py-2 mb-2"
                    />
                    {formError && <p className="text-[11px] text-error font-medium mb-1.5">{formError}</p>}
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-warm-yellow to-amber-400 text-xs font-bold text-ink shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50"
                        >
                            {isLoading ? 'Creating…' : 'Create'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setShowForm(false); setFormError(''); }}
                            className="px-3 py-1.5 rounded-lg bg-cream-dark text-xs font-semibold text-slate hover:text-ink transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Channel list */}
            <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
                {/* All Posts */}
                <button
                    onClick={() => handleChannelClick(null)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer group
                        ${!activeChannelId
                            ? 'bg-gradient-to-r from-warm-yellow/15 to-warm-yellow/5 text-ink shadow-sm border border-warm-yellow/20'
                            : 'text-slate hover:bg-cream-dark/50 hover:text-ink'
                        }`}
                >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors
                        ${!activeChannelId ? 'bg-warm-yellow/20' : 'bg-cream-dark group-hover:bg-cream-dark'}`}>
                        <Layers className="w-3.5 h-3.5" strokeWidth={2} />
                    </div>
                    <span className="text-xs font-bold truncate">All Posts</span>
                </button>

                {/* Channel items */}
                {channels.map((ch) => {
                    const isActive = activeChannelId === ch._id;
                    return (
                        <button
                            key={ch._id}
                            onClick={() => handleChannelClick(ch._id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer group
                                ${isActive
                                    ? 'bg-gradient-to-r from-warm-yellow/15 to-warm-yellow/5 text-ink shadow-sm border border-warm-yellow/20'
                                    : 'text-slate hover:bg-cream-dark/50 hover:text-ink'
                                }`}
                            title={ch.description || ch.name}
                        >
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors
                                ${isActive ? 'bg-warm-yellow/20' : 'bg-cream-dark group-hover:bg-cream-dark'}`}>
                                {ch.isPrivate
                                    ? <Lock className="w-3.5 h-3.5" strokeWidth={2} />
                                    : <Hash className="w-3.5 h-3.5" strokeWidth={2} />}
                            </div>
                            <span className="text-xs font-bold truncate">{ch.name}</span>
                        </button>
                    );
                })}

                {channels.length === 0 && !isLoading && (
                    <div className="text-center py-6">
                        <Hash className="w-5 h-5 text-muted mx-auto mb-2" strokeWidth={1.5} />
                        <p className="text-[11px] text-muted font-medium">No channels yet</p>
                    </div>
                )}
            </nav>
        </div>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden md:flex w-60 shrink-0 bg-white/50 backdrop-blur-xl border-r border-border-warm/30 flex-col overflow-y-auto">
                {content}
            </aside>

            {/* Mobile overlay */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
                        onClick={onClose}
                    />
                    <aside className="fixed top-0 left-0 bottom-0 w-72 bg-cream z-50 shadow-2xl animate-slide-right md:hidden">
                        {content}
                    </aside>
                </>
            )}
        </>
    );
};

export default Sidebar;
