'use client';

import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from 'lucide-react';

export default function CustomDatePicker({ selected, onChange, placeholder = "Select date", className = "", ...props }) {
    return (
        <div className={`relative ${className}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Calendar size={16} className="text-text-tertiary" />
            </div>
            <DatePicker
                selected={selected}
                onChange={onChange}
                placeholderText={placeholder}
                className="w-full !pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                dateFormat="dd/MM/yyyy"
                wrapperClassName="w-full"
                showPopperArrow={false}
                {...props}
            />
        </div>
    );
}
