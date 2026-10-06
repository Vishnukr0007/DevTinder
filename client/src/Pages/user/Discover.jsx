import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import DeveloperCard from "../../components/DeveloperCard/DeveloperCard.jsx";
import FilterDrawer from "../../components/FilterDrawer/FilterDrawer.jsx";
import MatchModal from "../../components/MatchModal/MatchModal.jsx";
import Loader from "../../components/Loader/Loader.jsx";
import { connectionApi } from "../../services/connectionApi.js";
import { useSocket } from "../../context/SocketContext.jsx";

export const Discover = () => {
  const currentUser = useSelector((state) => state.auth.user);
  const { subscribeToMatch } = useSocket();

  const [developers, setDevelopers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState(null);

  // Filter drawer state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    skills: "",
    experienceLevel: "ALL",
    isOpenToPairing: "ALL",
    location: "",
  });

  // Match modal state
  const [matchedUser, setMatchedUser] = useState(null);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);

  // Real-time socket listener for incoming matches while browsing
  useEffect(() => {
    const unsubscribeMatch = subscribeToMatch((matchedDev) => {
      setMatchedUser(matchedDev);
      setIsMatchModalOpen(true);
      return true;
    });

    return unsubscribeMatch;
  }, [subscribeToMatch]);

  const fetchFeed = useCallback(
    async (overrideFilters) => {
      try {
        setLoading(true);
        const data = await connectionApi.getDiscoveryFeed(1, 25, overrideFilters);
        if (data.success) {
          setDevelopers(data.developers || []);
          setCurrentIndex(0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchFeed(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return fetchFeed(filters);

    try {
      setLoading(true);
      const data = await connectionApi.searchDevelopers(searchQuery);
      if (data.success) {
        setDevelopers(data.developers || []);
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    fetchFeed(newFilters);
  };

  const handleResetFilters = () => {
    const emptyFilters = {
      skills: "",
      experienceLevel: "ALL",
      isOpenToPairing: "ALL",
      location: "",
    };
    setFilters(emptyFilters);
    fetchFeed(emptyFilters);
  };

  const handleConnect = async (developerId) => {
    try {
      const res = await connectionApi.connectDeveloper(developerId);
      if (res.isMatch && res.matchedUser) {
        setMatchedUser(res.matchedUser);
        setIsMatchModalOpen(true);
      } else {
        setFeedback({ type: "connect", message: res.message || "Connection request sent!" });
        setTimeout(() => setFeedback(null), 3000);
      }
      nextCard();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSkip = async (developerId) => {
    try {
      await connectionApi.skipDeveloper(developerId);
      setFeedback({ type: "skip", message: "Developer skipped" });
      setTimeout(() => setFeedback(null), 2000);
      nextCard();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (developerId) => {
    try {
      await connectionApi.saveDeveloper(developerId);
      setFeedback({ type: "save", message: "Developer saved to bookmarks! ⭐" });
      setTimeout(() => setFeedback(null), 2500);

      // Toggle local saved state
      setDevelopers((prev) =>
        prev.map((dev) => (dev.id === developerId ? { ...dev, isSaved: true } : dev))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const nextCard = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const currentDev = developers[currentIndex];

  // Keyboard navigation for deck swiping
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore key events when typing inside inputs or search boxes
      if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
        return;
      }
      if (!currentDev) return;

      if (e.key === "ArrowRight") {
        handleConnect(currentDev.id);
      } else if (e.key === "ArrowLeft") {
        handleSkip(currentDev.id);
      } else if (e.key === "s" || e.key === "S") {
        handleSave(currentDev.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentDev, handleConnect, handleSkip, handleSave]);

  const activeFilterCount =
    (filters.skills ? filters.skills.split(",").filter(Boolean).length : 0) +
    (filters.experienceLevel !== "ALL" ? 1 : 0) +
    (filters.isOpenToPairing !== "ALL" ? 1 : 0) +
    (filters.location ? 1 : 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-base-content tracking-tight">🔍 Developer Discovery</h1>
          <p className="text-xs text-base-content/60">Swipe or connect with potential co-builders & pair partners</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto items-center">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search by name, skill..."
              className="input input-bordered input-sm rounded-xl w-full sm:w-44 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm rounded-xl text-xs">
              Search
            </button>
          </form>

          {/* Filter Button with Active Badge */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className={`btn btn-sm rounded-xl gap-1.5 ${
              activeFilterCount > 0 ? "btn-secondary" : "btn-outline"
            }`}
          >
            ⚙️ Filters
            {activeFilterCount > 0 && (
              <span className="badge badge-sm badge-neutral font-bold">{activeFilterCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint Bar */}
      <div className="flex justify-center items-center gap-4 text-[11px] text-base-content/50 bg-base-200/40 py-1.5 px-4 rounded-xl border border-base-300/50">
        <span>Shortcuts:</span>
        <span className="font-mono bg-base-100 px-1.5 py-0.5 rounded border border-base-300">⬅️ Left: Skip</span>
        <span className="font-mono bg-base-100 px-1.5 py-0.5 rounded border border-base-300">S: Save ⭐</span>
        <span className="font-mono bg-base-100 px-1.5 py-0.5 rounded border border-base-300">➡️ Right: Connect ⚡</span>
      </div>

      {/* Active Filter Pills Bar */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 bg-base-200/50 p-2.5 rounded-2xl border border-base-300">
          <span className="text-xs font-bold text-base-content/60">Active Filters:</span>
          {filters.skills &&
            filters.skills.split(",").map((s) => (
              <span key={s} className="badge badge-primary badge-sm">
                Skill: {s}
              </span>
            ))}
          {filters.experienceLevel !== "ALL" && (
            <span className="badge badge-secondary badge-sm">
              Level: {filters.experienceLevel}
            </span>
          )}
          {filters.isOpenToPairing !== "ALL" && (
            <span className="badge badge-accent badge-sm">
              Pairing: {filters.isOpenToPairing === "true" ? "Open" : "Not Open"}
            </span>
          )}
          {filters.location && (
            <span className="badge badge-info badge-sm">
              Loc: {filters.location}
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="btn btn-xs btn-ghost text-error ml-auto text-xs"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Feedback Toast Banner */}
      {feedback && (
        <div className="alert alert-info text-xs font-bold rounded-2xl animate-fade-in shadow-md">
          <span>ℹ️ {feedback.message}</span>
        </div>
      )}

      {/* Discovery Card Stack Area */}
      <div className="flex justify-center min-h-[520px] items-center">
        {loading ? (
          <Loader text="Finding developers matching your stack..." />
        ) : currentDev ? (
          <DeveloperCard
            key={currentDev.id}
            developer={currentDev}
            onConnect={handleConnect}
            onSkip={handleSkip}
            onSave={handleSave}
            isSaved={currentDev.isSaved}
          />
        ) : (
          <div className="card w-full max-w-md bg-base-100 p-8 text-center rounded-3xl border border-base-300 shadow-xl space-y-4">
            <span className="text-5xl">✨</span>
            <h3 className="text-xl font-extrabold text-base-content">You've reached the end!</h3>
            <p className="text-xs text-base-content/60">
              No more developer profiles match your current discovery settings. Try broadening your filters!
            </p>
            <div className="flex justify-center gap-3 pt-2">
              {activeFilterCount > 0 && (
                <button onClick={handleResetFilters} className="btn btn-sm btn-outline btn-neutral rounded-xl">
                  Reset Filters 🧹
                </button>
              )}
              <button onClick={() => fetchFeed(filters)} className="btn btn-sm btn-primary rounded-xl">
                Refresh Feed 🔄
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Modal Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {/* Mutual Connection Match Modal */}
      <MatchModal
        isOpen={isMatchModalOpen}
        onClose={() => setIsMatchModalOpen(false)}
        matchedUser={matchedUser}
        currentUser={currentUser}
      />
    </div>
  );
};

export default Discover;
