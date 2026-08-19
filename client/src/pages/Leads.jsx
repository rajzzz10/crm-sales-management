import { useState } from "react";
import { Plus, Search, Eye, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  useGetLeadsQuery,
  useCreateLeadMutation,
  useAssignLeadMutation,
  useGetUsersQuery,
  useGetMeQuery,
} from "../store/api";

const Leads = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    source: "",
    page: 1,
    limit: 10,
  });

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "website",
    priority: "medium",
  });

  const { data, isLoading, isError } = useGetLeadsQuery(filters);
  const { data: usersData } = useGetUsersQuery();
  const { data: meData } = useGetMeQuery();


  const [createLead, { isLoading: creating }] = useCreateLeadMutation();
  const [assignLead, { isLoading: assigning }] = useAssignLeadMutation();


  const leads = data?.leads || [];
  const users = usersData?.users || [];
  const pagination = data?.pagination;
  const currentUser = meData?.user;

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      await createLead(form).unwrap();

      setForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        source: "website",
        priority: "medium",
      });

      setShowForm(false);
    } catch (error) {
      alert(error?.data?.message || "Failed to create lead");
    }
  };

  const handleAssign = async (leadId, assignedTo) => {
    if (!assignedTo) return;

    try {
      await assignLead({
        id: leadId,
        assignedTo,
      }).unwrap();
    } catch (error) {
      alert(error?.data?.message || "Failed to assign lead");
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>

          <p className="text-sm text-slate-500">
            Manage and track sales leads.
          </p>
        </div>

        {(currentUser?.role === "admin" || currentUser?.role === "manager") && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus size={18} />
            Add Lead
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search size={18} className="absolute left-3 top-3 text-slate-400" />

          <input
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            placeholder="Search name, email or company..."
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 outline-none focus:border-slate-500"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => updateFilter("status", e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2.5 outline-none"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="unqualified">Unqualified</option>
          <option value="converted">Converted</option>
        </select>

        <select
          value={filters.priority}
          onChange={(e) => updateFilter("priority", e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2.5 outline-none"
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading leads...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-600">
            Failed to load leads.
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-medium text-slate-900">No leads found</p>
            <p className="mt-1 text-sm text-slate-500">
              Try changing your filters or create a new lead.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Company</th>
                  <th className="px-5 py-3">Source</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Assigned To</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead._id}
                    className="border-b last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">{lead.name}</p>
                      <p className="text-xs text-slate-500">{lead.email}</p>
                    </td>

                    <td className="px-5 py-4">{lead.company || "-"}</td>

                    <td className="px-5 py-4 capitalize">
                      {lead.source.replace("_", " ")}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize">
                        {lead.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                          lead.priority === "high"
                            ? "bg-red-50 text-red-700"
                            : lead.priority === "medium"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {lead.priority}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {lead.assignedTo?.name || "Unassigned"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/leads/${lead._id}`)}
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                          title="View Lead"
                        >
                          <Eye size={18} />
                        </button>

                        {(currentUser?.role === "admin" ||
                          currentUser?.role === "manager") && (
                          <select
                            value={lead.assignedTo?._id || ""}
                            onChange={(e) =>
                              handleAssign(lead._id, e.target.value)
                            }
                            disabled={assigning}
                            className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none"
                          >
                            <option value="">Assign</option>

                            {users
                              .filter((user) => user.role === "executive")
                              .map((user) => (
                                <option key={user._id} value={user._id}>
                                  {user.name}
                                </option>
                              ))}
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-5 py-4">
            <p className="text-sm text-slate-500">
              Page {pagination.page} of {pagination.totalPages}
            </p>

            <div className="flex gap-2">
              <button
                disabled={pagination.page === 1}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: prev.page - 1,
                  }))
                }
                className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Previous
              </button>

              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: prev.page + 1,
                  }))
                }
                className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Lead Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create Lead</h2>

              <button
                onClick={() => setShowForm(false)}
                className="text-slate-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <input
                required
                placeholder="Name"
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
                placeholder="Phone"
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value,
                  })
                }
                className="w-full rounded-lg border px-3 py-2.5"
              />

              <input
                placeholder="Company"
                value={form.company}
                onChange={(e) =>
                  setForm({
                    ...form,
                    company: e.target.value,
                  })
                }
                className="w-full rounded-lg border px-3 py-2.5"
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.source}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      source: e.target.value,
                    })
                  }
                  className="rounded-lg border px-3 py-2.5"
                >
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="social_media">Social Media</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                </select>

                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      priority: e.target.value,
                    })
                  }
                  className="rounded-lg border px-3 py-2.5"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <button
                disabled={creating}
                className="w-full rounded-lg bg-slate-900 py-2.5 font-medium text-white disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Lead"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
