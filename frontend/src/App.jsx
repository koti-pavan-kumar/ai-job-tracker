import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import JobForm from './JobForm';
import AdminPanel from './AdminPanel'; 
import { useAuth } from './AuthContext';

// Dynamically auto-detect your Render backend environment based on where your browser is hosted
const currentHost = window.location.hostname;
const API_BASE = "https://ai-job-tracker-byeq.onrender.com";
  // ? `https://${currentHost.replace("ai-job-tracker-lljg", "ai-job-tracker-backend-8urc")}` 
  // : "https://ai-job-tracker-backend-8urc.onrender.com";

export default function App() {
  const { token, setToken, username, setUsername, logout } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [activeWorkspaceJob, setActiveWorkspaceJob] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [workspaceOutput, setWorkspaceOutput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [assetMode, setAssetMode] = useState("resume");
  const [authMode, setAuthMode] = useState("login"); // "login" or "register"
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard"); 

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
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setJobs(data);
        if (activeWorkspaceJob) {
          const freshJob = data.find(j => j.id === activeWorkspaceJob.id);
          if (freshJob) setActiveWorkspaceJob(freshJob);
        }
      }
    } catch (err) {
      console.error("Error connecting to database nodes", err);
    }
  };

  useEffect(() => { 
    if (token) { fetchJobs(); } 
  }, [token]);

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
      if (res.ok) { fetchJobs(); }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadAndTailor = async (type) => {
    const jobId = activeWorkspaceJob?.id;
    if (!jobId || jobId === "undefined") return alert("Please choose a valid active pipeline tracker card first.");
    if (!selectedFile) return alert("Please upload a source resume file profile (.pdf or .txt) to extract.");

    setGenerating(true);
    setAssetMode(type);

    const formData = new FormData();
    formData.append("job_id", jobId);
    formData.append("asset_type", type);
    formData.append("file", selectedFile);

    try {
      const res = await fetch(`${API_BASE}/jobs/upload-resume-tailor`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
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
    } catch {
      setWorkspaceOutput("Network timeout encountered during secure stream rendering.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadAsset = async (format) => {
    const jobId = activeWorkspaceJob?.id;
    if (!jobId || jobId === "undefined") return;
    
    const backendAssetType = (assetMode === "coverletter" || assetMode === "cover_letter") 
      ? "cover_letter" 
      : "resume";
    
    try {
      const endpoint = `${API_BASE}/jobs/${jobId}/download-${format}?asset_type=${backendAssetType}`;
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
      
      const displayType = (assetMode === "coverletter" || assetMode === "cover_letter") ? "CoverLetter" : "Resume";
      link.setAttribute('download', `${activeWorkspaceJob.company_name || "Tailored"}_${displayType}.${format}`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert("Error building document data downlinks.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setToken("");
    setJobs([]);
    setActiveWorkspaceJob(null);
    setWorkspaceOutput("");
    setSelectedFile(null);
    setActiveTab("dashboard");
  };

  if (!token) {
    const handleAuthSubmit = async (e) => {
      e.preventDefault();
      
      if (authMode === "login") {
        const loginData = new URLSearchParams();
        loginData.append("username", username);
        loginData.append("password", password);

        // Try standard route first, fallback to /api/token if it returns Not Found
        try {
          let url = `${API_BASE}/token`;
          let res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: loginData
          });

          if (res.status === 404) {
            url = `${API_BASE}/api/token`;
            res = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: loginData
            });
          }

          const data = await res.json();
          if (res.ok && data.access_token) {
            setToken(data.access_token);
  // Keep the active logging username inside your context provider state 
  // instead of blanking it out immediately
            setUsername(username); 
            setPassword("");
          } else { 
            alert(data.detail || "Authentication entry sequence failed.");
          }
        } catch {
          alert("Network identity verification connection timed out.");
        }
      } else if (authMode === "register") {
        try {
          let url = `${API_BASE}/register`;
          let res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              username: username, 
              password: password,
              name: name,
              email: email,
              phone: ""
            })
          });

          // Fallback check: If root route is 404, try the /api/register prefix
          if (res.status === 404) {
            url = `${API_BASE}/api/register`;
            res = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                username: username, 
                password: password,
                phone: ""
              })
            });
          }

          const data = await res.json();
          if (res.ok) {
            alert("Account provisioned successfully! You can now log in.");
            setAuthMode("login"); 
            setPassword("");
          } else {
            const errorMsg = data.detail ? (typeof data.detail === 'object' ? JSON.stringify(data.detail) : data.detail) : "Registration block rejected.";
            alert(errorMsg);
          }
        } catch (err) {
          alert("Registration connection failed.");
        }
      }
    };

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto shadow-md">
              <span className="font-black text-white text-xl">⚡</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800">Welcome to TalentFlow Studio</h2>
            <p className="text-xs text-slate-500 font-medium capitalize">{authMode} Mode Workspace Control</p>
          </div>

          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200/50">
            <button type="button" onClick={() => setAuthMode("login")} className={`py-2 text-[11px] font-bold rounded-lg transition ${authMode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Sign In</button>
            <button type="button" onClick={() => setAuthMode("register")} className={`py-2 text-[11px] font-bold rounded-lg transition ${authMode === 'register' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Register</button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === "register" && (
              <>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:bg-white focus:outline-none" placeholder="John Doe" />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:bg-white focus:outline-none" placeholder="john@example.com" />
                </div>
              </>
            )}

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:bg-white focus:outline-none" placeholder="username" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:bg-white focus:outline-none" placeholder="••••••••" />
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl text-xs font-bold transition shadow-md text-white uppercase tracking-wider">
              {authMode === "login" ? "Authorize Workspace" : "Confirm Registration"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      <header className="border-b border-slate-200 bg-white px-8 py-4 sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-md">
            <span className="font-black text-white text-base">⚡</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">TalentFlow Studio</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setActiveTab("dashboard")} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${activeTab === "dashboard" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}>Dashboard 📊</button>
          <button onClick={() => setActiveTab("admin")} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${activeTab === "admin" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}>Admin Panel ⚙️</button>
        </div>

        <button onClick={handleLogout} className="text-xs font-semibold text-slate-500 hover:text-red-600 border px-3 py-1.5 rounded-lg bg-white transition shadow-sm">Exit Studio</button>
      </header>
      
      <main className="max-w-7xl mx-auto p-8 space-y-12">
        {activeTab === "admin" ? (
          <AdminPanel token={token} API_BASE={API_BASE} />
        ) : (
          <>
            <JobForm onJobAdded={fetchJobs} />
            <Dashboard 
              jobs={jobs} 
              onUpdateStatus={handleUpdateStatus} 
              onSelectWorkspace={(job) => {
                setActiveWorkspaceJob(job);
                setWorkspaceOutput(job.tailored_resume || job.tailored_cover_letter || "Awaiting source profile...");
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
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                  <h3 className="text-lg font-bold text-slate-800">
                    Tailoring Assets for <span className="text-indigo-600">{activeWorkspaceJob.job_title}</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleDownloadAsset("pdf")} className="text-xs bg-slate-800 text-white px-3.5 py-2 rounded-xl font-bold">Download PDF 📄</button>
                    <button onClick={() => handleDownloadAsset("docx")} className="text-xs bg-slate-100 text-slate-700 px-3.5 py-2 rounded-xl font-bold border">Download DOCX 📝</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="bg-slate-50 border rounded-xl p-4 space-y-4">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">1. Select Asset</label>
                      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200 rounded-lg">
                        <button onClick={() => setAssetMode("resume")} className={`py-1.5 text-xs font-bold rounded-md transition ${assetMode === "resume" ? "bg-white text-indigo-600" : "text-slate-500"}`}>Resume</button>
                        <button onClick={() => setAssetMode("coverletter")} className={`py-1.5 text-xs font-bold rounded-md transition ${assetMode === "coverletter" ? "bg-white text-indigo-600" : "text-slate-500"}`}>Cover Letter</button>
                      </div>
                    </div>

                    <div className="bg-slate-50 border rounded-xl p-4 space-y-4">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">2. Upload Document</label>
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-white hover:bg-slate-50 text-center px-4">
                        <span className="text-2xl mb-1">📁</span>
                        <p className="text-xs font-bold text-slate-600 line-clamp-1">{selectedFile ? selectedFile.name : "Choose file"}</p>
                        <input type="file" accept=".pdf,.txt" className="hidden" onChange={(e) => setSelectedFile(e.target.files[0])} />
                      </label>
                    </div>

                    <button onClick={() => handleUploadAndTailor(assetMode)} disabled={generating} className="w-full bg-indigo-600 py-3 rounded-xl text-xs font-bold text-white uppercase tracking-wider shadow-md">
                      {generating ? "AI Generating..." : `Generate Tailored ${assetMode === "resume" ? "Resume" : "Cover Letter"} ✨`}
                    </button>
                  </div>

                  <div className="lg:col-span-2 flex flex-col">
                    <textarea value={workspaceOutput} onChange={(e) => setWorkspaceOutput(e.target.value)} className="w-full flex-1 min-h-[320px] bg-slate-900 text-slate-100 font-mono text-xs p-5 rounded-xl border resize-none leading-relaxed" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <div className="fixed bottom-5 right-5 z-50 space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className={`pointer-events-auto p-4 rounded-xl shadow-lg border text-xs font-semibold flex items-center justify-between ${toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
            <div className="flex items-center gap-2"><span>{toast.type === 'error' ? '⚠️' : '✅'}</span><span>{toast.message}</span></div>
            <button onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))} className="ml-4 text-slate-400 font-bold">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}