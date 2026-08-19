import Lead from "../models/Lead.js";
import Customer from "../models/Customer.js";
import Deal from "../models/Deal.js";
import Activity from "../models/Activity.js";
import User from "../models/User.js";

export const getDashboardStats = async (req, res) => {
  const baseQuery =
    req.user.role === "executive" ? { assignedTo: req.user._id } : {};

  const [
    totalLeads,
    totalCustomers,
    totalDeals,
    wonDeals,
    pendingActivities,
    overdueActivities,
    pipeline,
  ] = await Promise.all([
    Lead.countDocuments(baseQuery),

    Customer.countDocuments(baseQuery),

    Deal.countDocuments(baseQuery),

    Deal.find({
      ...baseQuery,
      stage: "won",
    }).select("value"),

    Activity.countDocuments({
      ...baseQuery,
      status: "pending",
    }),

    Activity.countDocuments({
      ...baseQuery,
      status: "overdue",
    }),

    Deal.aggregate([
      {
        $match: baseQuery,
      },
      {
        $group: {
          _id: "$stage",
          count: { $sum: 1 },
          value: { $sum: "$value" },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]),
  ]);

  const wonRevenue = wonDeals.reduce((total, deal) => total + deal.value, 0);

  const conversionBase = await Lead.countDocuments({
    ...baseQuery,
    status: {
      $in: ["qualified", "converted"],
    },
  });

  const conversionRate =
    totalLeads > 0
      ? Number(((conversionBase / totalLeads) * 100).toFixed(2))
      : 0;

  let teamPerformance = [];

  if (req.user.role === "admin" || req.user.role === "manager") {
    teamPerformance = await User.aggregate([
      {
        $match: {
          role: "executive",
          isActive: true,
        },
      },

      {
        $lookup: {
          from: "leads",
          localField: "_id",
          foreignField: "assignedTo",
          as: "leads",
        },
      },

      {
        $lookup: {
          from: "deals",
          localField: "_id",
          foreignField: "assignedTo",
          as: "deals",
        },
      },

      {
        $project: {
          name: 1,
          email: 1,
          totalLeads: { $size: "$leads" },
          totalDeals: { $size: "$deals" },

          wonDeals: {
            $size: {
              $filter: {
                input: "$deals",
                as: "deal",
                cond: {
                  $eq: ["$$deal.stage", "won"],
                },
              },
            },
          },

          revenue: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$deals",
                    as: "deal",
                    cond: {
                      $eq: ["$$deal.stage", "won"],
                    },
                  },
                },
                as: "deal",
                in: "$$deal.value",
              },
            },
          },
        },
      },
    ]);
  }

  res.status(200).json({
    success: true,
    stats: {
      totalLeads,
      totalCustomers,
      totalDeals,
      wonRevenue,
      conversionRate,
      pendingActivities,
      overdueActivities,
    },
    pipeline,
    teamPerformance,
  });
};
