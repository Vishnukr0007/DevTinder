import React, { useState } from "react";

const POPULAR_SKILLS = [
  "React",
  "Node.js",
  "TypeScript",
  "JavaScript",
  "Python",
  "Go",
  "Rust",
  "Java",
  "PostgreSQL",
  "MongoDB",
  "Tailwind",
  "Docker",
];

const EXPERIENCE_LEVELS = [
  { label: "All Levels", value: "ALL" },
  { label: "Beginner", value: "BEGINNER" },
  { label: "Junior", value: "JUNIOR" },
  { label: "Mid Level", value: "MID_LEVEL" },
  { label: "Senior", value: "SENIOR" },
  { label: "Expert", value: "EXPERT" },
];

export const FilterDrawer = ({ isOpen, onClose, filters, onApply, onReset }) => {
  const [selectedSkills, setSelectedSkills] = useState(
    filters.skills ? filters.skills.split(",").map((s) => s.trim()) : []
  );
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [experienceLevel, setExperienceLevel] = useState(filters.experienceLevel || "ALL");
  const [isOpenToPairing, setIsOpenToPairing] = useState(filters.isOpenToPairing || "ALL");
  const [location, setLocation] = useState(filters.location || "");

  if (!isOpen) return null;

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    if (!customSkillInput.trim()) return;
    const skill = customSkillInput.trim();
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
    setCustomSkillInput("");
  };

  const handleApply = () => {
    onApply({
      skills: selectedSkills.join(","),
      experienceLevel,
      isOpenToPairing,
      location,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedSkills([]);
    setCustomSkillInput("");
    setExperienceLevel("ALL");
    setIsOpenToPairing("ALL");
    setLocation("");
    onReset();
    onClose();
  };

  return (
    <div className="modal modal-open z-40">
      <div className="modal-box max-w-md bg-base-100 p-6 rounded-3xl border border-base-300 shadow-2xl relative space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-base-200 pb-3">
          <div>
            <h3 className="text-xl font-black text-base-content tracking-tight">⚙️ Filter Discovery</h3>
            <p className="text-xs text-base-content/60">Customize your developer match criteria</p>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            ✕
          </button>
        </div>

        {/* Tech Skills Filter */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-base-content/70">
            Tech Stack / Skills
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
            {POPULAR_SKILLS.map((skill) => {
              const active = selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`btn btn-xs rounded-full transition-all ${
                    active ? "btn-primary" : "btn-outline btn-neutral"
                  }`}
                >
                  {skill} {active ? "✓" : "+"}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleAddCustomSkill} className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Add specific skill..."
              className="input input-bordered input-xs rounded-xl flex-1"
              value={customSkillInput}
              onChange={(e) => setCustomSkillInput(e.target.value)}
            />
            <button type="submit" className="btn btn-xs btn-outline rounded-xl">
              Add
            </button>
          </form>

          {selectedSkills.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {selectedSkills.map((skill) => (
                <span key={skill} className="badge badge-primary badge-sm gap-1">
                  {skill}
                  <button type="button" onClick={() => toggleSkill(skill)}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Experience Level */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-base-content/70">
            Experience Level
          </label>
          <select
            className="select select-bordered select-sm w-full rounded-xl text-xs"
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
          >
            {EXPERIENCE_LEVELS.map((lvl) => (
              <option key={lvl.value} value={lvl.value}>
                {lvl.label}
              </option>
            ))}
          </select>
        </div>

        {/* Pair Availability */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-base-content/70">
            Pairing Availability
          </label>
          <select
            className="select select-bordered select-sm w-full rounded-xl text-xs"
            value={isOpenToPairing}
            onChange={(e) => setIsOpenToPairing(e.target.value)}
          >
            <option value="ALL">Any Status</option>
            <option value="true">⚡ Open to Pair Only</option>
            <option value="false">Not Currently Pairing</option>
          </select>
        </div>

        {/* Location Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-base-content/70">
            Location / City
          </label>
          <input
            type="text"
            placeholder="e.g. San Francisco, Remote, London..."
            className="input input-bordered input-sm w-full rounded-xl text-xs"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Footer Action Buttons */}
        <div className="flex gap-3 border-t border-base-200 pt-4">
          <button onClick={handleReset} className="btn btn-ghost btn-sm flex-1 rounded-xl text-xs">
            Reset All
          </button>
          <button onClick={handleApply} className="btn btn-primary btn-sm flex-1 rounded-xl font-bold text-xs">
            Apply Filters
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-neutral/50 backdrop-blur-xs" onClick={onClose}></div>
    </div>
  );
};

export default FilterDrawer;
