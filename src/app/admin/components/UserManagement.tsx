'use client';

import { useEffect, useState } from 'react';

import { fetchWithAuth } from '@/lib/fetchWithAuth';

type AppUser = {
  _id: string;
  email: string;
  role: string;
  name?: string;
  storeName?: string;
  contactNumber?: string;
  storeAddress?: string;
};

function displayValue(value?: string) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : '-';
}

export default function UserManagement() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [newStoreName, setNewStoreName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newStoreAddress, setNewStoreAddress] = useState('');
  const [newPassword, setNewPasswordInput] = useState('');
  const [newRole, setNewRoleInput] = useState('customer');
  const [creating, setCreating] = useState(false);

  async function loadUsers() {
    try {
      const response = await fetchWithAuth('/api/admin/users', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (err: any) {
      console.error('Failed to load users', err);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const updateUser = async (userId: string, newRole?: string, newPassword?: string) => {
    setError('');
    setMessage('');
    try {
      const payload: any = {};
      if (newRole) payload.role = newRole;
      if (newPassword) payload.newPassword = newPassword;

      const response = await fetchWithAuth(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update user');
      }

      if (newPassword) {
        setMessage('Password updated successfully');
        setPasswords(prev => ({ ...prev, [userId]: '' })); // Clear input
      } else if (newRole) {
        setMessage(`User role updated to ${newRole} successfully`);
      }

      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setError('');
    setMessage('');
    try {
      const response = await fetchWithAuth(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete user');
      }
      setMessage('User deleted successfully');
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setMessage('');

    try {
      const response = await fetchWithAuth('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail,
          name: newOwnerName,
          storeName: newStoreName,
          contactNumber: newNumber,
          storeAddress: newStoreAddress,
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user');
      }

      setMessage('User created successfully');
      if (data.user) {
        setUsers((current) => [data.user, ...current.filter((user) => user._id !== data.user._id)]);
      }
      setNewEmail('');
      setNewStoreName('');
      setNewOwnerName('');
      setNewNumber('');
      setNewStoreAddress('');
      setNewPasswordInput('');
      setNewRoleInput('customer');
      setIsCreateModalOpen(false);
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 dark:text-zinc-100">
      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <h2 className="text-xl font-semibold">User Management</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage store profiles, roles, and passwords for all registered users.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Add User
        </button>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold">Create User</h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Store name, owner name, number, email, and address are required.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Close
              </button>
            </div>

            <form onSubmit={createUser} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium" htmlFor="newStoreName">
                  Store Name
                </label>
                <input
                  id="newStoreName"
                  type="text"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  placeholder="Store name"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium" htmlFor="newOwnerName">
                  Owner Name
                </label>
                <input
                  id="newOwnerName"
                  type="text"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  placeholder="Owner name"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium" htmlFor="newNumber">
                  Number
                </label>
                <input
                  id="newNumber"
                  type="tel"
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  placeholder="Contact number"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium" htmlFor="newEmail">
                  Email
                </label>
                <input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  placeholder="user@example.com"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium" htmlFor="newStoreAddress">
                  Store Address
                </label>
                <textarea
                  id="newStoreAddress"
                  value={newStoreAddress}
                  onChange={(e) => setNewStoreAddress(e.target.value)}
                  className="min-h-24 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  placeholder="Store address"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium" htmlFor="newPassword">
                  Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  placeholder="Min 6 characters"
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium" htmlFor="newRole">
                  Role
                </label>
                <select
                  id="newRole"
                  value={newRole}
                  onChange={(e) => setNewRoleInput(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>

              <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                >
                  {creating ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        <div className="rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">User Management</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Manage roles for all registered users. Only accessible by superadmins.
              </p>
            </div>
            <button
              type="button"
              onClick={loadUsers}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Refresh
            </button>
          </div>

          <div className="hidden lg:block overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-md">Store Name</th>
                  <th className="px-4 py-3 font-medium">Owner Name</th>
                  <th className="px-4 py-3 font-medium">Number</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Store Address</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Change Role</th>
                  <th className="px-4 py-3 font-medium rounded-tr-md">Change Password</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 align-top">
                    <td className="px-4 py-3 font-medium">{displayValue(u.storeName)}</td>
                    <td className="px-4 py-3">{displayValue(u.name)}</td>
                    <td className="px-4 py-3">{displayValue(u.contactNumber)}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3 max-w-xs whitespace-normal wrap-break-word">{displayValue(u.storeAddress)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${u.role === 'superadmin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                        u.role === 'admin' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' :
                          'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                        }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.role !== 'superadmin' ? (
                        <select
                          value={u.role}
                          onChange={(e) => updateUser(u._id, e.target.value)}
                          className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className="text-xs text-zinc-500">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.role !== 'superadmin' ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="password"
                            placeholder="New password"
                            value={passwords[u._id] || ''}
                            onChange={(e) => setPasswords({ ...passwords, [u._id]: e.target.value })}
                            className="w-32 rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                          />
                          <button
                            onClick={() => updateUser(u._id, undefined, passwords[u._id])}
                            disabled={!passwords[u._id] || passwords[u._id].length < 6}
                            className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => deleteUser(u._id)}
                            className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-500">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-zinc-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-4">
            {users.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                No users found.
              </div>
            ) : (
              users.map((u) => (
                <div key={`mob-${u._id}`} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/50 flex flex-col gap-4">
                  <div className="flex justify-between items-start gap-2">
                    <div className="overflow-hidden">
                      <h3 className="font-semibold text-base truncate">{displayValue(u.storeName) === '-' ? 'No Store' : displayValue(u.storeName)}</h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{displayValue(u.name) === '-' ? 'No Owner' : displayValue(u.name)}</p>
                    </div>
                    <span className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${u.role === 'superadmin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                        u.role === 'admin' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' :
                          'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                      }`}>
                      {u.role}
                    </span>
                  </div>

                  <div className="grid gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                    <p><span className="font-medium">Number:</span> {displayValue(u.contactNumber)}</p>
                    <p><span className="font-medium">Email:</span> {u.email}</p>
                    <p className="wrap-break-word"><span className="font-medium">Address:</span> {displayValue(u.storeAddress)}</p>
                  </div>

                  {u.role !== 'superadmin' && (
                    <div className="flex flex-col gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                      <div>
                        <label className="block text-xs font-medium mb-1.5 text-zinc-500 dark:text-zinc-400">Change Role</label>
                        <select
                          value={u.role}
                          onChange={(e) => updateUser(u._id, e.target.value)}
                          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1.5 text-zinc-500 dark:text-zinc-400">Change Password</label>
                        <div className="flex gap-2">
                          <input
                            type="password"
                            placeholder="New password"
                            value={passwords[u._id] || ''}
                            onChange={(e) => setPasswords({ ...passwords, [u._id]: e.target.value })}
                            className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                          />
                          <button
                            onClick={() => updateUser(u._id, undefined, passwords[u._id])}
                            disabled={!passwords[u._id] || passwords[u._id].length < 6}
                            className="shrink-0 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                          >
                            Save
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteUser(u._id)}
                        className="w-full mt-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                      >
                        Delete User
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
  );
}
