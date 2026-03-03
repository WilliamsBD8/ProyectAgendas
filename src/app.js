const express = require("express");
const swaggerUi = require("swagger-ui-express");
const authRoutes = require("./routes/auth.routes");
const securityRoutes = require("./routes/security.routes");
const sitesRoutes = require("./routes/sites.routes");
const eventsRoutes = require("./routes/events.routes");
const agendasRoutes = require("./routes/agendas.routes");
const ticketsRoutes = require("./routes/tickets.routes");
const notificationsRoutes = require("./routes/notifications.routes");
const surveysRoutes = require("./routes/surveys.routes");
const swaggerSpec = require("./docs/swagger");

const errorMiddleware = require("./middleware/error.middleware");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API de eventos" });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/security", securityRoutes);

app.use("/api/v1/sites", sitesRoutes);

app.use("/api/v1/events", eventsRoutes);

app.use("/api/v1/agendas", agendasRoutes);

app.use("/api/v1/tickets", ticketsRoutes);

app.use("/api/v1/notifications", notificationsRoutes);

app.use("/api/v1/surveys", surveysRoutes);

// 🔥 SIEMPRE EL ÚLTIMO
app.use(errorMiddleware);

module.exports = app;
