import React, { useState } from "react";
import SkillBadge from "../SkillBadge/SkillBadge.jsx";
import { getAvatarUrl } from "../../utils/avatar.js";

export const DeveloperCard = ({ developer, onConnect, onSkip, onSave, isSaved }) => {
  const [swipeDirection, setSwipeDirection] = useState(null);

  if (!developer) return null;

  const {
    id,
    firstName,
    lastName,
    headline,
    bio,
    avatarUrl,
    location,
    experienceLevel,
    isOpenToPairing,
    userSkills = [],
    projects = [],
    githubUrl,
    linkedinUrl,
  } = developer;

  const fullName = `${firstName || ""} ${lastName || ""}`.trim() || "Developer";

  const handleSkipClick = () => {
    setSwipeDirection("left");
    setTimeout(() => {
      onSkip && onSkip(id);
      setSwipeDirection(null);
    }, 250);
  };

  const handleConnectClick = () => {
    setSwipeDirection("right");
    setTimeout(() => {
      onConnect && onConnect(id);
      setSwipeDirection(null);
    }, 250);
  };

  const getSwipeStyle = () => {
    if (swipeDirection === "left") {
      return "-translate-x-64 -rotate-12 opacity-0";
    }
    if (swipeDirection === "right") {
      return "translate-x-64 rotate-12 opacity-0";
    }
    return "translate-x-0 rotate-0 opacity-100";
  };

  return (
    <div
      className={`card w-full max-w-md bg-base-100 shadow-2xl border border-base-300 rounded-3xl overflow-hidden hover:shadow-primary/10 transition-all duration-300 transform ${getSwipeStyle()}`}
    >
      {/* Header Image / Avatar Section */}
      <div className="relative bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 p-6 pt-8 text-center">
        <div className="avatar mx-auto mb-3">
          <div className="w-28 rounded-full ring-4 ring-primary ring-offset-2 ring-offset-base-100 shadow-lg">
            <img src={getAvatarUrl(avatarUrl, fullName)} alt={fullName} />
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-base-content tracking-tight">{fullName}</h2>
        {headline && <p className="text-sm font-medium text-primary mt-1">{headline}</p>}
        {location && <p className="text-xs text-base-content/70 mt-1">📍 {location}</p>}

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-2 mt-3">
          <span className="badge badge-primary badge-outline text-xs uppercase font-mono tracking-wider">
            {experienceLevel || "DEVELOPER"}
          </span>
          {isOpenToPairing && (
            <span className="badge badge-success text-xs font-semibold">⚡ Open to Pair</span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body p-6 space-y-4">
        {/* Bio */}
        {bio && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-1">About</h4>
            <p className="text-sm text-base-content/80 line-clamp-3 leading-relaxed">{bio}</p>
          </div>
        )}

        {/* Skills Section */}
        {userSkills.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-2">Tech Stack & Proficiency</h4>
            <div className="flex flex-wrap gap-1.5">
              {userSkills.slice(0, 6).map((skill, idx) => (
                <SkillBadge key={idx} name={skill.name} level={skill.level} />
              ))}
              {userSkills.length > 6 && (
                <span className="badge badge-ghost text-xs">+{userSkills.length - 6} more</span>
              )}
            </div>
          </div>
        )}

        {/* Projects Preview */}
        {projects.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-1">Pinned Project</h4>
            <div className="p-3 bg-base-200/60 rounded-xl border border-base-300">
              <p className="text-sm font-bold text-base-content">{projects[0].title}</p>
              <p className="text-xs text-base-content/70 line-clamp-2 mt-0.5">{projects[0].description}</p>
            </div>
          </div>
        )}

        {/* Social Links */}
        <div className="flex justify-center space-x-4 pt-2 border-t border-base-200">
          {githubUrl && (
            <a href={githubUrl} target="_blank" rel="noreferrer" className="btn btn-xs btn-ghost gap-1">
              🐙 GitHub
            </a>
          )}
          {linkedinUrl && (
            <a href={linkedinUrl} target="_blank" rel="noreferrer" className="btn btn-xs btn-ghost gap-1">
              💼 LinkedIn
            </a>
          )}
        </div>

        {/* Action Controls */}
        <div className="card-actions justify-between items-center pt-4">
          <button
            onClick={handleSkipClick}
            className="btn btn-circle btn-lg btn-outline btn-error shadow-md hover:scale-110 active:scale-95 transition-all"
            title="Skip (Swipe Left)"
          >
            ❌
          </button>

          <button
            onClick={() => onSave && onSave(id)}
            className={`btn btn-circle btn-md transition-all hover:scale-110 ${
              isSaved ? "btn-warning shadow-md" : "btn-ghost"
            }`}
            title="Bookmark Developer"
          >
            ⭐
          </button>

          <button
            onClick={handleConnectClick}
            className="btn btn-circle btn-lg btn-primary shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 transition-all"
            title="Connect (Swipe Right)"
          >
            ⚡
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeveloperCard;

