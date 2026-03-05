import { forwardRef } from 'react';

/**
 * Reusable Button component
 *
 * @param {'primary' | 'secondary' | 'ghost'} variant
 * @param {'sm' | 'md' | 'lg'} size
 * @param {boolean} fullWidth
 * @param {boolean} loading
 * @param {React.ReactNode} icon - optional icon element
 */
const Button = forwardRef(
    (
        {
            children,
            variant = 'primary',
            size = 'md',
            fullWidth = false,
            loading = false,
            disabled = false,
            icon,
            className = '',
            ...props
        },
        ref,
    ) => {
        const base =
            'inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-300 cursor-pointer select-none';

        const variants = {
            primary:
                'bg-gradient-to-r from-warm-yellow to-amber-400 text-ink hover:shadow-lg hover:shadow-warm-yellow-glow active:scale-[0.98] shadow-md',
            secondary:
                'bg-ink text-cream border-2 border-ink hover:bg-ink-light active:scale-[0.98] shadow-md',
            ghost:
                'bg-transparent text-ink border-2 border-border-warm hover:border-ink hover:bg-ink/5 active:scale-[0.98]',
        };

        const sizes = {
            sm: 'text-xs px-4 py-2.5',
            md: 'text-sm px-5 py-3.5',
            lg: 'text-base px-6 py-4',
        };

        const disabledStyles = 'opacity-40 cursor-not-allowed pointer-events-none';

        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={`
          ${base}
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${disabled || loading ? disabledStyles : ''}
          ${className}
        `}
                {...props}
            >
                {loading ? (
                    <>
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        {children}
                    </>
                ) : (
                    <>
                        {icon && <span className="shrink-0">{icon}</span>}
                        {children}
                    </>
                )}
            </button>
        );
    },
);

Button.displayName = 'Button';

export default Button;
