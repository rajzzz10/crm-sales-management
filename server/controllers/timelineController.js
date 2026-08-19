import Timeline from "../models/Timeline.js";

export const getTimeline = async (req, res) => {
  const { lead, customer, deal } = req.query;

  if (!lead && !customer && !deal) {
    return res.status(400).json({
      success: false,
      message: "Lead, customer or deal is required",
    });
  }

  const query = {};

  if (lead) query.lead = lead;
  if (customer) query.customer = customer;
  if (deal) query.deal = deal;

  const timeline = await Timeline.find(query)
    .populate("user", "name role")
    .populate("lead", "name")
    .populate("customer", "name")
    .populate("deal", "title stage")
    .sort({ createdAt: -1 })
    .limit(100);

  res.status(200).json({
    success: true,
    timeline,
  });
};
