import { Router } from "express";
import { GridFSBucket, ObjectId } from "mongodb";
import multer from "multer";
import { Readable } from "stream";
import { gallery as db } from "../db/conn";

const galleryRouter = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Funcion para subir un archivo a la base de datos
function uploadFile(bucket, file, caption, portName) {
  return new Promise((resolve, reject) => {
    const filename = file.originalname;

    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        mimetype: file.mimetype,
        caption: caption,
        port: portName,
      },
    });

    // metodos del stream
    uploadStream.on("finish", (file) => resolve(file));
    uploadStream.on("error", () => reject("Error uploading image"));

    // readable que se conecta al uploadStream
    const readable = new Readable();
    readable.push(file.buffer);
    readable.push(null);
    readable.pipe(uploadStream);

    // posible error
    readable.on("error", (err) => {
      reject("Error reading image");
    });
  });
}

// Metodo que sube un archivo a la base de datos
galleryRouter.post("/gallery/:id", upload.array("files"), async (req, res) => {
  const id = req.params.id;

  const captions = req.body.captions;
  const portName = req.body.port;

  const bucket = new GridFSBucket(db, {
    bucketName: id,
  });

  if (req.files) {
    // Multer.File in []
    const uploadedPromises = req.files.map((file, index) => {
      // Obtiene el caption dependiendo si es un arreglo o no
      const caption = Array.isArray(captions) ? captions[index] : captions;
      // Sube el file
      return uploadFile(bucket, file, caption, portName);
    });

    Promise.all(uploadedPromises)
      .then((filesUploaded) => {
        res.send({
          status: true,
          mssg: "Uploaded completed succesfully!",
          files: filesUploaded,
        });
      })
      .catch((err) => {
        console.log("Error: ", err);
        res.send({
          status: false,
          mssg: "Something Happend! Image cannot upload",
        });
      });
  }
});

// Metodo que devuelve los docs de un arreglo de imagenes
galleryRouter.get("/gallery/:id/getBucketFilesData", async (req, res) => {
  const id = req.params.id;
  const bucket = new GridFSBucket(db, {
    bucketName: id,
  });
  let files = [];
  const cursor = bucket.find({});
  for await (const doc of cursor) {
    files.push(doc);
  }
  // res.sendStatus(404)
  res.send(files);
});

// Metodo que devuelve las imagenes
galleryRouter.get("/gallery/:registerId/:objectId", async (req, res) => {
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

  // stream.on('data', (chunk) => {
  //   console.log('data', chunk)
  //   const buff = Buffer.from(chunk).toString('base64');
  // })
});

// Metodo que elmina el bucket de una coleccion
galleryRouter.delete("/gallery/deleteBucket/:registerId", async (req, res) => {
  const registerId = req.params.registerId;
  const listOfCollection = await db.listCollections().toArray();
  let result = 0;
  for (let bucketPart of ["files", "chunks"]) {
    const obj = listOfCollection.find((coll) => {
      return coll.name === `${registerId}.${bucketPart}`;
    });
    if (obj) {
      db.collection(`${registerId}.${bucketPart}`).drop();
      result = 1;
    }
  }
  res.send({ bucketDroped: result });
});

// Metodo que elimina una imagen
galleryRouter.delete("/gallery/:registerId/:objectId", async (req, res) => {
  const registerId = req.params.registerId;
  const objectId = new ObjectId(req.params.objectId);
  //
  const bucket = new GridFSBucket(db, {
    bucketName: registerId,
  });
  //
  const file = await bucket.find({ _id: objectId }).toArray();
  if (file.length >= 1) {
    await bucket.delete(objectId);
    res.send(true);
  } else {
    res.send(false);
  }
});

/**
 * Metodo que edita las propiedades de una imagen
 */
galleryRouter.post("/gallery/editProperties/:registerId", async (req, res) => {
  try {
    const id = req.params.registerId;
    const body = req.body;

    const _id = new ObjectId(body._id);

    const result = await db.collection(`${id}.files`).updateOne(
      { _id: _id },
      {
        $set: {
          metadata: {
            port: body.port,
            caption: body.caption,
          },
        },
      }
    );
    res.send(result).status(200);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: false,
      message: "Internal Server Error: Triggered while editing properties",
    });
  }
});

export default galleryRouter;
