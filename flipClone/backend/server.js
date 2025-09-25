import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { dirname } from "path";
import path from "path";

import morgan from "morgan";
import { v2 as cloudinary } from "cloudinary";
import fileUpload from "express-fileupload";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//local imports
import connectDB from "./config/database.js";
import { createError, errorHandler } from "./middleware/errorHandler.js";
import authRoute from "./routes/authRoute.js";
import productRoute from "./routes/productRoute.js";
import cartRoute from './routes/cartRoute.js'
import userRoute from "./routes/userRoute.js";

const app = express();

dotenv.config();
const PORT = process.env.PORT || 8080;

//configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_SECRET,
});

//&middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
// to send large files
app.use(
    fileUpload({
        limits: { fileSize: 50 * 1024 * 1024 },
    })
);
// use body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, "../client/dist")));

//connect DB
connectDB();



app.get("/", (req, res) => {
    res.send("Hello there!");
});

//routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/cart", cartRoute);
app.use("/api/v1/user", userRoute);


app.use((req, res, next) => {
//   res.status(404);
//   next(new Error(`🔍 Not Found - ${req.originalUrl}`));
next(createError(404, `🔍 Not Found - ${req.originalUrl}`))
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀🚀 SERVER RUNNING ON PORT ${PORT}`);
});
