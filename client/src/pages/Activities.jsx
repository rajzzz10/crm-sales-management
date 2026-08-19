import { useState } from "react";

import {
  useGetActivitiesQuery,
  useCreateActivityMutation,
  useCompleteActivityMutation,
  useGetLeadsQuery,
  useGetCustomersQuery,
  useGetDealsQuery,
} from "../store/api";

const Activities = () => {
  const [filters, setFilters] = useState({
    status: "",
    page: 1,
    limit: 10,
  });

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    type: "call",
    title: "",
    description: "",
    dueDate: "",
    relatedType: "lead",
    relatedId: "",
  });

  const { data, isLoading, isError } = useGetActivitiesQuery(filters);

  const { data: leadsData } = useGetLeadsQuery({
    limit: 100,
  });

  const { data: customersData } = useGetCustomersQuery({
    limit: 100,
  });

  const { data: dealsData } = useGetDealsQuery({
    limit: 100,
  });

  const [createActivity, { isLoading: creating }] = useCreateActivityMutation();

  const [completeActivity] = useCompleteActivityMutation();

  const activities = data?.activities || [];
  const leads = leadsData?.leads || [];
  const customers = customersData?.customers || [];
  const deals = dealsData?.deals || [];

  const getRelatedRecords = () => {
    if (form.relatedType === "lead") {
      return leads;
    }

    if (form.relatedType === "customer") {
      return customers;
    }

    return deals;
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!form.relatedId) {
      alert(`Please select a ${form.relatedType}`);
      return;
    }

    const body = {
      type: form.type,
      title: form.title,
      description: form.description,
      dueDate: new Date(form.dueDate).toISOString(),
    };

    // Attach activity to the selected entity
    body[form.relatedType] = form.relatedId;

    try {
      await createActivity(body).unwrap();

      setForm({
        type: "call",
        title: "",
        description: "",
        dueDate: "",
        relatedType: "lead",
        relatedId: "",
      });

      setShowForm(false);
    } catch (error) {
      alert(error?.data?.message || "Failed to create activity");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Activities</h1>

          <p className="text-sm text-slate-500">
            Manage calls, meetings and follow-ups.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
        >
          Add Activity
        </button>
      </div>

      {/* Filter */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters({
              ...filters,
              status: e.target.value,
              page: 1,
            })
          }
          className="rounded-lg border px-3 py-2.5"
        >
          <option value="">All Activities</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Activities */}
      <div className="space-y-3">
        {isLoading ? (
          <div>Loading activities...</div>
        ) : isError ? (
          <div className="text-red-600">Failed to load activities.</div>
        ) : activities.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center text-slate-500">
            No activities found.
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity._id}
              className="flex flex-col justify-between gap-4 rounded-xl border bg-white p-5 shadow-sm sm:flex-row sm:items-center"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{activity.title}</h3>

                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs capitalize">
                    {activity.type}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Due: {new Date(activity.dueDate).toLocaleString()}
                </p>

                <p className="text-sm text-slate-500">
                  {activity.lead?.name ||
                    activity.customer?.name ||
                    activity.deal?.title ||
                    "CRM Activity"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                    activity.status === "completed"
                      ? "bg-green-50 text-green-700"
                      : activity.status === "overdue"
                        ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {activity.status}
                </span>

                {activity.status !== "completed" && (
                  <button
                    onClick={() => completeActivity(activity._id)}
                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Activity Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create Activity</h2>

              <button
                onClick={() => setShowForm(false)}
                className="text-slate-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-5 space-y-4">
              {/* Related Type */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Related To
                </label>

                <select
                  value={form.relatedType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      relatedType: e.target.value,
                      relatedId: "",
                    })
                  }
                  className="w-full rounded-lg border px-3 py-2.5"
                >
                  <option value="lead">Lead</option>

                  <option value="customer">Customer</option>

                  <option value="deal">Deal</option>
                </select>
              </div>

              {/* Related Record */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Select {form.relatedType}
                </label>

                <select
                  required
                  value={form.relatedId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      relatedId: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border px-3 py-2.5"
                >
                  <option value="">Select {form.relatedType}</option>

                  {getRelatedRecords().map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name || item.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Activity Type */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Activity Type
                </label>

                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border px-3 py-2.5"
                >
                  <option value="call">Call</option>

                  <option value="email">Email</option>

                  <option value="meeting">Meeting</option>

                  <option value="demo">Demo</option>

                  <option value="reminder">Reminder</option>
                </select>
              </div>

              {/* Title */}
              <input
                required
                placeholder="Activity title"
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
                className="w-full rounded-lg border px-3 py-2.5"
              />

              {/* Description */}
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                className="w-full rounded-lg border px-3 py-2.5"
              />

              {/* Date */}
              <input
                required
                type="datetime-local"
                value={form.dueDate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    dueDate: e.target.value,
                  })
                }
                className="w-full rounded-lg border px-3 py-2.5"
              />

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
                  {creating ? "Creating..." : "Create Activity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;
