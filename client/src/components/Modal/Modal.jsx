import React from "react";

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box relative max-w-2xl bg-base-100 shadow-2xl rounded-2xl border border-base-300">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-base-content/60 hover:text-base-content"
        >
          ✕
        </button>
        {title && <h3 className="text-xl font-bold text-base-content mb-4">{title}</h3>}
        <div className="py-2">{children}</div>
      </div>
      <div className="modal-backdrop bg-neutral/40 backdrop-blur-xs" onClick={onClose}></div>
    </div>
  );
};

export default Modal;
