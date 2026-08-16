require("dotenv").config();
require("reflect-metadata"); // Must be loaded before TypeORM

const logger = require("pino")();
const app = require("./app");
const AppDataSource = require("./config/db");
const initAppointmentEscalationCron = require("./common/crons/appointment-escalation.cron");

const PORT = process.env.PORT || 5000;

AppDataSource.initialize()
  .then(() => {
    logger.info("PostgreSQL Database connected successfully via TypeORM!");

    initAppointmentEscalationCron();

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error({ error }, "Database connection failure");
  });
