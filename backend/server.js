require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

app.get("/api/test", (req, res) => {
  res.json({ message: "Pozdrav sa servera! Backend radi!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server pokrenut na portu ${PORT}`));

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
