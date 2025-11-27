'use client';

import { Calendar } from 'lucide-react';

export default function DatePicker({ selected, onChange, placeholderText, isClearable, ...props }) {
    const handleChange = (e) => {
        const dateValue = e.target.value;
        if (onChange) {
            onChange(dateValue ? new Date(dateValue) : null);
        }
    };

    const value = selected ? selected.toISOString().slice(0, 10) : '';

    return (
        <div className="relative">
            <input
                type="date"
                value={value}
                onChange={handleChange}
                placeholder={placeholderText}
                className="input-field pr-10"
                {...props}
            />
            <Calendar
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                size={18}
            />
        </div>
    );
}
