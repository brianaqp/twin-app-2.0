// imports
import express from "express";
import cors from "cors";
import morgan from "morgan";
// routes
import mgRouter from "./routes/mongo.js";
import galleryRouter from "./routes/gallery.js";
// middlewares
import bodyParser from "body-parser";
import publicRouter from "./routes/public.js";
import statisticsRouter from "./routes/statistics.js";
import adminRouter from "./routes/admin.js";
import filesRouter from "./routes/files.js";

const app = express();
const PORT = 3200;

// middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "100mb" }));
app.use(bodyParser.raw({ type: "application/octet-stream" }));

app.get("/", (req, res) => {
  res.send("Server running...");
});

// routes
app.use(publicRouter);
app.use(mgRouter);
app.use(galleryRouter);
app.use(statisticsRouter);
app.use(filesRouter);
app.use(adminRouter);

//settings
app.set("port", process.env.PORT || PORT);

app.listen(app.get("port"), () => {
  console.log(`App serving on port: ${app.get("port")}`);
});
