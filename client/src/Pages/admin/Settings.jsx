import React, { useState } from "react";
import Button from "../../components/Button/Button.jsx";

export const AdminSettings = () => {
  const [maintenance, setMaintenance] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [feedback, setFeedback] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    setFeedback("Platform settings saved successfully!");
    setTimeout(() => setFeedback(""), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-base-content">⚙️ Platform Global Settings</h1>
        <p className="text-xs text-base-content/60">Configure system-wide toggles and limits</p>
      </div>

      {feedback && (
        <div className="alert alert-success text-xs font-bold rounded-xl">
          <span>✅ {feedback}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-base-200/50 rounded-2xl border border-base-300">
          <div>
            <h3 className="font-bold text-sm text-base-content">Maintenance Mode</h3>
            <p className="text-xs text-base-content/60">Temporarily block non-admin users from platform access</p>
          </div>
          <input
            type="checkbox"
            className="toggle toggle-error"
            checked={maintenance}
            onChange={(e) => setMaintenance(e.target.checked)}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-base-200/50 rounded-2xl border border-base-300">
          <div>
            <h3 className="font-bold text-sm text-base-content">Allow New Registrations</h3>
            <p className="text-xs text-base-content/60">Enable or disable new developer signup</p>
          </div>
          <input
            type="checkbox"
            className="toggle toggle-success"
            checked={allowRegistration}
            onChange={(e) => setAllowRegistration(e.target.checked)}
          />
        </div>

        <Button type="submit" className="w-full btn-primary rounded-xl">
          Save System Configuration 💾
        </Button>
      </form>
    </div>
  );
};

export default AdminSettings;
