import { Router } from "express";
import { charts as db } from "../../db/connection.js";
import { statistics as stDb } from "../../db/connection.js";
import { ObjectId } from "mongodb";
import { verifyKey } from "../../middlewares/verifyKey.js";

const configRouter = Router();
const collection = "configuration";
const configDocumentId = "66a13d9e788b7cc39d37154b";

// MongoDB functions
async function collectionNotExists(db, collectionName) {
  const collections = await db
    .listCollections({ name: collectionName })
    .toArray();
  return collections.length < 1;
}

// Middleware
configRouter.use("/configuration", verifyKey);

configRouter.get("/configuration/availableYears", async (req, res) => {
  try {
    const query = await db
      .collection(collection)
      .findOne(
        { _id: new ObjectId(configDocumentId) },
        { projection: { _id: 0, availableYears: 1 } }
      );
    res.send({ message: "Data pulled successfully", data: query, log: null });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener los ", error: error.message });
  }
});

// Actualiza una configuracion de años
// Genera un ruta para insertar con agregacion el ano recibido en el parametro availableYears.
// Solo se inserta si existe una coleccion con el year en la configuracion.
configRouter.put("/configuration/availableYears/", async (req, res) => {
  try {
    const { year } = req.body;

    // Check if year is not defined
    if (!year) {
      throw new Error("Error: Year is not defined");
    }

    // Check if year exists in the statistics database
    if (await collectionNotExists(stDb, year)) {
      throw new Error("Error: Year does not exist");
    }

    // Query to insert the year
    const query = await db.collection(collection).updateOne(
      { _id: new ObjectId(configDocumentId) },
      {
        $addToSet: { availableYears: year },
      }
    );
    res.json({ message: "", data: null, log: query });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error al agregar el año", error: error.message });
  }
});

// Elimina un año de la configuracion
configRouter.delete("/configuration/availableYears/:year", async (req, res) => {
  try {
    const { year } = req.params;

    if (!year) {
      throw new Error("Error: Year is not defined');");
    }

    const query = await db.collection(collection).updateOne(
      { _id: new ObjectId(configDocumentId) },
      {
        $pull: { availableYears: year },
      }
    );
    res.json({ message: "", data: null, log: query });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar el año", error: error.message });
  }
});

export default configRouter;
