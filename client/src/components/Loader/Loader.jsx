import React from "react";

export const Loader = ({ fullScreen = false, text = "Loading..." }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-base-100/80 backdrop-blur-sm z-50">
        <span className="loading loading-ring loading-lg text-primary"></span>
        <p className="mt-4 text-sm font-semibold text-base-content/70 animate-pulse">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <span className="loading loading-spinner loading-md text-primary"></span>
      <p className="mt-2 text-xs text-base-content/60">{text}</p>
    </div>
  );
};

export default Loader;
