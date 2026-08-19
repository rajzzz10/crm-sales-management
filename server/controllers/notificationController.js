import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  const notifications = await Notification.find({
    user: req.user._id,
  })
    .populate("lead", "name")
    .populate("deal", "title stage")
    .populate("activity", "title status")
    .sort("-createdAt")
    .limit(50);

  res.status(200).json({
    success: true,
    notifications,
  });
};

export const markNotificationAsRead = async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found",
    });
  }

  notification.isRead = true;

  await notification.save();

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    notification,
  });
};

export const markAllNotificationsAsRead = async (req, res) => {
  await Notification.updateMany(
    {
      user: req.user._id,
      isRead: false,
    },
    {
      $set: { isRead: true },
    },
  );

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
  });
};
