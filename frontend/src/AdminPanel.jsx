import React, { useState, useEffect } from 'react';

export default function AdminPanel({ token, API_BASE }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to fetch users.");
      }
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you absolutely sure you want to permanently delete user "${username}" and all their job applications?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.detail || "Failed to delete user.");
        return;
      }

      alert("User removed successfully.");
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      alert("An error occurred while deleting the user.");
    }
  };

  if (loading) return <div className="p-6 text-gray-600">Loading administrative tools...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-lg shadow mt-6">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Admin Management Panel</h2>
        <button 
          onClick={fetchUsers} 
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition"
        >
          Refresh Data
        </button>
      </div>

      <div className="overflow-x-auto">
  <table className="w-full text-left border-collapse">
    <thead>
      <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        <th className="py-3 px-4">User Details</th>
        <th className="py-3 px-4">Username</th>
        <th className="py-3 px-4">Email Address</th>
        <th className="py-3 px-4">Role Status</th>
        <th className="py-3 px-4 text-right">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-sm">
      {users.map((user) => (
        <tr key={user.id} className="hover:bg-slate-50/80 transition">
          <td className="py-3 px-4 font-semibold text-slate-800">{user.name || "N/A"}</td>
          <td className="py-3 px-4 text-slate-600">@{user.username}</td>
          <td className="py-3 px-4 text-slate-500 font-mono text-xs">{user.email || "No Email Provided"}</td>
          <td className="py-3 px-4">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${user.is_admin ? "bg-purple-50 text-purple-700 border border-purple-200" : "bg-slate-100 text-slate-600"}`}>
              {user.is_admin ? "Workspace Master" : "Standard Operator"}
            </span>
          </td>
          <td className="py-3 px-4 text-right">
            <button 
              onClick={() => handleDeleteUser(user.id)} 
              disabled={user.is_admin}
              className="text-xs font-bold text-rose-500 hover:text-rose-700 disabled:opacity-30 disabled:pointer-events-none transition"
            >
              Purge User 🗑️
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
    </div>
  );
}