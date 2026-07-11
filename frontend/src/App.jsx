import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import JobForm from './JobForm';
import { useAuth } from './AuthContext';

const API_BASE = "https://ai-job-tracker-backend-8urc.onrender.com";

export default function App() {
  const { token, setToken, username, setUsername, logout, apiBase } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [activeWorkspaceJob, setActiveWorkspaceJob] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [workspaceOutput, setWorkspaceOutput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [assetMode, setAssetMode] = useState("resume");
  const [authMode, setAuthMode] = useState("login"); 
  const [password, setPassword] = useState("");

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_BASE}/jobs`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setJobs(data);
        if (activeWorkspaceJob) {
          const freshJob = data.find(j => j.id === activeWorkspaceJob.id);
          if (freshJob) setActiveWorkspaceJob(freshJob);
        }
      } else {
        console.error("Failed to fetch jobs:", data.detail);
      }
    } catch (err) {
      console.error("Error connecting to database nodes", err);
    }
  };

  useEffect(() => { 
    if (token) { 
      fetchJobs(); 
    } 
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const loginData = new URLSearchParams();
    loginData.append("username", username);
    loginData.append("password", password);

    try {
      const res = await fetch(`${API_BASE}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: loginData
      });
      const data = await res.json();
      if (res.ok && data.access_token) {
        localStorage.setItem("authToken", data.access_token);
        setToken(data.access_token);
      } else {
        alert(data.detail || "Authentication entry sequence failed.");
      }
    } catch (err) {
      alert("Network identity verification connection timed out.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setToken("");
    setJobs([]);
    setActiveWorkspaceJob(null);
    setWorkspaceOutput("");
    setSelectedFile(null);
  };

  const handleUpdateStatus = async (id, nextStatus) => {
    if (!id || id === "undefined") return;
    try {
      const res = await fetch(`${API_BASE}/jobs/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        fetchJobs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadAndTailor = async (type) => {
    const jobId = activeWorkspaceJob?.id;
    if (!jobId || jobId === "undefined") {
      alert("Please choose a valid active pipeline tracker card first.");
      return;
    }
    if (!selectedFile) {
      alert("Please upload a source resume file profile (.pdf or .txt) to extract.");
      return;
    }

    setGenerating(true);
    setAssetMode(type);

    const formData = new FormData();
    formData.append("job_id", jobId);
    formData.append("asset_type", type);
    formData.append("file", selectedFile);

    try {
      // RESTORED: Changed path back to /jobs/upload-resume-tailor to handle the file stream correctly
      const res = await fetch(`${API_BASE}/jobs/upload-resume-tailor`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });
      const resData = await res.json();
      if (res.ok) {
        setWorkspaceOutput(resData.data || resData.tailored_text || "Generation complete.");
        fetchJobs();
        showToast("AI Customization completed successfully!", "success");
      } else {
        setWorkspaceOutput(`Optimization Block Error: ${resData.detail || "Verification failed."}`);
        showToast("AI Engine could not process the request context.", "error");
      }
    } catch (err) {
      setWorkspaceOutput("Network timeout encountered during secure stream rendering.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadAsset = async (format) => {
    const jobId = activeWorkspaceJob?.id;
    if (!jobId || jobId === "undefined") return;
    
    try {
      # FIXED: Appended ?asset_type=${assetMode} to pass the active selection ('resume' or 'coverletter') to the backend
      const endpoint = `${API_BASE}/jobs/${jobId}/download-${format}?asset_type=${assetMode}`;
      const res = await fetch(endpoint, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) {
        const errData = await res.json();
        alert(errData.detail || "Failed to trigger compilation stream rendering.");
        return;
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      # OPTIONAL CLEANUP: Adjust visual filename dynamically based on assetMode
      const displayType = assetMode === "resume" ? "Resume" : "CoverLetter";
      link.setAttribute('download', `${activeWorkspaceJob.company_name || "Tailored"}_${displayType}.${format}`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert("Error building document data downlinks.");
    }
  };

  if (!token) {
    const handleAuthSubmit = async (e) => {
      e.preventDefault();
      
      if (authMode === "login") {
        const loginData = new URLSearchParams();
        loginData.append("username", username);
        loginData.append("password", password);

        try {
          const res = await fetch(`${API_BASE}/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: loginData
          });
          const data = await res.json();
          if (res.ok && data.access_token) {
            localStorage.setItem("authToken", data.access_token);
            setToken(data.access_token);
            setUsername("");
            setPassword("");
          } else { 
            alert(data.detail || "Authentication entry sequence failed.");
          }
        } catch (err) {
          alert("Network identity verification connection timed out.");
        }
      } else {
        try {
          const res = await fetch(`${API_BASE}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
          });
          const data = await res.json();
          if (res.ok) {
            alert("Account registered successfully! You can now sign in.");
            setAuthMode("login"); 
            setPassword("");      
          } else {
            alert(data.detail || "Registration processing block rejected.");
          }
        } catch (err) {
          alert("Network error encountered during account provisioning.");
        }
      }
    };

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans antialiased p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_70%)] pointer-events-none"></div>
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xl relative space-y-6">
          <div className="text-center space-y-2">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto shadow-md shadow-indigo-600/10">
              <span className="font-black text-white text-xl">⚡</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800">Welcome to TalentFlow Studio</h2>
            <p className="text-xs text-slate-500 font-medium">
              {authMode === "login" ? "Please verify credentials to manage assets" : "Create a new workspace profile entry"}
            </p>
          </div>

          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200/50">
            <button 
              type="button"
              onClick={() => { setAuthMode("login"); setUsername(""); setPassword(""); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 ${authMode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Sign In
            </button>
            <button 
              type="button"
              onClick={() => { setAuthMode("register"); setUsername(""); setPassword(""); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 ${authMode === 'register' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Username</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition" placeholder="admin" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition" placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl text-xs font-bold transition shadow-md text-white uppercase tracking-wider">
              {authMode === "login" ? "Authorize Workspace" : "Create Studio Account"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(199,210,254,0.35),rgba(255,255,255,0))] text-slate-800 font-sans antialiased selection:bg-indigo-500/10">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-xl px-8 py-4 sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-600/10">
            <span className="font-black text-white text-base tracking-tighter">⚡</span>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-700 to-violet-700 bg-clip-text text-transparent tracking-tight">
              TalentFlow Studio
            </h1>
            <p className="text-[11px] text-slate-400 font-bold tracking-wide uppercase">AI Workspace Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3.5 py-1 text-xs text-emerald-700 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Session Active
          </div>
          <button onClick={handleLogout} className="text-xs font-semibold text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 bg-white px-3 py-1.5 rounded-lg transition-all shadow-sm">
            Exit Studio
          </button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto p-8 space-y-12">
        <div className="relative group">
          <JobForm onJobAdded={fetchJobs} />
        </div>
        
        <Dashboard 
          jobs={jobs} 
          onUpdateStatus={handleUpdateStatus} 
          onSelectWorkspace={(job) => {
            setActiveWorkspaceJob(job);
            setWorkspaceOutput(job.tailored_resume || job.tailored_cover_letter || "Awaiting source profile document metrics to begin canvas rendering updates...");
          }}
          showToast={showToast} 
          onDeleteJob={(deletedJobId) => {
            setJobs(prevJobs => prevJobs.filter(item => item.id !== deletedJobId));
            if (activeWorkspaceJob && activeWorkspaceJob.id === deletedJobId) {
              setActiveWorkspaceJob(null);
              setWorkspaceOutput("");
              setSelectedFile(null);
            }
          }}
        />

        {activeWorkspaceJob && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-6 transition-all animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-0.5">Active Workspace Canvas</span>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                  Tailoring Assets for <span className="text-indigo-600">{activeWorkspaceJob.job_title}</span> at <span className="font-extrabold">{activeWorkspaceJob.company_name}</span>
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleDownloadAsset("pdf")}
                  className="text-xs bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  Download PDF 📄
                </button>
                <button 
                  onClick={() => handleDownloadAsset("docx")}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm border border-slate-200"
                >
                  Download DOCX 📝
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-4">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">1. Select Optimization Asset</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/50 rounded-lg">
                    <button 
                      onClick={() => setAssetMode("resume")}
                      className={`py-1.5 text-xs font-bold rounded-md transition ${assetMode === "resume" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      Tailored Resume
                    </button>
                    <button 
                      onClick={() => setAssetMode("coverletter")}
                      className={`py-1.5 text-xs font-bold rounded-md transition ${assetMode === "coverletter" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      Cover Letter
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-4">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">2. Upload Source Profile (.pdf/.txt)</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-white hover:bg-slate-50/50 hover:border-indigo-300 transition px-4 text-center">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <span className="text-2xl mb-1">📁</span>
                        <p className="text-xs font-bold text-slate-600 line-clamp-1">
                          {selectedFile ? selectedFile.name : "Click to source file"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">PDF or TXT text layouts</p>
                      </div>
                      <input 
                        type="file" 
                        accept=".pdf,.txt" 
                        className="hidden" 
                        onChange={(e) => setSelectedFile(e.target.files[0])} 
                      />
                    </label>
                  </div>
                </div>

                <button 
                  onClick={() => handleUploadAndTailor(assetMode)}
                  disabled={generating}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:from-indigo-400 disabled:to-slate-400 py-3 rounded-xl text-xs font-bold text-white transition shadow-md uppercase tracking-wider"
                >
                  {generating ? "AI Engine Generation Processing..." : `Generate Optimized ${assetMode === "resume" ? "Resume" : "Cover Letter"} ✨`}
                </button>
              </div>

              <div className="lg:col-span-2 flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Canvas Content Preview</label>
                <textarea 
                  value={workspaceOutput}
                  onChange={(e) => setWorkspaceOutput(e.target.value)}
                  className="w-full flex-1 min-h-[320px] bg-slate-900 text-slate-100 font-mono text-xs p-5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 shadow-inner leading-relaxed resize-none"
                  placeholder="Awaiting document parameters to initiate layout rendering..."
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="fixed bottom-5 right-5 z-50 space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border text-xs font-semibold flex items-center justify-between transition-all duration-300 ${
              toast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
              <span>{toast.message}</span>
            </div>
            <button 
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-4 text-slate-400 hover:text-slate-600 font-bold transition"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}