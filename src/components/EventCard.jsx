import { useState } from 'react';
import { Calendar, MapPin, Users, Check, UserPlus } from 'lucide-react';
import { useEventStore } from '../stores/eventStore';
import { useAuthStore } from '../stores/authStore';

const EventCard = ({ event }) => {
    const [toggling, setToggling] = useState(false);
    const { toggleRsvp } = useEventStore();
    const { user } = useAuthStore();

    const isRsvped = event.rsvpList?.includes(user?._id);

    const initials = event.creator?.name
        ? event.creator.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const daysUntil = () => {
        const now = new Date();
        const eventDate = new Date(event.date);
        const diff = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
        if (diff === 0) return 'Today';
        if (diff === 1) return 'Tomorrow';
        return `In ${diff} days`;
    };

    const handleRsvp = async () => {
        if (toggling) return;
        setToggling(true);
        try {
            await toggleRsvp(event._id, user._id);
        } catch { /* handled in store */ }
        setToggling(false);
    };

    return (
        <article className="relative bg-white/70 backdrop-blur-2xl rounded-2xl p-5 sm:p-6 shadow-lg border border-white/60 transition-all duration-300 hover:shadow-xl group">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-warm-yellow/10 via-transparent to-transparent -z-10 blur-sm" />

            {/* Top row — date badge + creator */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    {/* Date badge */}
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-warm-yellow/20 to-amber-300/15 border border-warm-yellow/20">
                        <span className="text-[10px] font-bold text-warm-yellow-hover uppercase leading-none">
                            {new Date(event.date).toLocaleString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-lg font-black text-ink leading-none mt-0.5">
                            {new Date(event.date).getDate()}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-bold text-ink truncate">{event.title}</h3>
                        <p className="text-[11px] text-muted font-semibold">{daysUntil()}</p>
                    </div>
                </div>

                {/* RSVP count */}
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cream-dark/60 border border-border-warm/50">
                    <Users className="w-3 h-3 text-slate" strokeWidth={2} />
                    <span className="text-[11px] font-bold text-ink">{event.rsvpList?.length || 0}</span>
                </div>
            </div>

            {/* Description */}
            {event.description && (
                <p className="text-sm text-ink-light leading-relaxed mb-4 whitespace-pre-wrap">
                    {event.description}
                </p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-slate">
                    <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
                    <span className="font-medium">{formatDate(event.date)} · {formatTime(event.date)}</span>
                </div>
                {event.location && (
                    <div className="flex items-center gap-1.5 text-xs text-slate">
                        <MapPin className="w-3.5 h-3.5" strokeWidth={2} />
                        <span className="font-medium truncate max-w-[180px]">{event.location}</span>
                    </div>
                )}
            </div>

            {/* Creator + RSVP action */}
            <div className="flex items-center justify-between pt-3 border-t border-border-warm/50">
                {/* Creator */}
                <div className="flex items-center gap-2">
                    {event.creator?.avatar ? (
                        <img src={event.creator.avatar} alt="" className="w-6 h-6 rounded-full object-cover border border-border-warm" />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-warm-yellow to-amber-400 flex items-center justify-center text-[9px] font-bold text-ink">
                            {initials}
                        </div>
                    )}
                    <span className="text-xs text-muted font-medium">
                        by <span className="text-ink font-semibold">{event.creator?.name || 'Unknown'}</span>
                    </span>
                </div>

                {/* RSVP button */}
                <button
                    onClick={handleRsvp}
                    disabled={toggling}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none
                        ${isRsvped
                            ? 'bg-gradient-to-r from-warm-yellow to-amber-400 text-ink shadow-sm shadow-warm-yellow-glow hover:shadow-md'
                            : 'bg-white/60 text-slate border border-border-warm hover:border-ink/20 hover:bg-white/80 hover:text-ink'
                        }`}
                >
                    {isRsvped ? (
                        <>
                            <Check className={`w-3.5 h-3.5 transition-transform duration-200 ${toggling ? 'scale-110' : ''}`} strokeWidth={2.5} />
                            Going
                        </>
                    ) : (
                        <>
                            <UserPlus className={`w-3.5 h-3.5 transition-transform duration-200 ${toggling ? 'scale-110' : ''}`} strokeWidth={2} />
                            RSVP
                        </>
                    )}
                </button>
            </div>
        </article>
    );
};

export default EventCard;
