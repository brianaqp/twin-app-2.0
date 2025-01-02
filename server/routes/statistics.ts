import { Router } from "express";
import { MongoAPIError, ObjectId } from "mongodb";
import { statistics as db } from "../db/conn.js";
import { DateTime } from "luxon";
// Import functions
import { getWeekly, getUpcoming } from "../functions/statistics.js";

/**
 * Funcion que elimina una colección si no tiene documentos
 * @param year Año de la colección a eliminar
 */
async function checkAndDropCollection(year) {
  try {
    const count = await db.collection(year).countDocuments();
    if (count === 0) {
      await db.collection(year).drop();
    }
  } catch (error) {
    console.log({
      message: "Error al eliminar la colección",
      error: error.message,
    });
  }
}

const statisticsRouter = Router();
// Validaciones de los datos dentro del server

/**
 * Metodo que termina por procesar el objeto recorriendo sus propiedades y hace dos cosas.
 * - Aplica un trim.
 * - Convierte a mayúsculas.
 * - Agrega un timestamp
 * @param {} data Objeo de tipo estadisticas
 * @returns Objeto de tipo estadisticas con los espacios en blanco eliminados.
 */
function preprocessingData(data) {
  const trimmedData = { ...data };
  const keys = Object.keys(trimmedData);
  keys.forEach((key) => {
    if (typeof trimmedData[key] === "string") {
      trimmedData[key] = trimmedData[key].trim().toUpperCase();
    }
    return;
  });
  trimmedData.timestamp = DateTime.now().toISO();
  return trimmedData;
}

// --- GET METHODS
// Metodo que retorna los años de las colecciones,
statisticsRouter.get("/statistics/years", async (req, res) => {
  try {
    const query = await db.collections();
    const years = query.map((item) => item.collectionName);
    const orderedYears = years.sort((a, b) => b - a);
    res.json({ data: orderedYears, message: "" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al recuperar los datos", error: error.message });
  }
});

statisticsRouter.get("/statistics/weekly", async (req, res) => {
  try {
    let result = await getWeekly();
    res.send({ data: result, message: "", log: null });
  } catch (e) {
    res.status(404).send({ message: e });
  }
});

statisticsRouter.get("/statistics/upcoming", async (req, res) => {
  try {
    let result = await getUpcoming();
    res.send({ data: result, message: "", log: null });
  } catch (e) {
    res.status(404).send({ message: e });
  }
});

// Pull distinct
statisticsRouter.get("/statistics/distinct/:property", async (req, res) => {
  try {
    const propertyName = req.params.property;
    const collectionsQuery = await db.collections();
    const years = collectionsQuery.map((item) => item.collectionName);

    let distinctValues = new Set(); // Usar un Set para almacenar valores únicos

    for (let year of years) {
      const values = await db.collection(year).distinct(propertyName);
      values.forEach((value) => distinctValues.add(value));
    }

    res.json({
      message: "Pull autocomplete succesfully",
      data: { data: Array.from(distinctValues), field: propertyName },
      log: null,
    }); // Convertir el Set a Array para la respuesta
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al recuperar los datos", error: error.message });
  }
});


statisticsRouter.get("/statistics/:year", async (req, res) => {
  try {
    const year = req.params.year;
    const query = await db.collection(year).find({}).toArray();
    res.json({ data: query });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al recuperar los datos", error: error.message });
  }
});


// --- POST METHODS
// Insert a new item to db
statisticsRouter.post("/statistics/:year", async (req, res) => {
  try {
    const year = req.params.year;
    const newDocument = req.body;
    const processedDocument = preprocessingData(newDocument);

    let result = await db.collection(year).insertOne(processedDocument);
    const _id = result.insertedId.toString();

    res
      .status(201)
      .send({ message: "Documento creado con éxito.", data: _id, log: result });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error al insertar el documento en la base de datos.",
      error: error.message,
    });
  }
});

// --- DELETE METHODS
statisticsRouter.delete("/statistics/:year/:id", async (req, res) => {
  try {
    const paramsId = req.params.id;
    const _id = new ObjectId(paramsId);
    const year = req.params.year;

    const result = await db.collection(year).deleteOne({ _id: _id });

    res.json({
      message: "Documento eliminado con éxito",
      data: null,
      log: result,
    });
    // Logica para eliminar la coleccion si no hay documentos
    checkAndDropCollection(year);
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar el documento",
      error: error.message,
    });
  }
});

// --- EDIT METHODS
statisticsRouter.put("/statistics/:year/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const collectionYear = req.params.year;
    const updateDocument = req.body;

    // Delete unmutable fields
    delete updateDocument._id;

    // Fields and document validation
    if (!id || !updateDocument) {
      throw new Error("Datos de actualiacion faltantes");
    }

    // Prepare all properties for update
    const processedDocument = preprocessingData(updateDocument);

    // --- Update process
    let result;
    let currentYear = processedDocument.eta.year.toString();
    // Si hubo un cambio en el año, se inicia un proceso de cambio de colección.
    if (currentYear !== collectionYear) {
      let insertResult = await db
        .collection(currentYear)
        .insertOne(processedDocument);
      // Si no se insert el documento en la nueva colección, se debe regresar un error
      if (!insertResult.insertedId) {
        throw new Error(
          "Error al mover el documento a la colección correspondiente. 01",
        );
      }

      // Si se inserto el documento en la nueva colección, se debe eliminar el documento de la colección original
      let deleteResult = await db
        .collection(collectionYear)
        .deleteOne({ _id: new ObjectId(id) });
      // Si no se elimino el documento de la colección original, se debe regresar un error
      if (!deleteResult.deletedCount) {
        throw new Error(
          "Error al mover el documento a la colección correspondiente. 02",
        );
      }

      // Store the result of the delete operation
      result = {
        modified: 1,
        properties: { year: currentYear, objectId: insertResult.insertedId },
      };

      // Si se elimino el documento de la colección original, se debe verificar si la colección original ya no tiene documentos
      checkAndDropCollection(collectionYear);
    } else {
      // En caso de ser el mismo año, se actualiza el documento en la colección actual.
      let updateResult = await db
        .collection(collectionYear)
        .updateOne({ _id: new ObjectId(id) }, { $set: processedDocument });
      result = { modified: updateResult.modifiedCount, properties: null };
    }

    // En caso de que todo haya salido bien, se debe regresar el documento actualizado
    res.send({
      data: updateDocument,
      message: "Documento actualizado con éxito",
      log: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error al actualizar el documento",
      error: error.message,
    });
  }
});

export default statisticsRouter;
