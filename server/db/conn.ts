import { MongoClient } from "mongodb";

// 1. Variables
const conectionString =
  "mongodb+srv://brianqp:123@cluster0.bcftyys.mongodb.net/test";

// 2. Client
const client =
  new MongoClient(conectionString, {
    useUnifiedTopology: true,
  }) || null;

// 2. Functiones principales
let conection;
try {
  conection = await client.connect();
} catch (e) {
  console.error(e);
}

// 4. Exportaciones
export const gallery = conection.db("gallery");
export const statistics = conection.db("statistics");
export const test = conection.db("test");
export const db = conection.db("twin-db");
