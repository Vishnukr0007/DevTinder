import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserProfileThunk } from "../../store/authSlice.js";
import Button from "../../components/Button/Button.jsx";

export const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [pairingStatus, setPairingStatus] = useState(user?.isOpenToPairing ?? true);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dispatch(updateUserProfileThunk({ isOpenToPairing: pairingStatus }));
      setFeedback("Settings saved successfully!");
      setTimeout(() => setFeedback(""), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-base-content">⚙️ Account Settings</h1>
        <p className="text-xs text-base-content/60">Configure your pairing availability & preferences</p>
      </div>

      {feedback && (
        <div className="alert alert-success text-xs font-bold rounded-xl">
          <span>✅ {feedback}</span>
        </div>
      )}

      <div className="card bg-base-100 border border-base-300 shadow-xl rounded-3xl p-6 sm:p-8 space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-base-200/50 rounded-2xl border border-base-300">
            <div>
              <h3 className="font-bold text-sm text-base-content">Open to Pair Programming</h3>
              <p className="text-xs text-base-content/60">Allows other developers to discover your profile for pair programming</p>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={pairingStatus}
              onChange={(e) => setPairingStatus(e.target.checked)}
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text font-bold">Email Notifications</span></label>
            <select className="select select-bordered rounded-xl w-full text-sm">
              <option value="ALL">All Match & Connection Requests</option>
              <option value="MATCHES_ONLY">Only Mutual Matches</option>
              <option value="NONE">Disabled</option>
            </select>
          </div>

          <Button type="submit" className="w-full btn-primary rounded-xl">
            Save Preferences 💾
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
