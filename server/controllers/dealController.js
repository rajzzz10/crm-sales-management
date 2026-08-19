import Deal from "../models/Deal.js";
import Timeline from "../models/Timeline.js";
import Customer from "../models/Customer.js";

const stages = [
  "qualification",
  "discovery",
  "proposal",
  "negotiation",
  "won",
  "lost",
];

const stageOrder = {
  qualification: 1,
  discovery: 2,
  proposal: 3,
  negotiation: 4,
  won: 5,
  lost: 5,
};

export const getDeals = async (req, res) => {
  const {
    search,
    stage,
    assignedTo,
    minValue,
    maxValue,
    page = 1,
    limit = 10,
    sort = "-createdAt",
  } = req.query;

  const query = {};

  if (req.user.role === "executive") {
    query.assignedTo = req.user._id;
  }

  if (assignedTo && req.user.role !== "executive") {
    query.assignedTo = assignedTo;
  }

  if (stage) {
    query.stage = stage;
  }

  if (minValue || maxValue) {
    query.value = {};

    if (minValue) {
      query.value.$gte = Number(minValue);
    }

    if (maxValue) {
      query.value.$lte = Number(maxValue);
    }
  }

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.min(Math.max(Number(limit), 1), 100);
  const skip = (pageNumber - 1) * limitNumber;

  let dealsQuery = Deal.find(query)
    .populate("customer", "name email company")
    .populate("lead", "name email")
    .populate("assignedTo", "name email role");

  if (search) {
    const customers = await Customer.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    }).select("_id");

    const customerIds = customers.map((customer) => customer._id);

    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { customer: { $in: customerIds } },
    ];

    dealsQuery = Deal.find(query)
      .populate("customer", "name email company")
      .populate("lead", "name email")
      .populate("assignedTo", "name email role");
  }

  const [deals, total] = await Promise.all([
    dealsQuery.sort(sort).skip(skip).limit(limitNumber),

    Deal.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    deals,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  });
};

export const getDeal = async (req, res) => {
  const deal = await Deal.findById(req.params.id)
    .populate("customer", "name email phone company")
    .populate("lead", "name email source status")
    .populate("assignedTo", "name email role");

  if (!deal) {
    return res.status(404).json({
      success: false,
      message: "Deal not found",
    });
  }

  if (
    req.user.role === "executive" &&
    String(deal.assignedTo?._id) !== String(req.user._id)
  ) {
    return res.status(403).json({
      success: false,
      message: "You do not have access to this deal",
    });
  }

  res.status(200).json({
    success: true,
    deal,
  });
};

export const updateDeal = async (req, res) => {
  const deal = await Deal.findById(req.params.id);

  if (!deal) {
    return res.status(404).json({
      success: false,
      message: "Deal not found",
    });
  }

  if (
    req.user.role === "executive" &&
    String(deal.assignedTo) !== String(req.user._id)
  ) {
    return res.status(403).json({
      success: false,
      message: "You cannot modify this deal",
    });
  }

  if (req.body.title !== undefined) {
    deal.title = req.body.title;
  }

  if (req.body.value !== undefined) {
    const value = Number(req.body.value);

    if (!Number.isFinite(value) || value < 0) {
      return res.status(400).json({
        success: false,
        message: "Deal value must be a valid non-negative number",
      });
    }

    deal.value = value;
  }

  if (req.body.probability !== undefined) {
    const probability = Number(req.body.probability);

    if (!Number.isFinite(probability) || probability < 0 || probability > 100) {
      return res.status(400).json({
        success: false,
        message: "Probability must be between 0 and 100",
      });
    }

    deal.probability = probability;
  }

  if (req.body.expectedClosingDate !== undefined) {
    const closingDate = new Date(req.body.expectedClosingDate);

    if (Number.isNaN(closingDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid expected closing date",
      });
    }

    deal.expectedClosingDate = closingDate;
  }

  // Always calculate on backend.
  deal.expectedRevenue = deal.value * (deal.probability / 100);

  await deal.save();

  res.status(200).json({
    success: true,
    message: "Deal updated successfully",
    deal,
  });
};

export const updateDealStage = async (req, res) => {
  const { stage } = req.body;

  if (!stages.includes(stage)) {
    return res.status(400).json({
      success: false,
      message: "Invalid deal stage",
    });
  }

  const deal = await Deal.findById(req.params.id);

  if (!deal) {
    return res.status(404).json({
      success: false,
      message: "Deal not found",
    });
  }

  if (
    req.user.role === "executive" &&
    String(deal.assignedTo) !== String(req.user._id)
  ) {
    return res.status(403).json({
      success: false,
      message: "You cannot modify this deal",
    });
  }

  const oldStage = deal.stage;

  // Won/Lost are terminal stages.
  if (oldStage === "won" || oldStage === "lost") {
    return res.status(400).json({
      success: false,
      message: "A closed deal cannot be moved to another stage",
    });
  }

  // Don't allow moving backwards.
  if (stageOrder[stage] < stageOrder[oldStage]) {
    return res.status(400).json({
      success: false,
      message: "Deal cannot move backwards in the pipeline",
    });
  }

  deal.stage = stage;

  // Business rules for closed deals.
  if (stage === "won") {
    deal.probability = 100;
    deal.expectedRevenue = deal.value;
  }

  if (stage === "lost") {
    deal.probability = 0;
    deal.expectedRevenue = 0;
  }

  await deal.save();

  const timelineType =
    stage === "won" || stage === "lost" ? "deal_closed" : "deal_stage_changed";

  await Timeline.create({
    type: timelineType,
    message: `Deal stage changed from ${oldStage} to ${stage}`,
    user: req.user._id,
    deal: deal._id,
    customer: deal.customer,
    lead: deal.lead,
  });

  res.status(200).json({
    success: true,
    message: "Deal stage updated successfully",
    deal,
  });
};
