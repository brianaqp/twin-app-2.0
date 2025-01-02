import { Router } from "express";
import { statistics as db } from "../../db/connection.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "node:fs";
import XlsxPopulate from "xlsx-populate";
import { verifyKey } from "../../middlewares/verifyKey.js";

const filesRouter = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pathFile = path.join(__dirname, "../..", "assets", "file.xlsx");
const editedFilePath = path.join(__dirname, "../..", "assets", "editado.xlsx");

// Middlewares
filesRouter.use("/files", verifyKey);

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
  res.download(filePath, "editado.xlsx", (error) => {
    if (error) {
      console.error("Error al enviar el archivo:", error);
      res
        .status(500)
        .json({ message: "Error al enviar el archivo", error: error.message });
    } else {
      console.log("Archivo enviado correctamente");
    }

    // Delete the file
    fs.unlink(filePath, (error) => {
      if (error) {
        console.error("Error al eliminar el archivo:", error);
      } else {
        console.log("Archivo eliminado correctamente");
      }
    });
  });
};

// Route to generate and download Excel file
filesRouter.get("/files/excel/:year", async (req, res) => {
  try {
    const year = req.params.year;
    const data = await db.collection(year).find({}).toArray();

    // Validation
    if (data.length === 0) {
      return res.status(404).json({ message: "No hay datos para mostrar" });
    }

    // Read the file and populate data
    const workbook = await XlsxPopulate.fromFileAsync(pathFile);
    const sheet = workbook.sheet(0);

    // Write title and subtitle
    setCellStyle(sheet.cell("A1"), "TWIN MARINE DE MÉXICO", {
      border: false,
      fontFamily: "Tahoma",
      fontSize: 16,
    });
    setCellStyle(sheet.cell("A2"), `Stadistics from ${year}`, {
      border: false,
      fontFamily: "Tahoma",
      fontSize: 14,
    });

    // Write data
    writeDataToSheet(sheet, data);

    // Set grid lines
    sheet.gridLinesVisible(true);

    // Save the workbook
    await workbook.toFileAsync(editedFilePath);

    // Send the file
    handleFileDownload(res, editedFilePath);
  } catch (error) {
    console.error("Error al procesar el archivo:", error);
    res
      .status(500)
      .json({ message: "Error al procesar el archivo", error: error.message });
  }
});

export default filesRouter;
