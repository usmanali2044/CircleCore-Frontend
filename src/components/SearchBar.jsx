import { useState, useEffect, useRef } from 'react';
import { Search, X, User as UserIcon, FileText, Loader2 } from 'lucide-react';
import { apiFetch } from '../stores/apiFetch';

const SEARCH_URL = 'http://localhost:3000/api/search';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef(null);
    const debounceRef = useRef(null);

    // Debounced search
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (query.trim().length < 2) {
            setResults(null);
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await apiFetch(`${SEARCH_URL}?q=${encodeURIComponent(query.trim())}`, {
                    credentials: 'include',
                });
                const data = await res.json();
                if (data.success) {
                    setResults(data);
                    setIsOpen(true);
                }
            } catch {
                // silently fail
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(debounceRef.current);
    }, [query]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close on Escape
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, []);

    const clear = () => {
        setQuery('');
        setResults(null);
        setIsOpen(false);
    };

    const hasUsers = results?.users?.length > 0;
    const hasPosts = results?.posts?.length > 0;
    const hasResults = hasUsers || hasPosts;

    return (
        <div ref={containerRef} className="relative w-full max-w-xs sm:max-w-sm">
            {/* Search input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" strokeWidth={2} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if (results) setIsOpen(true); }}
                    placeholder="Search people & posts…"
                    className="w-full pl-9 pr-8 py-2 rounded-xl border-2 border-border-warm/60 bg-white/60 text-xs text-ink font-medium placeholder:text-muted/50 outline-none transition-all duration-200 focus:bg-white focus:border-warm-yellow focus:shadow-[0_0_0_3px_var(--color-warm-yellow-glow)]"
                />
                {query && (
                    <button
                        onClick={clear}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full hover:bg-cream-dark flex items-center justify-center transition-colors cursor-pointer"
                    >
                        {isLoading
                            ? <Loader2 className="w-3 h-3 text-muted animate-spin" strokeWidth={2} />
                            : <X className="w-3 h-3 text-muted" strokeWidth={2.5} />}
                    </button>
                )}
            </div>

            {/* Results dropdown */}
            {isOpen && results && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-border-warm/40 overflow-hidden z-50 animate-slide-down max-h-80 overflow-y-auto">
                    {!hasResults && (
                        <div className="px-4 py-6 text-center">
                            <p className="text-xs font-semibold text-slate">No results for &ldquo;{query}&rdquo;</p>
                            <p className="text-[10px] text-muted mt-0.5">Try a different search term</p>
                        </div>
                    )}

                    {/* People section */}
                    {hasUsers && (
                        <div>
                            <div className="px-4 pt-3 pb-1.5">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">People</p>
                            </div>
                            {results.users.map((u) => (
                                <div
                                    key={u._id}
                                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-cream-dark/40 transition-colors cursor-pointer"
                                >
                                    {u.avatar ? (
                                        <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-border-warm shrink-0" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-warm-yellow to-amber-400 flex items-center justify-center shrink-0">
                                            <UserIcon className="w-3.5 h-3.5 text-ink" strokeWidth={2} />
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-ink truncate">{u.name}</p>
                                        <p className="text-[10px] text-muted truncate">{u.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Divider */}
                    {hasUsers && hasPosts && (
                        <div className="border-t border-border-warm/30 mx-3" />
                    )}

                    {/* Posts section */}
                    {hasPosts && (
                        <div>
                            <div className="px-4 pt-3 pb-1.5">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Posts</p>
                            </div>
                            {results.posts.map((p) => (
                                <div
                                    key={p._id}
                                    className="flex items-start gap-3 px-4 py-2.5 hover:bg-cream-dark/40 transition-colors cursor-pointer"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-cream-dark flex items-center justify-center shrink-0 mt-0.5">
                                        <FileText className="w-3.5 h-3.5 text-slate" strokeWidth={1.5} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-semibold text-ink line-clamp-2 leading-snug">
                                            {p.content.length > 120 ? p.content.slice(0, 120) + '…' : p.content}
                                        </p>
                                        <p className="text-[10px] text-muted mt-0.5">
                                            by {p.author?.name || 'Unknown'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
