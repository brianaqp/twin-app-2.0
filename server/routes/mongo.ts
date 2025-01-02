import { Router } from "express";
import { db } from "../db/conn"; // change if production

const mgRouter = Router();

mgRouter.all("/repositories", async (req, res, next) => {
  res.json({ message: "must specify a collecion" });
});

mgRouter.use("/repositories/:collection", async (req, res, next) => {
  // check if params.collection is registers or vessels
  const collection = req.params.collection;
  if (collection !== "registers" && collection !== "vessels") {
    console.log(collection);
    res.json({ message: "invalid collection" });
  } else {
    next();
  }
});

// ------------------- GET METHODS  -------------------
mgRouter.get("/repositories/:collection", async (req, res) => {
  const collection = req.params.collection;
  let projection = { _id: 0, ...req.query };
  for (let field in projection) {
    projection[field] = parseInt(projection[field]);
  }
  const data = await db
    .collection(collection)
    .find({}, { projection })
    .hint({ $natural: -1 })
    .toArray();

  res.json(data);
});

mgRouter.get(
  "/repositories/:collection/getLastRegisterCount",
  async (req, res) => {
    const collection = req.params.collection;
    const data = await db.collection(collection).findOne(
      {},
      {
        sort: { registerCount: -1 },
        // projection: { _id: 0, registerCount: 1 }
      }
    );
    console.log(data);
    res.json(data);
  }
);

// FindOne
mgRouter.get("/repositories/:collection/findOne/:id", async (req, res) => {
  const collection = req.params.collection;
  let projection = { _id: 0, ...req.query };
  for (let field in projection) {
    projection[field] = parseInt(projection[field]);
  }
  const id = req.params.id;
  const data = await db
    .collection(collection)
    .findOne({ id: id }, { projection });
  res.json(data);
});

// Returns the count of documents in a collection by year (using regex)
mgRouter.get(
  "/repositories/:collection/getDocsByYear/:year",
  async (req, res) => {
    try {
      const collection = req.params.collection;
      const year = req.params.year;

      const count = await db
        .collection(collection)
        .countDocuments({ id: new RegExp(`^${year}`) });

      res.json({ count });
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ message: "Error counting docs by year", error: err });
    }
  }
);

// Metodo que devuelve un arreglo de strings de un campo en particular
mgRouter.get("/repositories/:collection/getField/:field", async (req, res) => {
  try {
    const collection = req.params.collection;
    const field = req.params.field.replace(/_/g, ".");
    const data = await db.collection(collection).distinct(field);
    res.json(data);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al recuperar la informacion", error: err });
  }
});

// Metodo que devuelve un arreglo de la razon social de los clientes
mgRouter.get("/repositories/registers/getSocialReasons", async (req, res) => {
  try {
    const collection = "registers";
    const registers = await db
      .collection(collection)
      .find({}, { projection: { _id: 0, reports: 1 } })
      .toArray();

    let data = [];
    for (let register of registers) {
      // Loop through reports in
      Object.values(register.reports).forEach((port) => {
        port.data.receiversData.receivers.forEach((receiver) => {
          const text = receiver.razonSocial;
          // Validation
          if (typeof text !== "string") return;
          if (text === "") return;
          // Process text
          const trimmed = text.trim();
          // Check if text is already in data
          if (data.includes(trimmed)) return;
          // Add text to data
          data.push(trimmed);
        });
      });
    }
    res.json({ sucess: true, data: data });
  } catch (err) {
    res.status(500).json({
      sucess: false,
      message: "Error al recuperar la informacion",
      data: [],
    });
  }
});

// testing endpoint
mgRouter.get("/repositories/:collection/test", async (req, res) => {
  res.json({ message: "test endpoint" });
});
// ------------------- PUT METHODS  -------------------
mgRouter.put("/repositories/:collection/:id", async (req, res) => {
  const collection = req.params.collection;
  const id = req.params.id;
  const updateDocument = req.body.item;
  const upsert = req.body.upsert;
  let result = await db
    .collection(collection)
    .updateOne({ id: id }, { $set: { ...updateDocument } }, { upsert: upsert });
  console.log(result);
  res.send(result).status(204);
});

// Metodo para actualizar los registros asociados dentro de un barco
mgRouter.put("/repositories/vessels/:id/registers", async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    let result = await db
      .collection("vessels")
      .updateOne({ id: id }, { $addToSet: { registers: body.id } });
    res.send(result).status(204);
  } catch (err) {
    res.status(500).json({
      message: "Error al asociar un nuevo registro a un vessel.",
      error: err,
    });
  }
});

mgRouter.put("/repositories/:collection/updateTimes/:id", async (req, res) => {
  const collection = req.params.collection;
  const id = req.params.id;
  const body = req.body;
  const str = `reports.${body.port}`;
  // Estaria bien añadir una condicional. (Aqui o en Angular)
  // 1. Si no existe el valor, se añade con $push
  // 2. Si existe, modificarlo con:
  // $set: {'Veracruz.$': data}
  let result = await db.collection(collection).updateOne(
    { id: id },
    {
      $set: {
        [str]: {
          times: body.updatedData.times,
          data: body.updatedData.data,
          quantities: body.updatedData.quantities,
          holdCargos: body.updatedData.holdCargos,
        },
        distribucionEmbarque: body.distribucionEmbarque,
      },
    }
  );
  console.log(result);
  res.send(result).status(204);
});

// ------------------- POST METHODS  -------------------
mgRouter.post("/repositories/:collection/insertOne", async (req, res) => {
  try {
    console.log("inside insertOne");
    const collection = req.params.collection;
    const newDocument = req.body;
    let result = await db.collection(collection).insertOne(newDocument);
    res.send(result).status(204);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al insertar el documento", error: err });
  }
});

// ------------------- DELETE METHODS  -------------------
mgRouter.delete("/repositories/:collection/:id", async (req, res) => {
  const collection = req.params.collection;
  const documentId = req.params.id;
  let result = await db.collection(collection).deleteOne({ id: documentId });
  console.log(result);
  res.send(result).status(204);
});

export default mgRouter;
