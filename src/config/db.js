require("dotenv").config();
require("reflect-metadata");
const { DataSource } = require("typeorm");
const path = require("path");

const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || "postgres",
    password: String(process.env.DB_PASSWORD || ""),
    database: process.env.DB_NAME || "hospital_db",
    synchronize: false,
    logging: process.env.NODE_ENV === "development",
  
    entities: [path.join(__dirname, "../modules/**/*.entity.js")],
    migrations: [path.join(__dirname, "../migrations/*.js")],
    subscribers: [],
});

module.exports = AppDataSource;
