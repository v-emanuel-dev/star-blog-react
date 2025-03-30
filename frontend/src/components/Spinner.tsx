import React, { FC } from 'react';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg'; // Optional size prop
    color?: string; // Optional color class (e.g., 'text-indigo-600')
    className?: string; // Allow passing additional classes
}

const Spinner: FC<SpinnerProps> = ({
    size = 'md',
    color = 'text-indigo-600', // Default color
    className = ''
}) => {
    let sizeClasses = 'h-8 w-8'; // Default medium size
    if (size === 'sm') {
        sizeClasses = 'h-5 w-5';
    } else if (size === 'lg') {
        sizeClasses = 'h-12 w-12';
    }

    return (
        <svg
            className={`animate-spin ${sizeClasses} ${color} ${className}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            role="status" // Accessibility role
            aria-live="polite" // Accessibility live region
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            ></circle>
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
            <span className="sr-only">Loading...</span> {/* Accessibility text */}
        </svg>
    );
};

export default Spinner;
