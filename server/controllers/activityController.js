import Activity from "../models/Activity.js";
import Lead from "../models/Lead.js";
import Customer from "../models/Customer.js";
import Deal from "../models/Deal.js";
import Timeline from "../models/Timeline.js";

const activityTypes = ["call", "email", "meeting", "demo", "reminder"];

export const createActivity = async (req, res) => {
  const {
    type,
    title,
    description,
    dueDate,
    assignedTo,
    lead,
    customer,
    deal,
  } = req.body;

  if (!type || !title || !dueDate) {
    return res.status(400).json({
      success: false,
      message: "Type, title and due date are required",
    });
  }

  if (!activityTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      message: "Invalid activity type",
    });
  }

  if (!lead && !customer && !deal) {
    return res.status(400).json({
      success: false,
      message: "Activity must belong to a lead, customer or deal",
    });
  }

  const employeeId = assignedTo || req.user._id;

  // Executive can only create activities for themselves.
  if (
    req.user.role === "executive" &&
    String(employeeId) !== String(req.user._id)
  ) {
    return res.status(403).json({
      success: false,
      message: "You can only assign activities to yourself",
    });
  }

  if (lead) {
    const leadExists = await Lead.findById(lead);

    if (!leadExists) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }
  }

  if (customer) {
    const customerExists = await Customer.findById(customer);

    if (!customerExists) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }
  }

  if (deal) {
    const dealExists = await Deal.findById(deal);

    if (!dealExists) {
      return res.status(404).json({
        success: false,
        message: "Deal not found",
      });
    }
  }

  const activity = await Activity.create({
    type,
    title,
    description,
    dueDate,
    assignedTo: employeeId,
    lead: lead || null,
    customer: customer || null,
    deal: deal || null,
    createdBy: req.user._id,
  });

  await Timeline.create({
    type: "follow_up_created",
    message: `Follow-up created: ${title}`,
    user: req.user._id,
    lead: lead || null,
    customer: customer || null,
    deal: deal || null,
  });

  res.status(201).json({
    success: true,
    message: "Activity created successfully",
    activity,
  });
};

export const getActivities = async (req, res) => {
  const { status, type, page = 1, limit = 10 } = req.query;

  const query = {};

  if (req.user.role === "executive") {
    query.assignedTo = req.user._id;
  }

  if (status) {
    query.status = status;
  }

  if (type) {
    query.type = type;
  }

  // Automatically consider past pending activities as overdue.
  await Activity.updateMany(
    {
      ...query,
      status: "pending",
      dueDate: { $lt: new Date() },
    },
    {
      $set: { status: "overdue" },
    },
  );

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.min(Math.max(Number(limit), 1), 100);
  const skip = (pageNumber - 1) * limitNumber;

  const [activities, total] = await Promise.all([
    Activity.find(query)
      .populate("assignedTo", "name email role")
      .populate("lead", "name email company")
      .populate("customer", "name email company")
      .populate("deal", "title value stage")
      .sort("dueDate")
      .skip(skip)
      .limit(limitNumber),

    Activity.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    activities,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  });
};

export const completeActivity = async (req, res) => {
  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    return res.status(404).json({
      success: false,
      message: "Activity not found",
    });
  }

  if (
    req.user.role === "executive" &&
    String(activity.assignedTo) !== String(req.user._id)
  ) {
    return res.status(403).json({
      success: false,
      message: "You cannot update this activity",
    });
  }

  activity.status = "completed";
  activity.completedAt = new Date();

  await activity.save();

  res.status(200).json({
    success: true,
    message: "Activity completed",
    activity,
  });
};
