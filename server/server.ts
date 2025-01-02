import express from "express";
import cors from "cors";
import morgan from "morgan";
// Routes
import statisticsRouter from "./routes/private/statistics.js";
import filesRouter from "./routes/private/files.js";
import configRouter from "./routes/private/charts.js";
import usersRouter from "./routes/private/users.js";
// Public routes
import { publicChartsRouter } from "./routes/public/public_charts.js";
import { verifyKey } from "./middlewares/verifyKey.js";

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Private routes
app.use(statisticsRouter);
app.use(usersRouter);
app.use(configRouter);
app.use(filesRouter);
// Public routes
app.use(publicChartsRouter);

app.use("/", (req, res) => {
  res.send({ message: 404 });
});

app.listen(PORT, () => {
  console.log("Server running at port", PORT);
});
