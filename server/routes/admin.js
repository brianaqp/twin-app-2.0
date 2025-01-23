import { Router } from "express";
import { db } from "../db/conn.js";
import { ObjectId } from "mongodb";
const adminRouter = Router();
// TODO: Change the way bucket files are stored.
// Funcion para resetear los ids de la base de datos
adminRouter.post("/admin/resetIds", async (req, res, next) => {
    try {
        const [registers, vessels] = await Promise.all([
            db
                .collection("registers")
                .find({}, {
                projection: {
                    id: 1,
                    registerCount: 1,
                    vesselId: 1,
                },
            })
                .toArray(),
            db
                .collection("vessels")
                .find({}, {
                projection: {
                    id: 1,
                    registers: 1,
                },
            })
                .toArray(),
        ]);
        const getTimestampFromDate = (id) => {
            return new ObjectId(id).getTimestamp();
        };
        let orderedDocs = registers.sort((a, b) => {
            return getTimestampFromDate(a._id) - getTimestampFromDate(b._id);
        });
        vessels.forEach((vessel) => {
            vessel.registers = [];
        });
        const registerUpdates = [];
        const vesselUpdates = [];
        orderedDocs = orderedDocs.forEach((doc, index) => {
            // --- count element ---
            const count = (index + 1).toString().padStart(3, "0");
            // --- id changes ---
            let idParts = doc.id.split("-");
            idParts[2] = count;
            const newId = idParts.join("-");
            // --- update vessel ---
            const vessel = vessels.find((vessel) => vessel.id === doc.vesselId);
            if (vessel)
                vessel.registers.push(newId);
            registerUpdates.push({
                updateOne: {
                    filter: { _id: doc._id },
                    update: { $set: { id: newId, registerCount: index + 1 } },
                },
            });
        });
        vessels.forEach((vessel) => {
            vesselUpdates.push({
                updateOne: {
                    filter: { _id: vessel._id },
                    update: { $set: { registers: vessel.registers } },
                },
            });
        });
        await Promise.all([
            db.collection("registers").bulkWrite(registerUpdates),
            db.collection("vessels").bulkWrite(vesselUpdates),
        ]);
        res.send({ mssg: "ok" });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
    }
});
adminRouter.get("/admin/delete90DaysImages", async (req, res) => {
    // TODO: Cambiar la estructura de GRIDFS para que solo sea una galeria
    // en el aplicativo. Es mas facil manejarlo de la manera que MongoDB recomienda.
    res.send({ mssg: "Endpoint not implemented" });
});
export default adminRouter;
