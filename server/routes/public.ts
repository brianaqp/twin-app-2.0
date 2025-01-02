import { Router } from "express";
import { GridFSBucket, ObjectId } from "mongodb";
import { gallery as db } from "../db/conn.js";

const publicRouter = Router();

// Metodo que devuelve los docs de un arreglo de imagenes
publicRouter.get("/public/gallery/:id/getBucketFilesData", async (req, res) => {
  const id = req.params.id;
  const bucket = new GridFSBucket(db, {
    bucketName: id,
  });
  let files = [];
  const cursor = bucket.find({});
  for await (const doc of cursor) {
    files.push(doc);
  }
  res.send(files);
});

// Metodo que devuelve las imagenes
publicRouter.get("/public/gallery/:registerId/:objectId", async (req, res) => {
  const registerId = req.params.registerId;
  const objectId = new ObjectId(req.params.objectId);
  const bucket = new GridFSBucket(db, {
    bucketName: registerId,
  });

  const stream = bucket.openDownloadStream(objectId);

  stream.on("data", (chunk) => {
    console.log("chunk donwloaded!");
    res.write(chunk);
  });

  stream.on("end", () => {
    console.log("file downloaded succesfuly!");
    res.end();
  });
});

export default publicRouter;
