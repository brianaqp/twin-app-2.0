import { statistics as db } from "../db/conn.js";
import { DateTime } from "luxon";
/**
 * Metodo que realiza una agregacion aplicando un parametro $match
 * @param {*} collectionYear
 * @param {*} $match
 * @returns Arreglo de estadisticas
 */
async function matchStatistics(collectionYear, query) {
    return await db
        .collection(`${collectionYear}`)
        .aggregate([
        {
            $addFields: {
                time: {
                    $toLong: {
                        $dateFromParts: {
                            year: "$eta.year",
                            month: "$eta.month",
                            day: "$eta.day",
                        },
                    },
                },
            },
        },
        {
            $match: query,
        },
    ])
        .toArray();
}
/**
 * Funcion que retorna la data entre dos periodos de tiempo
 * @param {*} startDate
 * @param {*} endDate
 * @returns
 */
async function getDataByPeriod(startDate, endDate) {
    let result;
    // Different year
    if (startDate.year !== endDate.year) {
        // Split into two petitions
        const result1 = await matchStatistics(startDate.year, {
            time: {
                $gte: startDate.toMillis(),
            },
        });
        // 1. First year
        const result2 = await matchStatistics(endDate.year, {
            time: {
                $lte: endDate.toMillis(),
            },
        });
        result = [].concat(result1, result2);
    }
    else {
        // Todo en el mismo año
        result = await matchStatistics(startDate.year, {
            time: {
                $gte: startDate.toMillis(), // Comparar directamente con el valor de startDate en milisegundos
                $lte: endDate.toMillis(), // Comparar directamente con el valor de endDate en milisegundos
            },
        });
    }
    return result;
}
async function getWeekly() {
    const startDate = DateTime.now().minus({ days: 3 });
    const endDate = startDate.plus({ days: 10 });
    return await getDataByPeriod(startDate, endDate);
}
async function getUpcoming() {
    const startDate = DateTime.now().minus({ days: 3 });
    const endDate = startDate.plus({ months: 6 });
    return await getDataByPeriod(startDate, endDate);
}
export { getWeekly, getUpcoming };
