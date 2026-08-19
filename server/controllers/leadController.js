import Lead from "../models/Lead.js";
import User from "../models/User.js";
import Timeline from "../models/Timeline.js";
import Customer from "../models/Customer.js";
import Deal from "../models/Deal.js";
import Notification from "../models/Notification.js";

export const createLead = async (req, res) => {
  const { name, email, phone, company, source, priority, assignedTo } =
    req.body;

  if (!name || !email || !phone || !source) {
    return res.status(400).json({
      success: false,
      message: "Name, email, phone and source are required",
    });
  }

  if (assignedTo) {
    const assignedUser = await User.findById(assignedTo);

    if (!assignedUser || !assignedUser.isActive) {
      return res.status(400).json({
        success: false,
        message: "Invalid assigned user",
      });
    }
  }

  const lead = await Lead.create({
    name,
    email,
    phone,
    company,
    source,
    priority: priority || "medium",
    assignedTo: assignedTo || null,
    createdBy: req.user._id,
  });

  await Timeline.create({
    type: "lead_created",
    message: `Lead ${lead.name} was created`,
    user: req.user._id,
    lead: lead._id,
  });

  if (assignedTo) {
    await Notification.create({
      user: assignedTo,
      type: "lead_assigned",
      message: `Lead "${lead.name}" has been assigned to you.`,
      lead: lead._id,
    });
  }


  res.status(201).json({
    success: true,
    message: "Lead created successfully",
    lead,
  });
};

export const getLeads = async (req, res) => {
  const {
    search,
    status,
    priority,
    source,
    assignedTo,
    page = 1,
    limit = 10,
    sort = "-createdAt",
  } = req.query;

  const query = {};

  // Executive can only see assigned leads
  if (req.user.role === "executive") {
    query.assignedTo = req.user._id;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
    ];
  }

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (source) query.source = source;

  if (assignedTo && req.user.role !== "executive") {
    query.assignedTo = assignedTo;
  }

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.min(Math.max(Number(limit), 1), 100);
  const skip = (pageNumber - 1) * limitNumber;

  const [leads, total] = await Promise.all([
    Lead.find(query)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limitNumber),

    Lead.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    leads,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  });
};

export const getLead = async (req, res) => {
  const lead = await Lead.findById(req.params.id)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email");

  if (!lead) {
    return res.status(404).json({
      success: false,
      message: "Lead not found",
    });
  }

  // Executive can only access assigned lead
  if (
    req.user.role === "executive" &&
    String(lead.assignedTo?._id) !== String(req.user._id)
  ) {
    return res.status(403).json({
      success: false,
      message: "You do not have access to this lead",
    });
  }

  res.status(200).json({
    success: true,
    lead,
  });
};

export const updateLead = async (req, res) => {
  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return res.status(404).json({
      success: false,
      message: "Lead not found",
    });
  }

  if (
    req.user.role === "executive" &&
    String(lead.assignedTo) !== String(req.user._id)
  ) {
    return res.status(403).json({
      success: false,
      message: "You cannot modify this lead",
    });
  }

  const allowedFields = [
    "name",
    "email",
    "phone",
    "company",
    "source",
    "priority",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      lead[field] = req.body[field];
    }
  });

  await lead.save();

  res.status(200).json({
    success: true,
    message: "Lead updated successfully",
    lead,
  });
};

export const assignLead = async (req, res) => {
  const { assignedTo } = req.body;

  if (!assignedTo) {
    return res.status(400).json({
      success: false,
      message: "assignedTo is required",
    });
  }

  const user = await User.findById(assignedTo);

  if (!user || !user.isActive || user.role === "admin") {
    return res.status(400).json({
      success: false,
      message: "Invalid sales employee",
    });
  }

  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return res.status(404).json({
      success: false,
      message: "Lead not found",
    });
  }

  lead.assignedTo = assignedTo;
  await lead.save();

  await Timeline.create({
    type: "lead_assigned",
    message: `Lead assigned to ${user.name}`,
    user: req.user._id,
    lead: lead._id,
  });

  await Notification.create({
    user: assignedTo,
    type: "lead_assigned",
    message: `Lead "${lead.name}" has been assigned to you.`,
    lead: lead._id,
  });


  res.status(200).json({
    success: true,
    message: "Lead assigned successfully",
    lead,
  });
};

export const updateLeadStatus = async (req, res) => {
  const { status } = req.body;

  const allowedStatuses = [
    "new",
    "contacted",
    "qualified",
    "unqualified",
    "converted",
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid lead status",
    });
  }

  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return res.status(404).json({
      success: false,
      message: "Lead not found",
    });
  }

  if (
    req.user.role === "executive" &&
    String(lead.assignedTo) !== String(req.user._id)
  ) {
    return res.status(403).json({
      success: false,
      message: "You cannot modify this lead",
    });
  }

  const oldStatus = lead.status;

  lead.status = status;

  await lead.save();

  await Timeline.create({
    type: "lead_status_changed",
    message: `Lead status changed from ${oldStatus} to ${status}`,
    user: req.user._id,
    lead: lead._id,
  });

  res.status(200).json({
    success: true,
    message: "Lead status updated",
    lead,
  });
};

export const addLeadNote = async (req, res) => {
  const { text } = req.body;

  if (!text?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Note text is required",
    });
  }

  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return res.status(404).json({
      success: false,
      message: "Lead not found",
    });
  }

  if (
    req.user.role === "executive" &&
    String(lead.assignedTo) !== String(req.user._id)
  ) {
    return res.status(403).json({
      success: false,
      message: "You cannot add notes to this lead",
    });
  }

  lead.notes.push({
    text,
    addedBy: req.user._id,
  });

  await lead.save();

  await Timeline.create({
    type: "note_added",
    message: `Note added to lead ${lead.name}`,
    user: req.user._id,
    lead: lead._id,
  });

  res.status(201).json({
    success: true,
    message: "Note added successfully",
    lead,
  });
};

export const convertLead = async (req, res) => {
  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return res.status(404).json({
      success: false,
      message: "Lead not found",
    });
  }

  if (
    req.user.role === "executive" &&
    String(lead.assignedTo) !== String(req.user._id)
  ) {
    return res.status(403).json({
      success: false,
      message: "You cannot convert this lead",
    });
  }

  if (lead.status !== "qualified") {
    return res.status(400).json({
      success: false,
      message: "Only qualified leads can be converted",
    });
  }

  if (lead.isConverted) {
    return res.status(400).json({
      success: false,
      message: "Lead has already been converted",
    });
  }

  const customer = await Customer.create({
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    originalLead: lead._id,
    assignedTo: lead.assignedTo || req.user._id,
  });

  const deal = await Deal.create({
    title: `${lead.company || lead.name} Deal`,
    lead: lead._id,
    customer: customer._id,
    assignedTo: lead.assignedTo || req.user._id,
    value: 0,
    probability: 0,
    expectedRevenue: 0,
    expectedClosingDate: new Date(),
    stage: "qualification",
  });

  lead.isConverted = true;
  lead.status = "converted";
  lead.convertedCustomer = customer._id;

  await lead.save();

  await Timeline.create({
    type: "lead_converted",
    message: `Lead converted to customer ${customer.name}`,
    user: req.user._id,
    lead: lead._id,
    customer: customer._id,
    deal: deal._id,
  });
  
  await Notification.create({
    user: lead.assignedTo,
    type: "lead_converted",
    message: `Lead "${lead.name}" has been converted to a customer.`,
    lead: lead._id,
    deal: deal._id,
  });


  res.status(201).json({
    success: true,
    message: "Lead converted successfully",
    customer,
    deal,
  });
};
