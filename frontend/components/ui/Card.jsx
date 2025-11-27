'use client';

export default function Card({ children, className = '', hover = false, elevated = false, ...props }) {
    const baseClasses = 'card';
    const hoverClasses = hover ? 'card-hover' : '';
    const elevatedClasses = elevated ? 'card-elevated' : '';

    return (
        <div
            className={`${baseClasses} ${hoverClasses} ${elevatedClasses} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
