import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Reusable InputField component
 *
 * @param {string} label
 * @param {string} error - error message to display
 * @param {React.ReactNode} icon - optional left icon
 * @param {'text' | 'password' | 'email'} type
 */
const InputField = forwardRef(
    (
        {
            label,
            error,
            icon,
            type = 'text',
            className = '',
            ...props
        },
        ref,
    ) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === 'password';
        const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

        return (
            <div className={`w-full ${className}`}>
                {label && (
                    <label className="block text-sm font-semibold text-ink mb-1.5">
                        {label}
                    </label>
                )}

                <div className="relative">
                    {icon && (
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                            {icon}
                        </span>
                    )}

                    <input
                        ref={ref}
                        type={inputType}
                        className={`
              w-full rounded-xl border-2 bg-cream/60 text-ink font-medium
              placeholder:text-muted/60 outline-none
              transition-all duration-200
              focus:bg-white focus:border-warm-yellow focus:shadow-[0_0_0_3px_var(--color-warm-yellow-glow)]
              ${icon ? 'pl-11 pr-4' : 'px-4'}
              ${isPassword ? 'pr-11' : ''}
              ${error
                                ? 'border-error/50 focus:border-error focus:shadow-[0_0_0_3px_rgba(255,59,48,0.15)]'
                                : 'border-border-warm'}
              py-3.5 text-sm
            `}
                        {...props}
                    />

                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors cursor-pointer"
                            tabIndex={-1}
                        >
                            {showPassword
                                ? <EyeOff className="w-4 h-4" strokeWidth={2} />
                                : <Eye className="w-4 h-4" strokeWidth={2} />
                            }
                        </button>
                    )}
                </div>

                {error && (
                    <p className="mt-1.5 text-xs font-medium text-error flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
                        </svg>
                        {error}
                    </p>
                )}
            </div>
        );
    },
);

InputField.displayName = 'InputField';

export default InputField;
