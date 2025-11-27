'use client';

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    isLoading, // Destructure to prevent passing to DOM
    disabled = false,
    className = '',
    ...props
}) {
    const isBusy = loading || isLoading;
    const baseClasses = 'btn';

    const variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        ghost: 'btn-ghost',
    };

    const sizeClasses = {
        sm: 'btn-sm',
        md: '',
        lg: 'btn-lg',
    };

    const disabledClasses = disabled || isBusy ? 'opacity-50 cursor-not-allowed' : '';

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
            disabled={disabled || isBusy}
            {...props}
        >
            {isBusy ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Loading...</span>
                </div>
            ) : (
                children
            )}
        </button>
    );
}
