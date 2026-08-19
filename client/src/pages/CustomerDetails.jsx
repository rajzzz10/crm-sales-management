import { useNavigate, useParams } from "react-router-dom";

import { useGetCustomerQuery } from "../store/api";
import Timeline from "../components/Timeline";

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetCustomerQuery(id);

  if (isLoading) {
    return <div>Loading customer...</div>;
  }

  if (isError || !data?.customer) {
    return <div className="text-red-600">Customer not found.</div>;
  }

  const { customer, deals = [] } = data;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/customers")}
        className="text-sm text-slate-500"
      >
        ← Back to Customers
      </button>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">{customer.name}</h1>

        <p className="mt-1 text-slate-500">
          {customer.company || "No company"}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Info label="Email" value={customer.email} />
          <Info label="Phone" value={customer.phone} />
          <Info label="Assigned To" value={customer.assignedTo?.name} />
          <Info label="Original Lead" value={customer.originalLead?.name} />
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Deals</h2>

        <div className="mt-4 space-y-3">
          {deals.length === 0 ? (
            <p className="text-sm text-slate-500">No deals found.</p>
          ) : (
            deals.map((deal) => (
              <button
                key={deal._id}
                onClick={() => navigate(`/deals/${deal._id}`)}
                className="flex w-full items-center justify-between rounded-lg border p-4 text-left hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium">{deal.title}</p>
                  <p className="text-sm capitalize text-slate-500">
                    {deal.stage}
                  </p>
                </div>

                <p className="font-semibold">
                  ₹{Number(deal.value || 0).toLocaleString()}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      <Timeline type="customer" id={id} />
    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <p className="text-xs text-slate-500">{label}</p>
    <p className="mt-1 font-medium">{value || "-"}</p>
  </div>
);

export default CustomerDetails;
