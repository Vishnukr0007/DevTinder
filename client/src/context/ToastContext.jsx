import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((msg, duration) => showToast(msg, "success", duration), [showToast]);
  const error = useCallback((msg, duration) => showToast(msg, "error", duration), [showToast]);
  const info = useCallback((msg, duration) => showToast(msg, "info", duration), [showToast]);
  const warning = useCallback((msg, duration) => showToast(msg, "warning", duration), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning, removeToast }}>
      {children}
      {toasts.length > 0 && (
        <div className="toast toast-top toast-end z-50 p-4 space-y-2 pointer-events-none">
          {toasts.map((t) => {
            let alertClass = "alert-info";
            let icon = "ℹ️";

            if (t.type === "success") {
              alertClass = "alert-success text-success-content";
              icon = "✅";
            } else if (t.type === "error") {
              alertClass = "alert-error text-error-content";
              icon = "❌";
            } else if (t.type === "warning") {
              alertClass = "alert-warning text-warning-content";
              icon = "⚠️";
            }

            return (
              <div
                key={t.id}
                className={`alert ${alertClass} shadow-xl rounded-2xl flex items-center justify-between text-xs sm:text-sm font-semibold pointer-events-auto transition-all transform`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{icon}</span>
                  <span>{t.message}</span>
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="btn btn-ghost btn-xs btn-circle ml-2 opacity-70 hover:opacity-100"
                  aria-label="Dismiss toast"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export default ToastContext;
