require("dotenv").config();
require("reflect-metadata"); // Must be loaded before TypeORM

const app = require("./app");
const AppDataSource = require("./config/db");

const PORT = process.env.PORT || 5000;

AppDataSource.initialize()
    .then(() => {
        console.log("PostgreSQL Database connected successfully via TypeORM!");
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Database connection failure:", error);
    });
