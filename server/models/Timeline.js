import mongoose from "mongoose";

const timelineSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "lead_created",
        "lead_assigned",
        "lead_status_changed",
        "note_added",
        "follow_up_created",
        "lead_converted",
        "deal_created",
        "deal_stage_changed",
        "deal_closed",
      ],
      required: true,
    },

    message: {
      type: String,
      required: [true, "Timeline message is required"],
      trim: true,
      maxlength: [500, "Timeline message cannot exceed 500 characters"],
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
      index: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
      index: true,
    },

    deal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deal",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

timelineSchema.index({ lead: 1, createdAt: -1 });
timelineSchema.index({ customer: 1, createdAt: -1 });
timelineSchema.index({ deal: 1, createdAt: -1 });

const Timeline = mongoose.model("Timeline", timelineSchema);

export default Timeline;
