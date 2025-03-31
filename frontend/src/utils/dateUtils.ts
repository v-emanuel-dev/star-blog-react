// src/utils/dateUtils.ts

// Internal helper using native Date
const formatDateInternal = (
    dateInput: string | undefined | null,
    formatOptions: Intl.DateTimeFormatOptions, // Accept options object
    locale: string = 'en-US' // Default locale changed to en-US
): string => {
    if (!dateInput) return '';
    try {
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) {
             console.error("Native Date() produced Invalid Date for:", dateInput);
             return String(dateInput || '');
        }
        // Use provided locale and options
        return date.toLocaleString(locale, formatOptions);
    } catch (error) {
        console.error("Error formatting date:", dateInput, error);
        return String(dateInput || '');
    }
}

// Function for displaying Date only (e.g., March 31, 2025)
export const formatDisplayDate = (dateString: string | undefined | null): string => {
     const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long', // Use long month name
        day: 'numeric',
        // timeZone: 'UTC' // Optional: Add if dates seem off by a day due to timezone
    };
    return formatDateInternal(dateString, options, 'en-US'); // Pass en-US locale
};

// Function for displaying Date and Time (e.g., March 31, 2025, 6:30 AM)
export const formatDisplayDateTime = (dateString: string | undefined | null): string => {
     const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long', // Use long month name for consistency
        day: 'numeric',
        hour: 'numeric', // Use numeric hour
        minute: '2-digit', // Ensure two digits for minute
        hour12: true // Use AM/PM format
    };
     return formatDateInternal(dateString, options, 'en-US'); // Pass en-US locale
};

/*
// --- OR If using date-fns ---
import { format, parseISO, isValid } from 'date-fns';
import { enUS } from 'date-fns/locale'; // Import enUS locale

export const formatDisplayDate = (dateString: string | undefined | null): string => {
    if (!dateString) return '';
    try {
        const date = parseISO(dateString);
        if (!isValid(date)) return dateString;
        return format(date, 'PPP', { locale: enUS }); // Example: Mar 31st, 2025
    } catch (error) { return String(dateString); }
};

export const formatDisplayDateTime = (dateString: string | undefined | null): string => {
    if (!dateString) return '';
    try {
        const date = parseISO(dateString);
        if (!isValid(date)) return dateString;
        return format(date, 'Pp', { locale: enUS }); // Example: 03/31/2025, 6:30 AM
    } catch (error) { return String(dateString); }
};
*/