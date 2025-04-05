import React, { FC, ReactNode } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: "red" | "indigo";
  isLoading?: boolean;
}

const ConfirmationModal: FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "red",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const confirmButtonClasses =
    confirmColor === "red"
      ? "bg-red-600 hover:bg-red-500 focus:ring-red-500"
      : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500";

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="relative z-50" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
        <div
          className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
          onClick={handleBackdropClick}
        >
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-2xl border border-gray-200 transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100">
              <div className="mt-3 text-center sm:mt-0 sm:text-left">
                <h3 className="text-lg font-bold leading-6 text-gray-900">
                  {title}
                </h3>
                <div className="mt-2 text-sm text-gray-600">{message}</div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                disabled={isLoading}
                className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:ml-3 sm:w-auto disabled:opacity-50 ${confirmButtonClasses}`}
                onClick={onConfirm}
              >
                {isLoading ? "Processing..." : confirmText}
              </button>
              <button
                type="button"
                disabled={isLoading}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50"
                onClick={onClose}
              >
                {cancelText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
