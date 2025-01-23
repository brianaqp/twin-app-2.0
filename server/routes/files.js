import { Router } from "express";
// Db
import { statistics as db } from "../db/conn.js";
import { db as repoDb } from "../db/conn.js";
// Functions
import { getWeekly, getUpcoming } from "../functions/statistics.js";
// Lib
import { fileURLToPath } from "url";
import path from "path";
import fs from "node:fs";
import XlsxPopulate from "xlsx-populate";
import { DateTime } from "luxon";
const filesRouter = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//
const pathFile = path.join(__dirname, "../", "assets", "file.xlsx");
const editedFilePath = path.join(__dirname, "../", "assets", "file-editado.xlsx");
//
const pathList = path.join(__dirname, "../", "assets", "list.xlsx");
const editedListPath = path.join(__dirname, "../", "assets", "list-editado.xlsx");
// Helper function to set cell values and styles
const setCellStyle = (cell, value, styles = {}) => {
    cell.value(value).style(styles);
};
// Helper function to write data to the sheet
const writeDataToSheet = (sheet, data) => {
    data.forEach((row, index) => {
        const rowIndex = index + 4; // Start from row 4
        const date = new Date(row.eta.year, row.eta.month - 1, row.eta.day);
        setCellStyle(sheet.cell(`A${rowIndex}`), row.vesselName);
        setCellStyle(sheet.cell(`B${rowIndex}`), new Date(date), {
            numberFormat: "dd/mm/yyyy",
        });
        setCellStyle(sheet.cell(`C${rowIndex}`), row.cargo);
        setCellStyle(sheet.cell(`D${rowIndex}`), row.tonnage);
        setCellStyle(sheet.cell(`E${rowIndex}`), row.importer);
        setCellStyle(sheet.cell(`F${rowIndex}`), row.trader);
        setCellStyle(sheet.cell(`G${rowIndex}`), row.loadingPort);
        setCellStyle(sheet.cell(`H${rowIndex}`), row.country);
        setCellStyle(sheet.cell(`I${rowIndex}`), row.dischargingPort);
        // Apply styles
        sheet.range(`A${rowIndex}:I${rowIndex}`).style({
            fontSize: 10,
            fontFamily: "Tahoma",
            horizontalAlignment: "center",
            verticalAlignment: "center",
            border: {
                top: { style: "thin", color: "2d3047" },
                bottom: { style: "thin", color: "2d3047" },
                left: { style: "thin", color: "2d3047" },
                right: { style: "thin", color: "2d3047" },
            },
            bold: false,
        });
        sheet.row(rowIndex).height(25);
    });
};
// Helper function to handle file download and deletion
const handleFileDownload = (res, filePath) => {
    res.download(filePath, "temp.xlsx", (error) => {
        if (error) {
            console.error("Error al enviar el archivo:", error);
            res
                .status(500)
                .json({ message: "Error al enviar el archivo", error: error.message });
        }
        else {
            console.log("Archivo enviado correctamente");
        }
        // Delete the file
        fs.unlink(filePath, (error) => {
            if (error) {
                console.error("Error al eliminar el archivo:", error);
            }
            else {
                console.log("Archivo eliminado correctamente");
            }
        });
    });
};
// 1. Validation already done it
async function writeDataOnExcel(data, subtitle, res) {
    // Read the file and populate data
    const workbook = await XlsxPopulate.fromFileAsync(pathFile);
    const sheet = workbook.sheet(0);
    // Set subtitle
    setCellStyle(sheet.cell("A2"), subtitle, {
        border: false,
        fontFamily: "Tahoma",
        fontSize: 14,
    });
    // Write inside the sheet
    writeDataToSheet(sheet, data);
    // Set grid lines
    sheet.gridLinesVisible(true);
    // Save the workbook
    await workbook.toFileAsync(editedFilePath);
}
// Route to generate and download Excel file
filesRouter.get("/files/excel/statistics/year/:year", async (req, res) => {
    try {
        const year = req.params.year;
        const data = await db.collection(year).find({}).toArray();
        // Validation
        if (data.length === 0) {
            return res.status(404).json({ message: "No hay datos para mostrar" });
        }
        // Write on excel
        await writeDataOnExcel(data, `Stadistics from year ${year}`, res);
        // Download to client
        handleFileDownload(res, editedFilePath);
    }
    catch (error) {
        console.error("Error al procesar el archivo:", error);
        res
            .status(500)
            .json({ message: "Error al procesar el archivo", error: error.message });
    }
});
// Download excel by upcoming
filesRouter.get("/files/excel/statistics/weekly", async (req, res) => {
    try {
        const data = await getWeekly();
        // Validation
        if (data.length === 0) {
            return res.status(404).json({ message: "No hay datos para mostrar" });
        }
        // Write data on Excel
        await writeDataOnExcel(data, 'Weekly update');
        // Donwload excel to client
        handleFileDownload(res, editedFilePath);
    }
    catch (e) {
        res.send({ message: "Error", error: e });
    }
});
// Download excel by weekly
filesRouter.get("/files/excel/statistics/upcoming", async (req, res) => {
    try {
        const data = await getUpcoming();
        // Validation
        if (data.length === 0) {
            return res.status(404).json({ message: "No hay datos para mostrar" });
        }
        // Write on excel data
        await writeDataOnExcel(data, 'Upcoming update', res);
        // Download to client
        handleFileDownload(res, editedFilePath);
    }
    catch (e) {
        res.send({ message: "Error", error: e });
    }
});
// --------------------------
// --- List of repos by year
filesRouter.get("/files/excel/vessels-served/:year", async (req, res) => {
    try {
        let inputYear = req.params.year;
        let vesselsList = await repoDb
            .collection("vessels")
            .find({}, {
            projection: {
                _id: 0,
                id: 1,
                name: "$shipParticulars.name",
            },
        })
            .toArray();
        let result = await repoDb
            .collection("registers")
            .aggregate([
            // Paso 1: Filtrar los documentos que coincidan con los IDs del arreglo local
            {
                $project: {
                    _id: 0,
                    id: 1,
                    vesselId: 1,
                    workingPorts: 1,
                    destinatarios: 1,
                },
            },
            // Paso 2: Añadir los datos locales (name) con $addFields
            {
                $addFields: {
                    vesselName: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: vesselsList, // Pasar tu arreglo local directamente aquí
                                    as: "local",
                                    cond: { $eq: ["$$local.id", "$vesselId"] }, // Condición para que coincidan los IDs
                                },
                            },
                            0,
                        ],
                    },
                },
            },
        ])
            .toArray();
        let mapValues = result.map((item) => {
            // arribo
            const [year, month] = item.id.split("-");
            const arribo = DateTime.fromFormat(`${year}-${month}`, "yy-MMM", {
                locale: "es",
            });
            const trader = item.destinatarios.find((i) => {
                return i.role == "Trader";
            });
            const operador = item.destinatarios.find((i) => {
                return i.role == "Armador";
            });
            return {
                puerto: item.workingPorts.join(", ").trim(),
                buque: item.vesselName.name,
                arribo: arribo.toFormat("MMM/yyyy"),
                refId: item.id,
                trader: trader ? trader.companie : "",
                operador: operador ? operador.companie : "",
                // Utility
                year: arribo.toFormat("yyyy"),
            };
        });
        mapValues = mapValues.filter((i) => {
            return inputYear === i.year;
        });
        // Read the file and populate data
        const workbook = await XlsxPopulate.fromFileAsync(pathList);
        const sheet = workbook.sheet(0);
        // Write data
        (() => {
            mapValues.forEach((row, index) => {
                const rowIndex = index + 7; // Start from row 7
                setCellStyle(sheet.cell(`A${rowIndex}`), row.puerto);
                setCellStyle(sheet.cell(`B${rowIndex}`), row.buque);
                setCellStyle(sheet.cell(`C${rowIndex}`), row.arribo);
                setCellStyle(sheet.cell(`D${rowIndex}`), row.refId);
                setCellStyle(sheet.cell(`E${rowIndex}`), row.trader);
                setCellStyle(sheet.cell(`F${rowIndex}`), row.operador);
                // Apply styles
                sheet.range(`A${rowIndex}:F${rowIndex}`).style({
                    fontSize: 10,
                    fontFamily: "Tahoma",
                    horizontalAlignment: "center",
                    verticalAlignment: "center",
                    wrapText: true,
                    border: {
                        top: { style: "thin", color: "2d3047" },
                        bottom: { style: "thin", color: "2d3047" },
                        left: { style: "thin", color: "2d3047" },
                        right: { style: "thin", color: "2d3047" },
                    },
                    bold: false,
                });
                sheet.row(rowIndex).height(25);
            });
        })();
        // Set grid lines
        sheet.gridLinesVisible(true);
        // Save the workbook
        await workbook.toFileAsync(editedListPath);
        // Send the file
        handleFileDownload(res, editedListPath);
    }
    catch (e) {
        res.send({ message: "Hubo un error", e });
    }
});
export default filesRouter;
