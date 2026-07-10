import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const TRACKING_COLUMNS = ["Applied", "Interviewing", "Offered", "Rejected"];

export default function Dashboard({ jobs = [], onUpdateStatus, onSelectWorkspace, showToast }) {
  const { token, apiBase } = useAuth();
  const [localJobs, setLocalJobs] = useState([]);

  useEffect(() => {
    setLocalJobs(Array.isArray(jobs) ? jobs : []);
  }, [jobs]);

  const columnBadges = {
    Applied: "bg-blue-50 text-blue-700 border-blue-200",
    Interviewing: "bg-amber-50 text-amber-700 border-amber-200",
    Offered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Rejected: "bg-rose-50 text-rose-700 border-rose-200"
  };

  const handleStatusChange = async (jobId, newStatus) => {
    if (!newStatus) return;

    const backupSnapshot = [...localJobs];
    const targetJob = localJobs.find(j => j.id === jobId);
    const originalStatus = targetJob ? targetJob.status : null;

    if (targetJob) {
      targetJob.status = newStatus;
      if (onUpdateStatus) onUpdateStatus();
    }

    try {
      const res = await fetch(`${apiBase}/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        if (onUpdateStatus) onUpdateStatus(); 
        // Trigger Toast instead of Alert!
        if (showToast) showToast(`Moved application to "${newStatus}"`, "success");
      } else {
        if (showToast) showToast("Failed to save changes to server", "error");
        setLocalJobs(backupSnapshot);
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast("Network error encountered", "error");
      setLocalJobs(backupSnapshot);
    }
  };

  const handleDeleteClick = async (job) => {
    if (!job) return;
    if (window.confirm(`Are you sure you want to permanently delete "${job.job_title}"?`)) {
      try {
        const res = await fetch(`${apiBase}/jobs/${job.id}`, {
          method: 'DELETE',
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          if (onUpdateStatus) onUpdateStatus();
          // Trigger Toast instead of Alert!
          if (showToast) showToast(`Successfully deleted "${job.job_title}"`, "success");
        } else {
          if (showToast) showToast("Failed to delete application", "error");
        }
      } catch (error) {
        console.error(error);
        if (showToast) showToast("Network execution error", "error");
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
      {TRACKING_COLUMNS.map((colName) => {
        const columnJobs = localJobs.filter(j => j && j.status === colName);

        return (
          <div key={colName} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${columnBadges[colName]}`}>
                  {colName}
                </span>
                <span className="text-xs text-slate-400 font-bold">{columnJobs.length}</span>
              </div>
            </div>

            <div className="space-y-3 flex-1">
              {columnJobs.map((job) => {
                if (!job || !job.id) return null;

                return (
                  <div key={job.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-sm transition relative group">
                    <div className="pr-2 space-y-0.5">
                      <h4 className="text-sm font-bold text-slate-800 tracking-tight truncate">{job.job_title}</h4>
                      <p className="text-xs font-semibold text-slate-500 truncate">{job.company_name}</p>
                    </div>

                    <div className="mt-3">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Move Tracking Pipeline</label>
                      <select
                        value={job.status}
                        onChange={(e) => handleStatusChange(job.id, e.target.value)}
                        className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-2.5 py-1.5 transition outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        {TRACKING_COLUMNS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <button 
                        onClick={() => onSelectWorkspace && onSelectWorkspace(job)}
                        className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold px-2.5 py-1 rounded-md transition shadow-2xs"
                      >
                        Workspace 🛠️
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(job)}
                        className="opacity-0 group-hover:opacity-100 text-xs text-rose-500 hover:text-rose-700 p-1 transition rounded-md hover:bg-rose-50"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}

              {columnJobs.length === 0 && (
                <div className="text-center py-8 text-slate-300 text-xs font-medium border-2 border-dashed border-slate-200/60 rounded-xl">
                  Empty pipeline section
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}