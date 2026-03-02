const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const permissionMiddleware = require("../middleware/permission.middleware");

const { createEvent, updateEvent, deleteEvent, getEvents } = require("../controllers/events.controller");

router.post("/create-event", authMiddleware, permissionMiddleware("CREATE_EVENT"), createEvent);
router.put("/update-event/:id", authMiddleware, permissionMiddleware("UPDATE_EVENT"), updateEvent);
router.delete("/delete-event/:id", authMiddleware, permissionMiddleware("DELETE_EVENT"), deleteEvent);
router.get("/get-events", authMiddleware, permissionMiddleware("READ_EVENTS"), getEvents);

module.exports = router;