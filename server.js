const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());

const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_URL_PROD
      : process.env.FRONTEND_URL_DEV,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

const brandSchema = new mongoose.Schema({
  name: String,
});

const milestoneSchema = new mongoose.Schema({
  name: String,
});

const sessionSchema = new mongoose.Schema({
  focusTime: Number,
  breakTime: Number,
  tasks: [
    {
      task: String,
      brand: {
        title: String,
        milestone: String,
      },
    },
  ],
  date: { type: Date, default: Date.now },
});

const Brand = mongoose.model("Brand", brandSchema);
const Milestone = mongoose.model("Milestone", milestoneSchema);
const Session = mongoose.model("Session", sessionSchema);

app.post("/api/sessions", async (req, res) => {
  try {
    const { focusTime, breakTime, tasks } = req.body;
    const newSession = new Session({
      focusTime,
      breakTime,
      tasks: tasks.map((task) => ({
        task: task.task,
        brand: {
          title: task.brand.title,
          milestone: task.brand.milestone,
        },
      })),
    });
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

app.post("/api/brands", async (req, res) => {
  try {
    const { name } = req.body;
    const newBrand = new Brand({ name });
    await newBrand.save();
    res.status(201).json({ message: "Brand saved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error saving brand" });
  }
});

app.get("/api/brands", async (req, res) => {
  try {
    console.log("Fetching brands...");
    const brands = await Brand.find();
    console.log("Brands fetched:", brands);
    res.status(200).json(brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({ error: "Error fetching brands" });
  }
});

app.post("/api/milestones", async (req, res) => {
  try {
    const { name } = req.body;
    const newMilestone = new Milestone({ name });
    await newMilestone.save();
    res.status(201).json({ message: "Milestone saved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error saving milestone" });
  }
});

app.get("/api/milestones", async (req, res) => {
  try {
    const milestones = await Milestone.find();

    res.status(200).json(milestones);
  } catch (error) {
    console.error("Error fetching milestones:", error);
    res.status(500).json({ error: "Error fetching milestones" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
