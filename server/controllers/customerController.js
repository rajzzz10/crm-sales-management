import Customer from "../models/Customer.js";
import Timeline from "../models/Timeline.js";
import Deal from "../models/Deal.js";

export const getCustomers = async (req, res) => {
  const {
    search,
    assignedTo,
    page = 1,
    limit = 10,
    sort = "-createdAt",
  } = req.query;

  const query = {};

  // Executive sees only their customers
  if (req.user.role === "executive") {
    query.assignedTo = req.user._id;
  }

  if (assignedTo && req.user.role !== "executive") {
    query.assignedTo = assignedTo;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
    ];
  }

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.min(Math.max(Number(limit), 1), 100);
  const skip = (pageNumber - 1) * limitNumber;

  const [customers, total] = await Promise.all([
    Customer.find(query)
      .populate("assignedTo", "name email role")
      .populate("originalLead", "name email status")
      .sort(sort)
      .skip(skip)
      .limit(limitNumber),

    Customer.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    customers,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  });
};

export const getCustomer = async (req, res) => {
  const customer = await Customer.findById(req.params.id)
    .populate("assignedTo", "name email role")
    .populate("originalLead", "name email status");

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: "Customer not found",
    });
  }

  if (
    req.user.role === "executive" &&
    String(customer.assignedTo?._id) !== String(req.user._id)
  ) {
    return res.status(403).json({
      success: false,
      message: "You do not have access to this customer",
    });
  }

  const deals = await Deal.find({
    customer: customer._id,
  })
    .populate("assignedTo", "name email role")
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    customer,
    deals,
  });
};

export const updateCustomer = async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: "Customer not found",
    });
  }

  if (
    req.user.role === "executive" &&
    String(customer.assignedTo) !== String(req.user._id)
  ) {
    return res.status(403).json({
      success: false,
      message: "You cannot modify this customer",
    });
  }

  const allowedFields = ["name", "email", "phone", "company"];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      customer[field] = req.body[field];
    }
  });

  await customer.save();

  await Timeline.create({
    type: "note_added",
    message: `Customer information updated for ${customer.name}`,
    user: req.user._id,
    customer: customer._id,
  });

  res.status(200).json({
    success: true,
    message: "Customer updated successfully",
    customer,
  });
};
