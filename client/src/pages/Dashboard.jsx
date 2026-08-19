import {
  Users,
  UserRound,
  BriefcaseBusiness,
  IndianRupee,
  TrendingUp,
  Clock,
  AlertCircle,
} from "lucide-react";

import { useGetDashboardStatsQuery } from "../store/api";

const Dashboard = () => {
  const { data, isLoading, isError } = useGetDashboardStatsQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-xl bg-white shadow-sm"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        Failed to load dashboard data.
      </div>
    );
  }

  const stats = data?.stats || {};
  const pipeline = data?.pipeline || [];
  const teamPerformance = data?.teamPerformance || [];

  const cards = [
    {
      title: "Total Leads",
      value: stats.totalLeads || 0,
      icon: Users,
    },
    {
      title: "Customers",
      value: stats.totalCustomers || 0,
      icon: UserRound,
    },
    {
      title: "Active Deals",
      value: stats.totalDeals || 0,
      icon: BriefcaseBusiness,
    },
    {
      title: "Won Revenue",
      value: `₹${Number(stats.wonRevenue || 0).toLocaleString()}`,
      icon: IndianRupee,
    },
    {
      title: "Conversion Rate",
      value: `${stats.conversionRate || 0}%`,
      icon: TrendingUp,
    },
    {
      title: "Pending Activities",
      value: stats.pendingActivities || 0,
      icon: Clock,
    },
    {
      title: "Overdue Activities",
      value: stats.overdueActivities || 0,
      icon: AlertCircle,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Overview of your sales activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{card.title}</p>

                <Icon size={20} className="text-slate-500" />
              </div>

              <p className="mt-3 text-2xl font-bold text-slate-900">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pipeline */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Sales Pipeline</h2>

          <div className="mt-5 space-y-4">
            {pipeline.length === 0 ? (
              <p className="text-sm text-slate-500">
                No pipeline data available.
              </p>
            ) : (
              pipeline.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm capitalize text-slate-600">
                    {item._id}
                  </span>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">
                      {item.count} deals
                    </span>

                    <span className="text-sm text-slate-500">
                      ₹{Number(item.value || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Team */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Team Performance</h2>

          {teamPerformance.length === 0 ? (
            <p className="mt-5 text-sm text-slate-500">
              Team performance is available for managers and admins.
            </p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="pb-3">Employee</th>
                    <th className="pb-3">Leads</th>
                    <th className="pb-3">Deals</th>
                    <th className="pb-3">Revenue</th>
                  </tr>
                </thead>

                <tbody>
                  {teamPerformance.map((employee) => (
                    <tr key={employee._id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{employee.name}</td>
                      <td>{employee.totalLeads}</td>
                      <td>{employee.totalDeals}</td>
                      <td>₹{Number(employee.revenue || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
