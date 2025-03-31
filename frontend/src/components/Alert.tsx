import React, { FC } from 'react';

interface AlertProps {
  message: string;
  type?: 'error' | 'success' | 'warning';
  title?: string;
  onClose?: () => void;
  className?: string; // Add className prop
}

const Alert: FC<AlertProps> = ({
  message,
  type = 'error',
  title,
  onClose,
  className = '' // Default to empty string
}) => {
  let bgColor = 'bg-red-100';
  let borderColor = 'border-red-400';
  let textColor = 'text-red-700';
  let titleText = title;
  let iconColor = 'text-red-500';

  if (type === 'success') {
    bgColor = 'bg-green-100'; borderColor = 'border-green-400'; textColor = 'text-green-700'; titleText = title || 'Success!'; iconColor = 'text-green-500';
  } else if (type === 'warning') {
    bgColor = 'bg-yellow-100'; borderColor = 'border-yellow-400'; textColor = 'text-yellow-700'; titleText = title || 'Warning!'; iconColor = 'text-yellow-500';
  } else { titleText = title || 'Error!'; }

  return (
    <div
      // Apply passed className along with specific alert styles
      className={`${bgColor} ${borderColor} ${textColor} border px-4 py-3 rounded relative mb-4 ${className}`}
      role="alert"
    >
      {titleText && <strong className="font-bold mr-2">{titleText}</strong>}
      <span className="block sm:inline">{message}</span>
      {onClose && (
        <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={onClose} role="button" aria-label="Close">
          <svg className={`fill-current h-6 w-6 ${iconColor}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
        </span>
      )}
    </div>
  );
};

export default Alert;
