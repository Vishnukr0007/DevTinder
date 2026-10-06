import React from "react";
import { useNavigate } from "react-router-dom";
import { getAvatarUrl } from "../../utils/avatar.js";

export const MatchModal = ({ isOpen, onClose, matchedUser, currentUser }) => {
  const navigate = useNavigate();

  if (!isOpen || !matchedUser) return null;

  const matchedName = `${matchedUser.firstName || ""} ${matchedUser.lastName || ""}`.trim() || "Developer";
  const currentName = currentUser ? `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() : "You";

  const handleStartChat = () => {
    onClose();
    navigate(`/app/messages?partner=${matchedUser.id}`);
  };

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box max-w-lg bg-base-100 text-center p-8 rounded-3xl border border-primary/30 shadow-2xl overflow-hidden relative">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-tr from-primary to-secondary opacity-30 blur-3xl rounded-full pointer-events-none"></div>

        {/* Header Title */}
        <div className="space-y-2 relative z-10">
          <span className="inline-block text-5xl animate-bounce">⚡🎉</span>
          <h2 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
            It's a Pair Match!
          </h2>
          <p className="text-xs text-base-content/70">
            You and <strong className="text-primary font-semibold">{matchedName}</strong> connected with each other!
          </p>
        </div>

        {/* Intersecting Avatars */}
        <div className="flex justify-center items-center gap-0 my-8 relative z-10">
          {/* Current User Avatar */}
          <div className="avatar ring-4 ring-primary ring-offset-4 ring-offset-base-100 rounded-full z-10 shadow-xl transition-transform hover:scale-110">
            <div className="w-24 rounded-full">
              <img src={getAvatarUrl(currentUser?.avatarUrl, currentName)} alt={currentName} />
            </div>
          </div>

          {/* Connection Sparkle */}
          <div className="z-20 -mx-4 bg-primary text-primary-content font-black rounded-full p-2 text-xl shadow-lg border-2 border-base-100 animate-pulse">
            🤝
          </div>

          {/* Matched User Avatar */}
          <div className="avatar ring-4 ring-secondary ring-offset-4 ring-offset-base-100 rounded-full z-10 shadow-xl transition-transform hover:scale-110">
            <div className="w-24 rounded-full">
              <img src={getAvatarUrl(matchedUser?.avatarUrl, matchedName)} alt={matchedName} />
            </div>
          </div>
        </div>

        {/* Matched User Info Card */}
        <div className="bg-base-200/60 border border-base-300 rounded-2xl p-4 mb-6 text-center space-y-1 relative z-10">
          <h4 className="font-extrabold text-base-content">{matchedName}</h4>
          {matchedUser.headline && <p className="text-xs text-primary font-medium">{matchedUser.headline}</p>}
          {matchedUser.location && <p className="text-xs text-base-content/60">📍 {matchedUser.location}</p>}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 relative z-10">
          <button
            onClick={handleStartChat}
            className="btn btn-primary w-full rounded-2xl shadow-lg shadow-primary/30 font-bold tracking-wide"
          >
            💬 Send Message Now
          </button>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm text-xs text-base-content/60 hover:text-base-content"
          >
            Keep Exploring Developers 🚀
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-neutral/60 backdrop-blur-md" onClick={onClose}></div>
    </div>
  );
};

export default MatchModal;
