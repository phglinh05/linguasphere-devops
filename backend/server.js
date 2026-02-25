require("dotenv").config({path: '../.env'});
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const { authPageMiddleware } = require("./src/midlleware/authMiddleware");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '../frontend')));

mongoose.connect(process.env.MONGODB_URI).then(()=>console.log("MongoDB connected")).catch(err=>console.log(err))


app.use("/auth", require("./src/routes/authRoutes"));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/auth.html'));
});

app.get("/dashboard", authPageMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/dashboard.html'));
});

app.listen(process.env.PORT, () =>{
    console.log(`Server running on port ${process.env.PORT}`);
})