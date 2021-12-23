import ExcelJS from "exceljs";
import logger from "./partie2/logger.js";

const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet("Test Carré Unité", {
    pageSetup: { paperSize: 9 },
});

function setInfo(alpha, m, a, c, x0) {
    // Paramètres
    worksheet.getCell("A1").value = "Paramètres";
    worksheet.getCell("A2").value = "alpha:";
    worksheet.getCell("B2").value = alpha;
    worksheet.getCell("A3").value = "m:";
    worksheet.getCell("B3").value = m;
    worksheet.getCell("A4").value = "a:";
    worksheet.getCell("B4").value = a;
    worksheet.getCell("A5").value = "c:";
    worksheet.getCell("B5").value = c;
    worksheet.getCell("A6").value = "x0:";
    worksheet.getCell("B6").value = x0;
    // H0 H1
    worksheet.getCell("D1").value = "Hypothèse";
    worksheet.mergeCells("D2:E2");
    worksheet.getCell("D2").value = "H0: La suite générée est acceptée";
    worksheet.mergeCells("D3:E3");
    worksheet.getCell("D3").value = "H1: La suite générée n'est pas acceptée";
}

function convertedData(data, n, isAfter = false) {
    const length = data.length;
    return data.map((line, i) => [
        isAfter && i === length - 1 ? `[${i / 10}; ->` : `[${i / 10};${(i + 1) / 10}[`,
        line.ri,
        line.pi,
        line.pi * n,
        Math.pow(line.ri - n * line.pi, 2) / (n * line.pi),
    ]);
}

function setTable(table, data, n) {
    if (table === "before") {
        worksheet.mergeCells("A12:B12");
        worksheet.getCell("A12").value = "Avant Regroupement";
        worksheet.addTable({
            name: "av_regr",
            // displayName: "Avant Regroupement",
            ref: "A13",
            headerRow: true,
            totalsRow: true,
            style: {
                theme: "TableStyleDark3",
                showRowStripes: true,
                showFirstColumn: true,
            },
            columns: [
                { name: "Xi", totalsRowLabel: "Totals:" },
                { name: "ri", totalsRowFunction: "sum" },
                { name: "pi", totalsRowFunction: "sum" },
                { name: "npi", totalsRowFunction: "sum" },
                { name: "(ri-npi)²/(npi)", totalsRowFunction: "sum" },
            ],
            rows: convertedData(data, n),
        });
    }
    if (table === "after") {
        worksheet.mergeCells("H12:I12");
        worksheet.getCell("H12").value = "Après Regroupement";
        worksheet.addTable({
            name: "ap_regr",
            // displayName: "Après Regroupement",
            ref: "H13",
            headerRow: true,
            totalsRow: true,
            style: {
                theme: "TableStyleDark3",
                showRowStripes: true,
            },
            columns: [
                { name: "Xi", totalsRowLabel: "Totals:" },
                { name: "ri", totalsRowFunction: "sum" },
                { name: "pi", totalsRowFunction: "sum" },
                { name: "npi", totalsRowFunction: "sum" },
                { name: "(ri-npi)²/(npi)", totalsRowFunction: "sum" },
            ],
            rows: convertedData(data, n, true),
        });
    }
}

function setKhi(khi2Obs, khi2, dl) {
    worksheet.getCell("G1").value = "khi2Obs";
    worksheet.getCell("G2").value = khi2Obs;
    worksheet.getCell("H1").value = "khi2";
    worksheet.getCell("H2").value = khi2;
    worksheet.getCell("I1").value = "dl";
    worksheet.getCell("I2").value = dl;
    worksheet.mergeCells("G3:H3");
    worksheet.getCell("G3").value = khi2Obs < khi2 ? "La suite est valide" : "La suite n'est pas valide";
}

function save() {
    workbook.xlsx.writeFile("testCarréUnité.xlsx").catch(logger.error);
}

export { save, setTable, setKhi, setInfo };
