import { useState, useEffect, useRef } from 'react';
import { Bell, MessageCircle, X, Check } from 'lucide-react';
import { useNotificationStore } from '../stores/notificationStore';

const NotificationBell = () => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    const { notifications, unreadCount, isLoading, fetchNotifications, markAsRead, markAllAsRead, addNotification } = useNotificationStore();

    // Fetch on mount
    useEffect(() => {
        fetchNotifications().catch(() => { });
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days}d ago`;
        return new Date(date).toLocaleDateString();
    };

    const iconForType = (type) => {
        switch (type) {
            case 'reply':
                return <MessageCircle className="w-4 h-4 text-blue-500" strokeWidth={2} />;
            default:
                return <Bell className="w-4 h-4 text-warm-yellow" strokeWidth={2} />;
        }
    };

    const labelForNotification = (notif) => {
        switch (notif.type) {
            case 'reply':
                return (
                    <>
                        <span className="font-bold text-ink">{notif.meta?.commenterName || 'Someone'}</span>
                        <span className="text-ink-light"> replied to your post</span>
                    </>
                );
            case 'mention':
                return <span className="text-ink-light">You were mentioned</span>;
            case 'event':
                return <span className="text-ink-light">New event update</span>;
            case 'warning':
                return <span className="text-error font-semibold">Warning from moderators</span>;
            default:
                return <span className="text-ink-light">New notification</span>;
        }
    };

    const handleMarkRead = async (e, id) => {
        e.stopPropagation();
        try {
            await markAsRead(id);
        } catch { /* handled in store */ }
    };

    const handleToggle = () => {
        const willOpen = !open;
        setOpen(willOpen);
        if (willOpen && unreadCount > 0) {
            markAllAsRead().catch(() => { });
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell button */}
            <button
                onClick={handleToggle}
                className="relative w-9 h-9 rounded-xl bg-white/60 border border-border-warm flex items-center justify-center hover:bg-white hover:shadow-sm transition-all cursor-pointer"
                aria-label="Notifications"
            >
                <Bell className="w-4 h-4 text-ink" strokeWidth={2} />

                {/* Unread badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-rose-500 to-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm animate-scale-in">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="fixed left-2 right-2 top-14 sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+8px)] sm:w-96 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-border-warm/60 overflow-hidden z-[9999] animate-slide-down">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border-warm/40">
                        <h3 className="text-sm font-bold text-ink">Notifications</h3>
                        <button
                            onClick={() => setOpen(false)}
                            className="w-6 h-6 rounded-lg hover:bg-cream-dark flex items-center justify-center transition-colors cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5 text-muted" strokeWidth={2} />
                        </button>
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-5 h-5 rounded-full border-2 border-warm-yellow border-t-transparent animate-spin" />
                            </div>
                        ) : notifications.length > 0 ? (
                            notifications.map((notif) => {
                                const isUnread = !notif.readAt;
                                return (
                                    <div
                                        key={notif._id}
                                        className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-cream-dark/40 ${isUnread ? 'bg-warm-yellow-light/30 border-l-[3px] border-l-warm-yellow' : 'border-l-[3px] border-l-transparent'
                                            }`}
                                    >
                                        {/* Icon */}
                                        <div className="w-8 h-8 rounded-full bg-cream-dark flex items-center justify-center shrink-0 mt-0.5">
                                            {iconForType(notif.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs leading-relaxed">
                                                {labelForNotification(notif)}
                                            </p>
                                            {notif.meta?.commentSnippet && (
                                                <p className="text-[11px] text-muted mt-0.5 truncate">
                                                    "{notif.meta.commentSnippet}"
                                                </p>
                                            )}
                                            <p className="text-[10px] text-muted mt-1">{timeAgo(notif.createdAt)}</p>
                                        </div>

                                        {/* Mark read */}
                                        {isUnread && (
                                            <button
                                                onClick={(e) => handleMarkRead(e, notif._id)}
                                                className="w-6 h-6 rounded-lg hover:bg-cream-dark flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                                                title="Mark as read"
                                            >
                                                <Check className="w-3.5 h-3.5 text-success" strokeWidth={2.5} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-10">
                                <div className="w-10 h-10 rounded-full bg-cream-dark flex items-center justify-center mx-auto mb-2">
                                    <Bell className="w-4 h-4 text-muted" strokeWidth={1.5} />
                                </div>
                                <p className="text-xs font-semibold text-ink">All caught up!</p>
                                <p className="text-[11px] text-muted mt-0.5">No notifications yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
