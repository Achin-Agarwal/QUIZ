require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const cors = require("cors");

const PORT=process.env.PORT || 3000;

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Database connection error:", err);
  }
}

main();

app.set("view engine", "ejs");
app.set("views", "views");
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "VERYBAD", resave: false, saveUninitialized: true }));
app.use(cookieParser());
app.use(methodOverride("_method"));

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
});

const User = mongoose.model("User", UserSchema);
app.post("/signup", async (req, res) => {
  const { email } = req.body;
  console.log(req.body);
  // if (!email || !/\S+@\S+\.\S+/.test(email)) {
  //   return res.status(400).json({ message: "Invalid email format" });
  // }
  try {
    const user = new User({ email });
    await user.save();
    console.log(user);
    res.status(201).json({ message: "User created", email: user.email });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already in use" });
    }
    console.error("Error saving user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
