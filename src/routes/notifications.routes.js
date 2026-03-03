const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const permissionMiddleware = require("../middleware/permission.middleware");

const { createNotification, getNotifications, markNotificationAsRead } = require("../controllers/notifications.controller");

router.post("/create-notification", authMiddleware, permissionMiddleware("CREATE_NOTIFICATION"), createNotification);
router.get("/get-notifications", authMiddleware, permissionMiddleware("READ_NOTIFICATIONS"), getNotifications);
router.put("/mark-notification-as-read/:id", authMiddleware, permissionMiddleware("UPDATE_NOTIFICATION"), markNotificationAsRead);

module.exports = router;
