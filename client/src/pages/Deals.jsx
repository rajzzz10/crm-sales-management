import { useState } from "react";
import { Eye, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useGetDealsQuery } from "../store/api";

const Deals = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    search: "",
    stage: "",
    page: 1,
    limit: 10,
  });

  const { data, isLoading, isError } = useGetDealsQuery(filters);

  const deals = data?.deals || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Deals</h1>
        <p className="text-sm text-slate-500">Manage your sales pipeline.</p>
      </div>

      <div className="grid gap-3 rounded-xl border bg-white p-4 shadow-sm md:grid-cols-2">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-slate-400" />

          <input
            value={filters.search}
            onChange={(e) =>
              setFilters({
                ...filters,
                search: e.target.value,
                page: 1,
              })
            }
            placeholder="Search deals..."
            className="w-full rounded-lg border px-3 py-2.5 pl-10"
          />
        </div>

        <select
          value={filters.stage}
          onChange={(e) =>
            setFilters({
              ...filters,
              stage: e.target.value,
              page: 1,
            })
          }
          className="rounded-lg border px-3 py-2.5"
        >
          <option value="">All Stages</option>
          <option value="qualification">Qualification</option>
          <option value="discovery">Discovery</option>
          <option value="proposal">Proposal</option>
          <option value="negotiation">Negotiation</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center">Loading deals...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-600">
            Failed to load deals.
          </div>
        ) : deals.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No deals found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="px-5 py-3">Deal</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Value</th>
                  <th className="px-5 py-3">Probability</th>
                  <th className="px-5 py-3">Stage</th>
                  <th className="px-5 py-3">Assigned To</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {deals.map((deal) => (
                  <tr
                    key={deal._id}
                    className="border-b last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-medium">{deal.title}</td>

                    <td className="px-5 py-4">{deal.customer?.name || "-"}</td>

                    <td className="px-5 py-4">
                      ₹{Number(deal.value || 0).toLocaleString()}
                    </td>

                    <td className="px-5 py-4">{deal.probability}%</td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs capitalize">
                        {deal.stage}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {deal.assignedTo?.name || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => navigate(`/deals/${deal._id}`)}
                        className="rounded-lg p-2 hover:bg-slate-100"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-5 py-4">
            <p className="text-sm text-slate-500">
              Page {pagination.page} of {pagination.totalPages}
            </p>

            <div className="flex gap-2">
              <button
                disabled={pagination.page === 1}
                onClick={() =>
                  setFilters({
                    ...filters,
                    page: pagination.page - 1,
                  })
                }
                className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Previous
              </button>

              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() =>
                  setFilters({
                    ...filters,
                    page: pagination.page + 1,
                  })
                }
                className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Deals;
