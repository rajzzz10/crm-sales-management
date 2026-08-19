import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  useGetLeadQuery,
  useUpdateLeadStatusMutation,
  useAddLeadNoteMutation,
  useConvertLeadMutation,
} from "../store/api";

import Timeline from "../components/Timeline";

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetLeadQuery(id);

  const [updateStatus] = useUpdateLeadStatusMutation();

  const [addNote] = useAddLeadNoteMutation();

  const [convertLead, { isLoading: converting }] = useConvertLeadMutation();

  const [note, setNote] = useState("");

  if (isLoading) {
    return <div>Loading lead...</div>;
  }

  if (isError || !data?.lead) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        Lead not found.
      </div>
    );
  }

  const lead = data.lead;

  const handleStatusChange = async (status) => {
    try {
      await updateStatus({
        id,
        status,
      }).unwrap();
    } catch (error) {
      alert(error?.data?.message || "Failed to update status");
    }
  };

  const handleNote = async (e) => {
    e.preventDefault();

    if (!note.trim()) return;

    try {
      await addNote({
        id,
        text: note,
      }).unwrap();

      setNote("");
    } catch (error) {
      alert(error?.data?.message || "Failed to add note");
    }
  };

  const handleConvert = async () => {
    if (
      !window.confirm("Are you sure you want to convert this qualified lead?")
    ) {
      return;
    }

    try {
      const result = await convertLead(id).unwrap();

      navigate(`/customers/${result.customer._id}`);
    } catch (error) {
      alert(error?.data?.message || "Failed to convert lead");
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/leads")}
        className="text-sm text-slate-500 hover:text-slate-900"
      >
        ← Back to Leads
      </button>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="text-2xl font-bold">{lead.name}</h1>

            <p className="text-sm text-slate-500">
              {lead.company || "No company"}
            </p>
          </div>

          {lead.status === "qualified" && !lead.isConverted && (
            <button
              onClick={handleConvert}
              disabled={converting}
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
            >
              {converting ? "Converting..." : "Convert Lead"}
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Info label="Email" value={lead.email} />
          <Info label="Phone" value={lead.phone} />
          <Info label="Source" value={lead.source.replace("_", " ")} />

          <div>
            <p className="text-xs text-slate-500">Priority</p>

            <p className="mt-1 font-medium capitalize">{lead.priority}</p>
          </div>
        </div>

        <div className="mt-6">
          <label className="text-sm font-medium">Status</label>

          <select
            value={lead.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={lead.isConverted}
            className="mt-2 block rounded-lg border px-3 py-2"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="unqualified">Unqualified</option>
            <option value="converted">Converted</option>
          </select>
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Notes</h2>

        <form onSubmit={handleNote} className="mt-4 flex gap-3">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note..."
            className="flex-1 rounded-lg border px-3 py-2.5"
          />

          <button className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm text-white">
            Add
          </button>
        </form>

        <div className="mt-5 space-y-3">
          {lead.notes?.length ? (
            lead.notes.map((item) => (
              <div key={item._id} className="rounded-lg bg-slate-50 p-3">
                <p className="text-sm">{item.text}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No notes yet.</p>
          )}
        </div>

        <Timeline type="lead" id={id} />
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <p className="text-xs text-slate-500">{label}</p>
    <p className="mt-1 font-medium capitalize">{value || "-"}</p>
  </div>
);

export default LeadDetails;
