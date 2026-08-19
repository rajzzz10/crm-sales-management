import { useState } from "react";
import { Eye, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useGetCustomersQuery } from "../store/api";

const Customers = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    limit: 10,
  });

  const { data, isLoading, isError } = useGetCustomersQuery(filters);

  const customers = data?.customers || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-sm text-slate-500">Manage converted customers.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-lg">
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
            placeholder="Search customers..."
            className="w-full rounded-lg border px-3 py-2.5 pl-10"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center">Loading customers...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-600">
            Failed to load customers.
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No customers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Company</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Assigned To</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="border-b last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-xs text-slate-500">{customer.email}</p>
                    </td>

                    <td className="px-5 py-4">{customer.company || "-"}</td>

                    <td className="px-5 py-4">{customer.phone}</td>

                    <td className="px-5 py-4">
                      {customer.assignedTo?.name || "Unassigned"}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => navigate(`/customers/${customer._id}`)}
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
          <Pagination
            pagination={pagination}
            setPage={(page) =>
              setFilters({
                ...filters,
                page,
              })
            }
          />
        )}
      </div>
    </div>
  );
};

const Pagination = ({ pagination, setPage }) => (
  <div className="flex items-center justify-between border-t px-5 py-4">
    <p className="text-sm text-slate-500">
      Page {pagination.page} of {pagination.totalPages}
    </p>

    <div className="flex gap-2">
      <button
        disabled={pagination.page === 1}
        onClick={() => setPage(pagination.page - 1)}
        className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
      >
        Previous
      </button>

      <button
        disabled={pagination.page === pagination.totalPages}
        onClick={() => setPage(pagination.page + 1)}
        className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
      >
        Next
      </button>
    </div>
  </div>
);

export default Customers;
