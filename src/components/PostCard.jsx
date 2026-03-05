import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Heart, ChevronDown, ChevronUp, Send, MoreHorizontal, Flag, BarChart3, Check } from 'lucide-react';
import { useFeedStore } from '../stores/feedStore';
import { useAuthStore } from '../stores/authStore';

const PostCard = ({ post }) => {
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [liking, setLiking] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [flagging, setFlagging] = useState(false);
    const [flagged, setFlagged] = useState(false);
    const [voting, setVoting] = useState(false);
    const [lightboxImg, setLightboxImg] = useState(null);
    const menuRef = useRef(null);

    const { fetchComments, addComment, reactToPost, flagPost, voteOnPoll } = useFeedStore();
    const { user } = useAuthStore();

    const isLiked = post.likedBy?.includes(user?._id);

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

    const initials = post.author?.name
        ? post.author.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    const handleLike = async () => {
        if (liking) return;
        setLiking(true);
        try {
            await reactToPost(post._id);
        } catch { /* handled in store */ }
        setLiking(false);
    };

    const toggleComments = async () => {
        if (!showComments && comments.length === 0) {
            setLoadingComments(true);
            try {
                const fetched = await fetchComments(post._id);
                setComments(fetched);
            } catch { /* handled in store */ }
            setLoadingComments(false);
        }
        setShowComments(!showComments);
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim() || submitting) return;
        setSubmitting(true);
        try {
            const data = await addComment(post._id, commentText.trim());
            setComments((prev) => [...prev, data.comment]);
            setCommentText('');
            if (!showComments) setShowComments(true);
        } catch { /* handled in store */ }
        setSubmitting(false);
    };

    const handleFlag = async () => {
        if (flagging) return;
        setFlagging(true);
        try {
            await flagPost(post._id);
            setFlagged(true);
            setShowMenu(false);
        } catch { /* handled in store */ }
        setFlagging(false);
    };

    const handleVote = async (optionIndex) => {
        if (voting) return;
        setVoting(true);
        try {
            await voteOnPoll(post._id, optionIndex);
        } catch { /* handled in store */ }
        setVoting(false);
    };

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };
        if (showMenu) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMenu]);

    // ── Poll helpers ─────────────────────────────────────────────────────────
    const hasPoll = post.poll?.question && post.poll?.options?.length >= 2;
    const totalVotes = hasPoll ? post.poll.options.reduce((sum, o) => sum + (o.votes?.length || 0), 0) : 0;
    const userVotedIndex = hasPoll
        ? post.poll.options.findIndex((o) => o.votes?.includes(user?._id))
        : -1;
    const hasVoted = userVotedIndex >= 0;

    // ── Media grid ───────────────────────────────────────────────────────────
    const media = post.mediaURLs?.filter(Boolean) || [];

    const mediaGridClass = () => {
        if (media.length === 1) return 'grid-cols-1';
        if (media.length === 2) return 'grid-cols-2';
        if (media.length === 3) return 'grid-cols-2';
        return 'grid-cols-2';
    };

    const getRepTier = (rep) => {
        if (rep >= 100) return { label: 'Legend', color: 'text-amber-600' };
        if (rep >= 50) return { label: 'Expert', color: 'text-warm-yellow' };
        if (rep >= 20) return { label: 'Contributor', color: 'text-emerald-500' };
        if (rep >= 5) return { label: 'Rising', color: 'text-sky-500' };
        return { label: 'Newcomer', color: 'text-slate' };
    };

    const repTier = getRepTier(post.author?.reputation || 0);

    return (
        <article className="relative bg-white/70 backdrop-blur-2xl rounded-2xl p-5 sm:p-6 shadow-lg border border-white/60 transition-all duration-300 hover:shadow-xl">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-warm-yellow/10 via-transparent to-transparent -z-10 blur-sm" />

            {/* Author row */}
            <div className="flex items-center gap-3 mb-4">
                {post.author?.avatar ? (
                    <img src={post.author.avatar} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-warm-yellow/40 shadow-sm" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-warm-yellow to-amber-400 flex items-center justify-center text-sm font-bold text-ink shadow-sm">
                        {initials}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-ink truncate">{post.author?.name || 'Unknown'}</p>
                        {(post.author?.reputation > 0) && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-warm-yellow/10 border border-warm-yellow/20 shrink-0" title={`${repTier.label} — ${post.author.reputation} reputation`}>
                                <span className="text-[10px]">⭐</span>
                                <span className="text-[10px] font-bold text-ink">{post.author.reputation}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <p className="text-xs text-muted">{timeAgo(post.createdAt)}</p>
                        {(post.author?.reputation > 0) && (
                            <span className={`text-[10px] font-semibold ${repTier.color}`}>· {repTier.label}</span>
                        )}
                    </div>
                </div>

                {/* 3-dot menu */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="w-8 h-8 rounded-lg hover:bg-cream-dark/60 flex items-center justify-center transition-colors cursor-pointer"
                    >
                        <MoreHorizontal className="w-4 h-4 text-muted" strokeWidth={2} />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 top-[calc(100%+4px)] w-44 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-border-warm/60 overflow-hidden z-30 animate-slide-down">
                            <button
                                onClick={handleFlag}
                                disabled={flagging || flagged}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-left transition-colors hover:bg-cream-dark/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Flag className={`w-3.5 h-3.5 ${flagged ? 'text-error' : 'text-muted'}`} strokeWidth={2} />
                                <span className={flagged ? 'text-error' : 'text-ink-light'}>
                                    {flagged ? 'Reported' : 'Report / Flag'}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            {post.content && (
                <p className="text-sm text-ink-light leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>
            )}

            {/* ── Media Grid ── */}
            {media.length > 0 && (
                <div className={`grid ${mediaGridClass()} gap-2 mb-4 rounded-xl overflow-hidden`}>
                    {media.map((url, i) => (
                        <div
                            key={i}
                            className={`relative overflow-hidden rounded-xl cursor-pointer group
                                ${media.length === 3 && i === 0 ? 'row-span-2' : ''}
                                ${media.length === 1 ? 'max-h-[400px]' : 'aspect-square'}`}
                            onClick={() => setLightboxImg(url)}
                        >
                            <img
                                src={url}
                                alt=""
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        </div>
                    ))}
                </div>
            )}

            {/* ── Poll UI ── */}
            {hasPoll && (
                <div className="mb-4 p-4 bg-cream-dark/30 rounded-xl border border-border-warm/50 animate-fade-in">
                    <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="w-4 h-4 text-warm-yellow" strokeWidth={2} />
                        <p className="text-sm font-bold text-ink">{post.poll.question}</p>
                    </div>
                    <div className="space-y-2">
                        {post.poll.options.map((option, i) => {
                            const voteCount = option.votes?.length || 0;
                            const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                            const isMyVote = userVotedIndex === i;

                            return (
                                <button
                                    key={option._id || i}
                                    onClick={() => !hasVoted && handleVote(i)}
                                    disabled={hasVoted || voting}
                                    className={`w-full relative overflow-hidden rounded-xl px-4 py-3 text-left transition-all duration-300 cursor-pointer select-none
                                        ${hasVoted
                                            ? 'border-2 ' + (isMyVote ? 'border-warm-yellow bg-warm-yellow/5' : 'border-border-warm bg-white/40')
                                            : 'border-2 border-border-warm hover:border-warm-yellow/60 hover:bg-warm-yellow/5'
                                        }
                                        disabled:cursor-default`}
                                >
                                    {/* Percentage fill bar */}
                                    {hasVoted && (
                                        <div
                                            className={`absolute inset-y-0 left-0 rounded-xl transition-all duration-700 ease-out ${isMyVote ? 'bg-warm-yellow/15' : 'bg-cream-dark/40'}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    )}
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {hasVoted && isMyVote && (
                                                <div className="w-4 h-4 rounded-full bg-warm-yellow flex items-center justify-center">
                                                    <Check className="w-2.5 h-2.5 text-ink" strokeWidth={3} />
                                                </div>
                                            )}
                                            <span className={`text-xs font-semibold ${isMyVote ? 'text-ink' : 'text-ink-light'}`}>
                                                {option.text}
                                            </span>
                                        </div>
                                        {hasVoted && (
                                            <span className="text-xs font-bold text-slate ml-2">{pct}%</span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-[10px] text-muted mt-2.5 text-center">
                        {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                        {hasVoted && ' · You voted'}
                    </p>
                </div>
            )}

            {/* Tags */}
            {post.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {post.tags.map((tag) => (
                        <span key={tag} className="px-2.5 py-1 rounded-lg bg-warm-yellow/10 text-[11px] font-semibold text-ink border border-warm-yellow/15">
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Actions bar */}
            <div className="flex items-center gap-5 pt-3 border-t border-border-warm/50">
                {/* Like button */}
                <button
                    onClick={handleLike}
                    disabled={liking}
                    className={`flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer select-none
                        ${isLiked ? 'text-rose-500' : 'text-slate hover:text-rose-500'}`}
                >
                    <Heart
                        className={`w-4 h-4 transition-transform duration-200 ${liking ? 'scale-125' : 'scale-100'}`}
                        strokeWidth={2}
                        fill={isLiked ? 'currentColor' : 'none'}
                    />
                    <span>{post.likesCount || 0}</span>
                </button>

                {/* Comments toggle */}
                <button
                    onClick={toggleComments}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate hover:text-ink transition-colors cursor-pointer"
                >
                    <MessageCircle className="w-4 h-4" strokeWidth={2} />
                    <span>{post.commentsCount || 0}</span>
                    {showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
            </div>

            {/* Comments section */}
            {showComments && (
                <div className="mt-4 space-y-3 animate-fade-in">
                    {loadingComments ? (
                        <div className="flex items-center justify-center py-4">
                            <div className="w-5 h-5 rounded-full border-2 border-warm-yellow border-t-transparent animate-spin" />
                        </div>
                    ) : comments.length > 0 ? (
                        comments.map((c) => {
                            const cInitials = c.author?.name
                                ? c.author.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                                : '?';
                            return (
                                <div key={c._id} className="flex items-start gap-2.5 pl-2">
                                    {c.author?.avatar ? (
                                        <img src={c.author.avatar} alt="" className="w-7 h-7 rounded-full object-cover border border-border-warm mt-0.5" />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-cream-dark flex items-center justify-center text-[10px] font-bold text-slate mt-0.5">
                                            {cInitials}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xs font-bold text-ink">{c.author?.name}</span>
                                            <span className="text-[10px] text-muted">{timeAgo(c.createdAt)}</span>
                                        </div>
                                        <p className="text-xs text-ink-light leading-relaxed mt-0.5">{c.content}</p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-xs text-muted text-center py-2">No comments yet. Be the first!</p>
                    )}

                    {/* Reply input */}
                    <form onSubmit={handleSubmitComment} className="flex items-center gap-2 pt-2">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Write a reply…"
                            className="flex-1 px-3.5 py-2.5 rounded-xl border-2 border-border-warm bg-cream/40 text-xs text-ink font-medium placeholder:text-muted/60 outline-none transition-all duration-200 focus:bg-white focus:border-warm-yellow focus:shadow-[0_0_0_3px_var(--color-warm-yellow-glow)]"
                        />
                        <button
                            type="submit"
                            disabled={!commentText.trim() || submitting}
                            className="w-9 h-9 rounded-xl bg-gradient-to-r from-warm-yellow to-amber-400 flex items-center justify-center shadow-sm hover:shadow-md transition-all disabled:opacity-40 cursor-pointer"
                        >
                            {submitting ? (
                                <div className="w-3.5 h-3.5 rounded-full border-2 border-ink border-t-transparent animate-spin" />
                            ) : (
                                <Send className="w-3.5 h-3.5 text-ink" strokeWidth={2.5} />
                            )}
                        </button>
                    </form>
                </div>
            )}

            {/* ── Lightbox ── */}
            {lightboxImg && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in cursor-pointer"
                    onClick={() => setLightboxImg(null)}
                >
                    <img
                        src={lightboxImg}
                        alt=""
                        className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </article>
    );
};

export default PostCard;
