const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());

// Configure CORS
const corsOptions = {
  origin: "http://localhost:3000", // Replace with your frontend URL
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

const sessionSchema = new mongoose.Schema({
  focusTime: Number,
  breakTime: Number,
  tasks: [String],
  date: { type: Date, default: Date.now },
});

const Session = mongoose.model("Session", sessionSchema);

app.post("/api/sessions", async (req, res) => {
  try {
    const { focusTime, breakTime, tasks } = req.body;
    const newSession = new Session({ focusTime, breakTime, tasks });
    await newSession.save();
    res.status(201).json({ message: "Session saved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error saving session" });
  }
});

app.get("/api/sessions", async (req, res) => {
  try {
    const sessions = await Session.find();
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ error: "Error fetching sessions" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
