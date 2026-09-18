import React, { useState, useEffect } from "react";
import DeveloperCard from "../../components/DeveloperCard/DeveloperCard.jsx";
import Loader from "../../components/Loader/Loader.jsx";
import { connectionApi } from "../../services/connectionApi.js";

export const Discover = () => {
  const [developers, setDevelopers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState(null);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const data = await connectionApi.getDiscoveryFeed(1, 20);
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

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return fetchFeed();

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

  const handleConnect = async (developerId) => {
    try {
      const res = await connectionApi.connectDeveloper(developerId);
      if (res.isMatch) {
        setFeedback({ type: "match", message: res.message });
      } else {
        setFeedback({ type: "connect", message: res.message });
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
      nextCard();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (developerId) => {
    try {
      await connectionApi.saveDeveloper(developerId);
      setFeedback({ type: "save", message: "Developer bookmarked!" });
    } catch (err) {
      console.error(err);
    }
  };

  const nextCard = () => {
    setTimeout(() => setFeedback(null), 2500);
    setCurrentIndex((prev) => prev + 1);
  };

  const currentDev = developers[currentIndex];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header & Search Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-base-content tracking-tight">🔍 Developer Discovery</h1>
          <p className="text-xs text-base-content/60">Swipe or connect with potential co-builders & pair partners</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search skills, location..."
            className="input input-bordered input-sm rounded-xl w-full sm:w-48"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm rounded-xl">Search</button>
        </form>
      </div>

      {/* Feedback Toast Banner */}
      {feedback && (
        <div className={`alert ${feedback.type === "match" ? "alert-success" : "alert-info"} text-xs font-bold rounded-2xl animate-fade-in`}>
          <span>{feedback.type === "match" ? "🎉 " : "ℹ️ "}{feedback.message}</span>
        </div>
      )}

      {/* Discovery Card Stack Area */}
      <div className="flex justify-center min-h-[520px] items-center">
        {loading ? (
          <Loader text="Finding developers for you..." />
        ) : currentDev ? (
          <DeveloperCard
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
            <p className="text-xs text-base-content/60">No more new developer profiles available right now. Check back soon or reset filters.</p>
            <button onClick={fetchFeed} className="btn btn-outline btn-primary rounded-xl">
              Refresh Feed 🔄
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
