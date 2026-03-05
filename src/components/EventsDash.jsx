import { useState } from 'react';
import { Plus, X, CalendarPlus, MapPin, AlignLeft, Type } from 'lucide-react';
import EventCard from './EventCard';
import { useEventStore } from '../stores/eventStore';

const EventsDash = () => {
    const { events, isLoading, createEvent } = useEventStore();
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', date: '', location: '' });

    const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.date || submitting) return;
        setSubmitting(true);
        try {
            await createEvent(form);
            setForm({ title: '', description: '', date: '', location: '' });
            setShowForm(false);
        } catch { /* handled in store */ }
        setSubmitting(false);
    };

    return (
        <div className="space-y-5">
            {/* Create Event toggle / form */}
            {!showForm ? (
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-2xl border-2 border-dashed border-border-warm/60
                        text-sm font-bold text-slate hover:border-warm-yellow hover:text-ink hover:bg-white/50
                        transition-all duration-200 cursor-pointer group"
                >
                    <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" strokeWidth={2.5} />
                    Create Event
                </button>
            ) : (
                <form
                    onSubmit={handleCreate}
                    className="relative bg-white/70 backdrop-blur-2xl rounded-2xl p-5 sm:p-6 shadow-lg border border-white/60 space-y-4 animate-scale-in"
                >
                    <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-warm-yellow/10 via-transparent to-transparent -z-10 blur-sm" />

                    {/* Close */}
                    <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-cream-dark/60 flex items-center justify-center hover:bg-cream-dark transition-colors cursor-pointer"
                    >
                        <X className="w-3.5 h-3.5 text-slate" strokeWidth={2.5} />
                    </button>

                    <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                        <CalendarPlus className="w-4 h-4 text-warm-yellow" strokeWidth={2} />
                        New Event
                    </h3>

                    {/* Title */}
                    <div className="relative">
                        <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" strokeWidth={2} />
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => updateField('title', e.target.value)}
                            placeholder="Event title *"
                            required
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-border-warm bg-cream/40 text-xs text-ink font-medium
                                placeholder:text-muted/60 outline-none transition-all duration-200
                                focus:bg-white focus:border-warm-yellow focus:shadow-[0_0_0_3px_var(--color-warm-yellow-glow)]"
                        />
                    </div>

                    {/* Description */}
                    <div className="relative">
                        <AlignLeft className="absolute left-3 top-3 w-3.5 h-3.5 text-muted" strokeWidth={2} />
                        <textarea
                            value={form.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            placeholder="Description (optional)"
                            rows={3}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-border-warm bg-cream/40 text-xs text-ink font-medium
                                placeholder:text-muted/60 outline-none transition-all duration-200 resize-none
                                focus:bg-white focus:border-warm-yellow focus:shadow-[0_0_0_3px_var(--color-warm-yellow-glow)]"
                        />
                    </div>

                    {/* Date + Location row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                            type="datetime-local"
                            value={form.date}
                            onChange={(e) => updateField('date', e.target.value)}
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-border-warm bg-cream/40 text-xs text-ink font-medium
                                outline-none transition-all duration-200
                                focus:bg-white focus:border-warm-yellow focus:shadow-[0_0_0_3px_var(--color-warm-yellow-glow)]"
                        />
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" strokeWidth={2} />
                            <input
                                type="text"
                                value={form.location}
                                onChange={(e) => updateField('location', e.target.value)}
                                placeholder="Location or link"
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-border-warm bg-cream/40 text-xs text-ink font-medium
                                    placeholder:text-muted/60 outline-none transition-all duration-200
                                    focus:bg-white focus:border-warm-yellow focus:shadow-[0_0_0_3px_var(--color-warm-yellow-glow)]"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={!form.title.trim() || !form.date || submitting}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-warm-yellow to-amber-400 text-xs font-bold text-ink
                            shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-40 cursor-pointer"
                    >
                        {submitting ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-3.5 h-3.5 rounded-full border-2 border-ink border-t-transparent animate-spin" />
                                Creating…
                            </div>
                        ) : (
                            'Create Event'
                        )}
                    </button>
                </form>
            )}

            {/* Events list */}
            {isLoading && events.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 rounded-full border-3 border-warm-yellow border-t-transparent animate-spin" />
                </div>
            ) : events.length > 0 ? (
                events.map((event) => (
                    <EventCard key={event._id} event={event} />
                ))
            ) : (
                <div className="text-center py-16">
                    <div className="w-14 h-14 rounded-full bg-cream-dark flex items-center justify-center mx-auto mb-4">
                        <CalendarPlus className="w-6 h-6 text-muted" strokeWidth={1.5} />
                    </div>
                    <p className="text-sm font-semibold text-ink mb-1">No upcoming events</p>
                    <p className="text-xs text-muted">Create the first event for the community!</p>
                </div>
            )}
        </div>
    );
};

export default EventsDash;
