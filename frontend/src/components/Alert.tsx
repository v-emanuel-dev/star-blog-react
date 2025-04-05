import { FC } from "react";

interface AlertProps {
  message: string;
  type?: "error" | "success" | "warning";
  title?: string;
  onClose?: () => void;
  className?: string;
}

const Alert: FC<AlertProps> = ({
  message,
  type = "error",
  title,
  onClose,
  className = "",
}) => {
  const styles = {
    error: {
      bg: "bg-red-100",
      border: "border-red-400",
      text: "text-red-700",
      icon: "text-red-500",
      title: title || "Error!",
    },
    success: {
      bg: "bg-green-100",
      border: "border-green-400",
      text: "text-green-700",
      icon: "text-green-500",
      title: title || "Success!",
    },
    warning: {
      bg: "bg-yellow-100",
      border: "border-yellow-400",
      text: "text-yellow-700",
      icon: "text-yellow-500",
      title: title || "Warning!",
    },
  };

  const { bg, border, text, icon, title: resolvedTitle } = styles[type];

  return (
    <div
      className={`${bg} ${border} ${text} border px-4 py-3 rounded relative mb-4 ${className}`}
      role="alert"
    >
      {resolvedTitle && (
        <strong className="font-bold mr-2">{resolvedTitle}</strong>
      )}
      <span className="block sm:inline">{message}</span>
      {onClose && (
        <button
          className="absolute top-0 bottom-0 right-0 px-4 py-3"
          onClick={onClose}
          aria-label="Close"
        >
          <svg
            className={`fill-current h-6 w-6 ${icon}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <title>Close</title>
            <path d="M14.348 14.849a1.2 1.2 0 01-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 11-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 111.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 111.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 010 1.698z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Alert;
