const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const permissionMiddleware = require("../middleware/permission.middleware");

const { createTicket, getTickets, validateTicket } = require("../controllers/tickets.controller");

router.post("/create-ticket", authMiddleware, permissionMiddleware("CREATE_TICKET"), createTicket);
router.get("/get-tickets", authMiddleware, permissionMiddleware("READ_TICKETS"), getTickets);
router.put("/validate-ticket/:codeQr", authMiddleware, permissionMiddleware("VALIDATE_TICKET"), validateTicket);

module.exports = router;
