'use client';

export default function PageHeader({ title, description, action, children }) {
    return (
        <div className="section-header animate-slide-in">
            <div>
                <h1 className="section-title">{title}</h1>
                {description && (
                    <p className="text-text-secondary mt-1">{description}</p>
                )}
            </div>
            {action && <div>{action}</div>}
            {children}
        </div>
    );
}
