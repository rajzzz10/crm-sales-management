import {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from "../store/api";

const Notifications = () => {
  const { data, isLoading, isError } = useGetNotificationsQuery();

  const [markRead] = useMarkNotificationAsReadMutation();

  const [markAllRead] = useMarkAllNotificationsAsReadMutation();

  const notifications = data?.notifications || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>

          <p className="text-sm text-slate-500">Important CRM updates.</p>
        </div>

        {notifications.some((notification) => !notification.isRead) && (
          <button
            onClick={() => markAllRead()}
            className="text-sm font-medium text-slate-700"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <div>Loading notifications...</div>
        ) : isError ? (
          <div className="text-red-600">Failed to load notifications.</div>
        ) : notifications.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center text-slate-500">
            No notifications.
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification._id}
              onClick={() => !notification.isRead && markRead(notification._id)}
              className={`w-full rounded-xl border p-4 text-left ${
                notification.isRead ? "bg-white" : "bg-slate-50"
              }`}
            >
              <p className="text-sm font-medium">{notification.message}</p>

              <p className="mt-1 text-xs text-slate-500">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
