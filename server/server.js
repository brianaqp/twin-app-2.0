// imports
import express from "express";
import cors from "cors";
import morgan from "morgan";
// routes
import mgRouter from "./routes/mongo";
import galleryRouter from "./routes/gallery";
// middlewares
import bodyParser from "body-parser";
import publicRouter from "./routes/public";
import statisticsRouter from "./routes/statistics";
import adminRouter from "./routes/admin";
import filesRouter from "./routes/files";
// Auth
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDistPath } from "./functions/utils";
const app = express();
const PORT = 3200;
// Security
const firebaseConfig = {
    apiKey: "AIzaSyA6Y44g84TqfI7i17U4tcDSjOS9rgtJiF4",
    authDomain: "twin-47464.firebaseapp.com",
    projectId: "twin-47464",
    storageBucket: "twin-47464.firebasestorage.app",
    messagingSenderId: "883986157924",
    appId: "1:883986157924:web:a8d142792e6b68028e2a71",
    measurementId: "G-5HMN9EPHW7"
};
const firebaseClient = initializeApp(firebaseConfig);
const auth = getAuth(firebaseClient);
// middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "100mb" }));
app.use(bodyParser.raw({ type: "application/octet-stream" }));
app.use("/", express.static(getDistPath()));
app.use("/api", async (req, res, next) => {
    try {
        const token = req.headers['x-authentication-token'] || req.headers['X-Authentication-Token'];
        if (!token || typeof token !== "string") {
            throw new Error('Token must be provided!');
        }
        const decodedIdToken = await auth.verifyIdToken(token);
        // @ts-ignore
        req.user = decodedIdToken.uid;
        next();
    }
    catch (error) {
        next(res.status(401).send({ message: "Not auth" }));
    }
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
