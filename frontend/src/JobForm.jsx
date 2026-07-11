import React, { useState } from 'react';
import { useAuth } from './AuthContext';

export default function JobForm({ onJobAdded }) {
  const { token, apiBase } = useAuth();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(null);

  const handleFetch = async () => {
    if (!url) return;
    setLoading(true);
    setFormData(null);
    try {
      const res = await fetch(`${apiBase}/jobs/analyze-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ url: url })
      });
      if (res.ok) {
        const data = await res.json();
        setFormData({ ...data, status: "Applied" });
      } else {
        alert("Failed to analyze the job link. Make sure the backend is fully awake.");
      }
    } catch (err) {
      console.error("Fetch error: ", err);
      alert("Network error: Could not connect to the AI analyzer service.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData) return;
    try {
      const res = await fetch(`${apiBase}/jobs`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setUrl("");
        setFormData(null);
        if (onJobAdded) onJobAdded();
      } else {
        alert("Failed to save the job record to your profile.");
      }
    } catch (err) {
      console.error("Save error: ", err);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide">Ingest Application Platform Target</h3>
      <div className="flex flex-col sm:flex-row gap-3">
        <input 
          type="text" 
          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition" 
          placeholder="Paste structured job listing page destination link (LinkedIn / Unstop)..." 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button 
          onClick={handleFetch} 
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold px-5 py-2 rounded-lg text-sm transition shrink-0 shadow-sm"
        >
          {loading ? "Analyzing..." : "Fetch & Parse"}
        </button>
      </div>

      {formData && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4 shadow-inner">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Company Entity Name</label>
              <input 
                type="text" 
                className="w-full bg-white border border-slate-200 rounded p-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                value={formData.company_name || ""}
                onChange={e => setFormData({...formData, company_name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Job Opening Designation Title</label>
              <input 
                type="text" 
                className="w-full bg-white border border-slate-200 rounded p-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                value={formData.job_title || ""}
                onChange={e => setFormData({...formData, job_title: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">AI Discovered Core Skill Tokens</label>
            <input 
              type="text" 
              className="w-full bg-white border border-slate-200 rounded p-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
              value={formData.parsed_skills || ""}
              onChange={e => setFormData({...formData, parsed_skills: e.target.value})}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setFormData(null)} className="text-xs px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg hover:bg-slate-50 transition font-semibold shadow-sm">
              Cancel Entry
            </button>
            <button onClick={handleSave} className="text-xs px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition shadow-sm">
              Commit Pipeline Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
}