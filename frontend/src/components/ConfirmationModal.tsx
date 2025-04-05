import React, { FC, ReactNode } from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void; // Função para fechar o modal (ex: botão Cancelar ou clique fora)
    onConfirm: () => void; // Função a ser executada ao confirmar
    title: string; // Título do modal (ex: "Delete Post")
    message: string | ReactNode; // Conteúdo/mensagem do modal
    confirmText?: string; // Texto do botão de confirmação (default: "Confirm")
    cancelText?: string; // Texto do botão de cancelar (default: "Cancel")
    confirmColor?: 'red' | 'indigo'; // Cor tema do botão de confirmação
    isLoading?: boolean; // Para mostrar loading no botão Confirmar
}

const ConfirmationModal: FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmColor = 'red', // Default to red for destructive actions
    isLoading = false,
}) => {
    if (!isOpen) {
        return null; // Não renderiza nada se não estiver aberto
    }

    const confirmButtonColorClasses = confirmColor === 'red'
        ? 'bg-red-600 hover:bg-red-500 focus:ring-red-500'
        : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';

    // Lógica para fechar ao clicar no backdrop (opcional)
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
         if (e.target === e.currentTarget) {
             onClose();
         }
    };

    return (
        // Portal seria ideal aqui, mas mantendo simples por enquanto
        <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Backdrop - com efeito de desfoque */}
            <div className="fixed inset-0 backdrop-blur-sm transition-opacity" aria-hidden="true"></div>

            <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
                <div
                    className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
                    onClick={handleBackdropClick} // Fechar ao clicar fora
                >
                    {/* Painel do Modal com sombra aprimorada e borda */}
                    <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-2xl border border-gray-200 transition-all sm:my-8 sm:w-full sm:max-w-lg">
                        {/* Cabeçalho com fundo diferenciado */}
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100">
                            <div>
                                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                    {/* Título mais destacado */}
                                    <h3 className="text-lg font-bold leading-6 text-gray-900" id="modal-title">
                                        {title}
                                    </h3>
                                    {/* Mensagem */}
                                    <div className="mt-2">
                                        <div className="text-sm text-gray-600">{message}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                         {/* Botões */}
                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            <button
                                type="button"
                                disabled={isLoading}
                                className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:ml-3 sm:w-auto disabled:opacity-50 ${confirmButtonColorClasses}`}
                                onClick={onConfirm}
                            >
                                 {isLoading ? 'Processing...' : confirmText}
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
