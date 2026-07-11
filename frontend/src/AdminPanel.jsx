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
            <tr className="bg-gray-50 text-gray-600 uppercase text-sm border-b">
              <th className="p-3">ID</th>
              <th className="p-3">Username</th>
              <th className="p-3">Phone Number</th>
              <th className="p-3">Role</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-gray-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="p-3 font-mono text-sm text-gray-500">{user.id}</td>
                <td className="p-3 font-semibold">{user.username}</td>
                <td className="p-3 text-gray-600">{user.phone || "N/A"}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${user.is_admin ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                    {user.is_admin ? "Administrator" : "Standard User"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleDeleteUser(user.id, user.username)}
                    disabled={user.is_admin}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                      user.is_admin 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-red-50 hover:bg-red-100 text-red-600'
                    }`}
                  >
                    Delete Account
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