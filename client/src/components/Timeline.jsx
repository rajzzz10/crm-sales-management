import { useGetTimelineQuery } from "../store/api";

const Timeline = ({ type, id }) => {
  const query = {
    [type]: id,
  };

  const { data, isLoading, isError } = useGetTimelineQuery(query);

  const timeline = data?.timeline || [];

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Timeline</h2>
        <p className="mt-4 text-sm text-slate-500">Loading timeline...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Timeline</h2>
        <p className="mt-4 text-sm text-red-600">Failed to load timeline.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 mt-4 shadow-sm">
      <h2 className="font-semibold">Timeline</h2>

      {timeline.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No activity recorded yet.</p>
      ) : (
        <div className="mt-6 space-y-5">
          {timeline.map((item) => (
            <div key={item._id} className="flex gap-4">
              <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-slate-700" />

              <div className="flex-1">
                <div className="flex flex-col justify-between gap-1 sm:flex-row">
                  <p className="font-medium text-slate-900">
                    {item.title || item.action || item.type || "Activity"}
                  </p>

                  <span className="text-xs text-slate-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>

                {item.description && (
                  <p className="mt-1 text-sm text-slate-500">
                    {item.description}
                  </p>
                )}

                {item.user && (
                  <p className="mt-1 text-xs text-slate-400">
                    By {item.user.name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Timeline;
