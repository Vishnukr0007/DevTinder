import React from "react";

export const SkillBadge = ({ name, level }) => {
  const getBadgeStyle = (lvl) => {
    switch (lvl?.toUpperCase()) {
      case "EXPERT":
        return "badge-error badge-outline font-bold";
      case "ADVANCED":
        return "badge-primary font-semibold";
      case "INTERMEDIATE":
        return "badge-secondary font-medium";
      case "BEGINNER":
      default:
        return "badge-accent badge-soft";
    }
  };

  return (
    <div className={`badge ${getBadgeStyle(level)} gap-1 py-3 px-3 text-xs`}>
      <span>{name}</span>
      {level && <span className="opacity-75 text-[10px] uppercase font-mono">({level})</span>}
    </div>
  );
};

export default SkillBadge;
