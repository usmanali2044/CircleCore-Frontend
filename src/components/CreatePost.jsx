import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Send, Hash, X, Image, BarChart3, Plus, Upload, Trash2 } from 'lucide-react';
import Button from './Button';
import { useFeedStore } from '../stores/feedStore';
import { useAuthStore } from '../stores/authStore';
import { useProfileStore } from '../stores/profileStore';
import { useChannelStore } from '../stores/channelStore';

const TAG_OPTIONS = [
    'General', 'Question', 'Discussion', 'Showcase', 'Help',
    'React', 'Node.js', 'Design', 'DevOps', 'Career',
];

const TABS = [
    { id: 'post', label: 'Post', icon: Image },
    { id: 'poll', label: 'Poll', icon: BarChart3 },
];

const CreatePost = () => {
    const [activeTab, setActiveTab] = useState('post');
    const [content, setContent] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [showTags, setShowTags] = useState(false);
    const [error, setError] = useState('');

    // Media state
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    // Poll state
    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '']);

    const { createPost, uploadFile, isLoading } = useFeedStore();
    const { user } = useAuthStore();
    const { profile } = useProfileStore();
    const { activeChannelId } = useChannelStore();

    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    // ── Dropzone ─────────────────────────────────────────────────────────────
    const onDrop = useCallback((acceptedFiles) => {
        const newFiles = acceptedFiles.map((file) =>
            Object.assign(file, { preview: URL.createObjectURL(file) })
        );
        setFiles((prev) => [...prev, ...newFiles].slice(0, 4));
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
            'application/pdf': ['.pdf'],
        },
        maxSize: 10 * 1024 * 1024,
        maxFiles: 4,
    });

    const removeFile = (index) => {
        setFiles((prev) => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].preview);
            updated.splice(index, 1);
            return updated;
        });
    };

    // ── Poll Helpers ─────────────────────────────────────────────────────────
    const addPollOption = () => {
        if (pollOptions.length < 6) setPollOptions([...pollOptions, '']);
    };

    const removePollOption = (index) => {
        if (pollOptions.length > 2) {
            setPollOptions(pollOptions.filter((_, i) => i !== index));
        }
    };

    const updatePollOption = (index, value) => {
        const updated = [...pollOptions];
        updated[index] = value;
        setPollOptions(updated);
    };

    // ── Tag Toggle ───────────────────────────────────────────────────────────
    const toggleTag = (tag) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    // ── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (activeTab === 'post') {
            if (!content.trim() && files.length === 0) {
                setError('Write something or attach media to share.');
                return;
            }

            try {
                setUploading(true);
                // Upload all files first
                const mediaURLs = [];
                for (const file of files) {
                    const url = await uploadFile(file);
                    mediaURLs.push(url);
                }
                setUploading(false);

                await createPost({ content: content.trim(), tags: selectedTags, mediaURLs, channelId: activeChannelId });
                setContent('');
                setSelectedTags([]);
                setShowTags(false);
                setFiles([]);
            } catch {
                setUploading(false);
            }
        } else {
            // Poll tab
            if (!pollQuestion.trim()) {
                setError('Enter a poll question.');
                return;
            }
            const validOptions = pollOptions.filter((o) => o.trim());
            if (validOptions.length < 2) {
                setError('Add at least 2 options.');
                return;
            }

            try {
                await createPost({
                    content: content.trim(),
                    tags: selectedTags,
                    poll: {
                        question: pollQuestion.trim(),
                        options: validOptions.map((text) => text.trim()),
                    },
                    channelId: activeChannelId,
                });
                setContent('');
                setSelectedTags([]);
                setShowTags(false);
                setPollQuestion('');
                setPollOptions(['', '']);
                setActiveTab('post');
            } catch {
                // error handled in store
            }
        }
    };

    const busy = isLoading || uploading;

    return (
        <div className="relative bg-white/70 backdrop-blur-2xl rounded-2xl p-5 sm:p-6 shadow-lg border border-white/60">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-warm-yellow/10 via-transparent to-transparent -z-10 blur-sm" />

            <div className="flex items-start gap-3">
                {/* Avatar */}
                {profile?.avatar ? (
                    <img src={profile.avatar} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-warm-yellow/40 shadow-sm shrink-0" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-warm-yellow to-amber-400 flex items-center justify-center text-sm font-bold text-ink shadow-sm shrink-0">
                        {initials}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 min-w-0">
                    {/* Tabs */}
                    <div className="flex gap-1 mb-3 p-1 bg-cream-dark/40 rounded-xl w-fit">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer select-none
                                    ${activeTab === tab.id
                                        ? 'bg-white text-ink shadow-sm'
                                        : 'text-slate hover:text-ink'
                                    }`}
                            >
                                <tab.icon className="w-3.5 h-3.5" strokeWidth={2} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Text area (common to both tabs) */}
                    <textarea
                        value={content}
                        onChange={(e) => { setContent(e.target.value); setError(''); }}
                        placeholder={activeTab === 'post' ? 'Share something with the community…' : 'Add context to your poll (optional)…'}
                        rows={activeTab === 'post' ? 3 : 2}
                        className="w-full rounded-xl border-2 border-border-warm bg-cream/40 text-sm text-ink font-medium placeholder:text-muted/50 outline-none resize-none transition-all duration-200 focus:bg-white focus:border-warm-yellow focus:shadow-[0_0_0_3px_var(--color-warm-yellow-glow)] px-4 py-3"
                    />

                    {/* ── Post Tab: Dropzone ── */}
                    {activeTab === 'post' && (
                        <>
                            <div
                                {...getRootProps()}
                                className={`mt-3 border-2 border-dashed rounded-xl p-4 text-center transition-all duration-200 cursor-pointer
                                    ${isDragActive
                                        ? 'border-warm-yellow bg-warm-yellow/5'
                                        : 'border-border-warm hover:border-warm-yellow/50 hover:bg-cream-dark/20'}`}
                            >
                                <input {...getInputProps()} />
                                <Upload className="w-5 h-5 text-muted mx-auto mb-1.5" strokeWidth={1.5} />
                                <p className="text-xs text-slate font-medium">
                                    {isDragActive ? 'Drop files here…' : 'Drag & drop images or click to browse'}
                                </p>
                                <p className="text-[10px] text-muted mt-0.5">JPG, PNG, GIF, WebP, PDF · Max 10 MB · Up to 4 files</p>
                            </div>

                            {/* File previews */}
                            {files.length > 0 && (
                                <div className="flex gap-2 mt-3 flex-wrap">
                                    {files.map((file, i) => (
                                        <div key={i} className="relative group">
                                            {file.type.startsWith('image/') ? (
                                                <img
                                                    src={file.preview}
                                                    alt=""
                                                    className="w-16 h-16 rounded-lg object-cover border-2 border-border-warm shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 rounded-lg bg-cream-dark flex items-center justify-center border-2 border-border-warm">
                                                    <span className="text-[10px] font-bold text-slate uppercase">{file.name.split('.').pop()}</span>
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeFile(i)}
                                                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-error text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                                            >
                                                <X className="w-3 h-3" strokeWidth={3} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* ── Poll Tab: Question & Options ── */}
                    {activeTab === 'poll' && (
                        <div className="mt-3 space-y-2.5 animate-fade-in">
                            <input
                                type="text"
                                value={pollQuestion}
                                onChange={(e) => { setPollQuestion(e.target.value); setError(''); }}
                                placeholder="Ask a question…"
                                className="w-full rounded-xl border-2 border-border-warm bg-cream/40 text-sm text-ink font-semibold placeholder:text-muted/50 outline-none transition-all duration-200 focus:bg-white focus:border-warm-yellow focus:shadow-[0_0_0_3px_var(--color-warm-yellow-glow)] px-4 py-3"
                            />
                            {pollOptions.map((opt, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full border-2 border-border-warm flex items-center justify-center text-[10px] font-bold text-muted shrink-0">
                                        {i + 1}
                                    </div>
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => updatePollOption(i, e.target.value)}
                                        placeholder={`Option ${i + 1}`}
                                        className="flex-1 rounded-lg border-2 border-border-warm bg-cream/40 text-xs text-ink font-medium placeholder:text-muted/50 outline-none transition-all duration-200 focus:bg-white focus:border-warm-yellow focus:shadow-[0_0_0_3px_var(--color-warm-yellow-glow)] px-3 py-2.5"
                                    />
                                    {pollOptions.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => removePollOption(i)}
                                            className="w-7 h-7 rounded-lg hover:bg-error/10 flex items-center justify-center transition-colors cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 text-error/60" strokeWidth={2} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {pollOptions.length < 6 && (
                                <button
                                    type="button"
                                    onClick={addPollOption}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-slate hover:text-ink transition-colors cursor-pointer pl-7"
                                >
                                    <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                                    Add option
                                </button>
                            )}
                        </div>
                    )}

                    {error && (
                        <p className="mt-1.5 text-xs font-medium text-error">{error}</p>
                    )}

                    {/* Selected tags */}
                    {selectedTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {selectedTags.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggleTag(tag)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-warm-yellow/15 text-[11px] font-semibold text-ink border border-warm-yellow/20 hover:bg-warm-yellow/25 transition-colors cursor-pointer"
                                >
                                    {tag}
                                    <X className="w-3 h-3" strokeWidth={2.5} />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Tag picker */}
                    {showTags && (
                        <div className="flex flex-wrap gap-1.5 mt-3 p-3 bg-cream-dark/30 rounded-xl animate-fade-in">
                            {TAG_OPTIONS.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggleTag(tag)}
                                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 cursor-pointer select-none
                                        ${selectedTags.includes(tag)
                                            ? 'bg-gradient-to-r from-warm-yellow to-amber-400 text-ink shadow-sm'
                                            : 'bg-white/60 text-slate border border-border-warm hover:border-ink/20'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-3">
                        <button
                            type="button"
                            onClick={() => setShowTags(!showTags)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-slate hover:text-ink transition-colors cursor-pointer"
                        >
                            <Hash className="w-3.5 h-3.5" strokeWidth={2} />
                            {showTags ? 'Hide tags' : 'Add tags'}
                        </button>

                        <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            loading={busy}
                            disabled={activeTab === 'post' ? (!content.trim() && files.length === 0) : !pollQuestion.trim()}
                            icon={!busy && <Send className="w-3.5 h-3.5" strokeWidth={2} />}
                        >
                            {uploading ? 'Uploading…' : isLoading ? 'Posting…' : activeTab === 'poll' ? 'Post Poll' : 'Post'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
