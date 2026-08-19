import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  useGetDealQuery,
  useUpdateDealMutation,
  useUpdateDealStageMutation,
} from "../store/api";
import Timeline from "../components/Timeline";

const DealDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetDealQuery(id);

  const [updateDeal] = useUpdateDealMutation();
  const [updateStage] = useUpdateDealStageMutation();

  const [value, setValue] = useState("");
  const [probability, setProbability] = useState("");

  if (isLoading) {
    return <div>Loading deal...</div>;
  }

  if (isError || !data?.deal) {
    return <div className="text-red-600">Deal not found.</div>;
  }

  const deal = data.deal;

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await updateDeal({
        id,
        value: Number(value),
        probability: Number(probability),
      }).unwrap();

      setValue("");
      setProbability("");
    } catch (error) {
      alert(error?.data?.message || "Failed to update deal");
    }
  };

  const handleStage = async (stage) => {
    try {
      await updateStage({
        id,
        stage,
      }).unwrap();
    } catch (error) {
      alert(error?.data?.message || "Failed to update stage");
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/deals")}
        className="text-sm text-slate-500"
      >
        ← Back to Deals
      </button>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">{deal.title}</h1>

        <p className="mt-1 text-slate-500">{deal.customer?.name}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Info
            label="Deal Value"
            value={`₹${Number(deal.value || 0).toLocaleString()}`}
          />

          <Info label="Probability" value={`${deal.probability}%`} />

          <Info
            label="Expected Revenue"
            value={`₹${Number(deal.expectedRevenue || 0).toLocaleString()}`}
          />

          <Info label="Stage" value={deal.stage} />
        </div>

        <div className="mt-6">
          <label className="text-sm font-medium">Change Stage</label>

          <select
            value={deal.stage}
            onChange={(e) => handleStage(e.target.value)}
            className="mt-2 block rounded-lg border px-3 py-2"
          >
            <option value="qualification">Qualification</option>
            <option value="discovery">Discovery</option>
            <option value="proposal">Proposal</option>
            <option value="negotiation">Negotiation</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Update Deal</h2>

        <form
          onSubmit={handleUpdate}
          className="mt-4 grid gap-4 sm:grid-cols-3"
        >
          <input
            type="number"
            min="0"
            placeholder="Deal value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="rounded-lg border px-3 py-2.5"
          />

          <input
            type="number"
            min="0"
            max="100"
            placeholder="Probability %"
            value={probability}
            onChange={(e) => setProbability(e.target.value)}
            className="rounded-lg border px-3 py-2.5"
          />

          <button className="rounded-lg bg-slate-900 px-4 py-2.5 text-white">
            Update
          </button>
        </form>
      </div>

      <Timeline type="deal" id={id} />
    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <p className="text-xs text-slate-500">{label}</p>

    <p className="mt-1 font-medium capitalize">{value || "-"}</p>
  </div>
);

export default DealDetails;
