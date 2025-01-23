import { MongoClient } from "mongodb";
import "dotenv/config";
// 1. Variables
const conectionString = process.env.DB_CONNECTION;
if (!conectionString) {
    throw 'Error trying to connect to MongoDb. ConnectionString must be provided';
}
// 2. Client
const client = new MongoClient(conectionString);
// 3. Connection
let conection;
try {
    conection = await client.connect();
}
catch (e) {
    console.error(e);
}
// 4. Exportaciones
export const gallery = conection.db("gallery");
export const statistics = conection.db("statistics");
export const test = conection.db("test");
export const db = conection.db("twin-db");
