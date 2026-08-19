import mongoose from "mongoose";

const dealSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Deal title is required"],
      trim: true,
      maxlength: [150, "Deal title cannot exceed 150 characters"],
    },

    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    value: {
      type: Number,
      required: [true, "Deal value is required"],
      min: [0, "Deal value cannot be negative"],
    },

    probability: {
      type: Number,
      required: true,
      min: [0, "Probability cannot be below 0"],
      max: [100, "Probability cannot exceed 100"],
      default: 0,
    },

    expectedRevenue: {
      type: Number,
      required: true,
      min: [0, "Expected revenue cannot be negative"],
    },

    expectedClosingDate: {
      type: Date,
      required: true,
    },

    stage: {
      type: String,
      enum: [
        "qualification",
        "discovery",
        "proposal",
        "negotiation",
        "won",
        "lost",
      ],
      default: "qualification",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

dealSchema.index({ stage: 1, assignedTo: 1 });
dealSchema.index({ createdAt: -1 });
dealSchema.index({ expectedClosingDate: 1 });

const Deal = mongoose.model("Deal", dealSchema);

export default Deal;
