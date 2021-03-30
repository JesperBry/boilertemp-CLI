require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");

// require the const endpointName = require("./routes/api/endpointName"); here

const app = express();

// Middleware:
app.use(
  cors({
    origin: process.env.CORS_URL,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

// MongoDB config og connection
const db = require("./config/keys").mongoURI;

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

// Uses the routes from routes/api/items.js
//app.use("/api/endpointName", endpointName);

const port = process.env.PORT || 5000; // Sets port for server

app.listen(port, () => console.log(`Server started on port ${port}`));
