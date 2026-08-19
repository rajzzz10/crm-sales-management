import { useState } from "react";

import { useGetUsersQuery, useCreateUserMutation } from "../store/api";

const Users = () => {
  const { data, isLoading, isError } = useGetUsersQuery();

  const [createUser, { isLoading: creating }] = useCreateUserMutation();

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "executive",
  });

  const users = data?.users || [];

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createUser(form).unwrap();

      setForm({
        name: "",
        email: "",
        password: "",
        role: "executive",
      });

      setShowForm(false);
    } catch (error) {
      alert(error?.data?.message || "Failed to create user");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>

          <p className="text-sm text-slate-500">
            Manage CRM employees and roles.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
        >
          Add User
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center">Loading users...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-600">
            Failed to load users.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="px-5 py-3">Name</th>

                  <th className="px-5 py-3">Email</th>

                  <th className="px-5 py-3">Role</th>

                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b last:border-0">
                    <td className="px-5 py-4 font-medium">{user.name}</td>

                    <td className="px-5 py-4">{user.email}</td>

                    <td className="px-5 py-4 capitalize">{user.role}</td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs text-green-700">
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Create User</h2>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <input
                required
                placeholder="Full name"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                className="w-full rounded-lg border px-3 py-2.5"
              />

              <input
                required
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                className="w-full rounded-lg border px-3 py-2.5"
              />

              <input
                required
                type="password"
                minLength={6}
                placeholder="Password"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                className="w-full rounded-lg border px-3 py-2.5"
              />

              <select
                value={form.role}
                onChange={(e) =>
                  setForm({
                    ...form,
                    role: e.target.value,
                  })
                }
                className="w-full rounded-lg border px-3 py-2.5"
              >
                <option value="executive">Sales Executive</option>

                <option value="manager">Sales Manager</option>

                <option value="admin">Admin</option>
              </select>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-lg border py-2.5"
                >
                  Cancel
                </button>

                <button
                  disabled={creating}
                  className="flex-1 rounded-lg bg-slate-900 py-2.5 text-white disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
