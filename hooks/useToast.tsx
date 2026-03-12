import { createContext, useContext, useState } from "react";

type ToastContextType = {
    showToast: (message: string, type: "success" | "error" | "warning" | "info") => void;
    removeToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

type Toast = {
    id: number;
    message: string;
    type: "success" | "error" | "warning" | "info";
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: "success" | "error" | "warning" | "info") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
    };

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
}

export default function useToast() {
    const toast = useContext(ToastContext);
    if (!toast) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return toast;
}