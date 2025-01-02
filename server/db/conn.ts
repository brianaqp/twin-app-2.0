import { MongoClient } from "mongodb";
import dotenv from "dotenv";

// Import Env variables
dotenv.config();

let uri = process.env.MONGO_URI;

let client = new MongoClient(uri);
let statistics, charts;

try {
  await client.connect();
  statistics = client.db("statistics");
  charts = client.db("charts");
} catch (e) {
  console.error(`Error al conectar con mongoDB: \nError: ${e}`);
}

export { statistics, charts };
