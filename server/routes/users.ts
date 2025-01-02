import { Router } from "express";
import { charts as db } from "../../db/connection.js";
import { ObjectId } from "mongodb";
// Encrypting passwords
import bcrypt from "bcrypt";
import { verifyKey } from "../../middlewares/verifyKey.js";

// Variables
const usersRouter = Router();
const collection = "users";

// Functions
function generateHexPassword() {
  return Math.floor(Math.random() * 0x1000000)
    .toString(16)
    .padStart(6, "0");
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

function generateTimestamp() {
  return new Date().toISOString();
}

// Function que genera una fecha de expiracion para el token desde
// el momento de la creacion del token hasta 7 dias despues
function generateExpirationDate() {
  const expirationDate = new Date();
  const durationInDays = 14;
  expirationDate.setDate(expirationDate.getDate() + durationInDays);
  return expirationDate.toISOString();
}

// Middleware
usersRouter.use("/users", verifyKey);

usersRouter.get("/users", async (req, res) => {
  try {
    const query = await db
      .collection(collection)
      .find(
        {},
        {
          projection: { username: 1, finishAt: 1 },
        }
      )
      .toArray();
    res.json({ message: "", data: query, log: null });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener los tokens", error: error.message });
  }
});

usersRouter.post("/users", async (req, res) => {
  try {
    const password = generateHexPassword();
    const hashedPassword = await hashPassword(password);
    const timestamp = generateTimestamp();
    const expirationDate = generateExpirationDate();
    // Trim the username
    let { username } = req.body;
    username = username.trim();

    let existingUser = await db.collection(collection).findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists." });
    }

    let query = await db.collection(collection).insertOne({
      username: username,
      password: hashedPassword,
      createdAt: timestamp,
      updatedAt: null,
      finishAt: expirationDate,
    });

    res.json({
      message: "Usuario creado con éxito",
      data: { username, password },
      log: query,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res
        .status(400)
        .json({
          message: "Error. El nombre de usuario ya existe.",
          code: error.code,
        });
    }
    res
      .status(500)
      .json({
        message: "Error. El servidor fallo al procesar la respuesta.",
        error: error.message,
      });
  }
});

usersRouter.put("/users/:_id", async (req, res) => {
  try {
    const _id = req.params._id;
    const timestamp = generateTimestamp();
    const expirationDate = generateExpirationDate();

    const query = await db.collection(collection).updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: { updatedAt: timestamp, finishAt: expirationDate },
      }
    );
    res.json({ message: "Token actualizado con éxito", log: query });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al actualizar el token", error: error.message });
  }
});

usersRouter.delete("/users/:_id", async (req, res) => {
  try {
    const _id = req.params._id;
    const query = await db
      .collection(collection)
      .deleteOne({ _id: new ObjectId(_id) });
    res.json({ message: "Usuario eliminado con éxito", log: query });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar el usuario", error: error.message });
  }
});

export default usersRouter;
