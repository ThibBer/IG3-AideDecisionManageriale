import ExcelJS from "exceljs";

const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet("Sheet 1", {
    pageSetup: { paperSize: 9 },
});

function convertedData(data, n, isAfter = false) {
    const length = data.length;
    return data.map((line, i) => [
        isAfter && i === length - 1
            ? `[${i / 10}; ->`
            : `[${i / 10};${(i + 1) / 10}[`,
        line.ri,
        line.pi,
        line.pi * n,
        Math.pow(line.ri - n * line.pi, 2) / (n * line.pi),
    ]);
}

function setTable(table, data, n) {
    if (table === "before") {
        worksheet.addTable({
            name: "av_regr",
            // displayName: "Avant Regroupement",
            ref: "A1",
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
        worksheet.addTable({
            name: "ap_regr",
            // displayName: "Après Regroupement",
            ref: "H1",
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

function setKhi(khi2Obs, khi2) {
    worksheet.getCell("N1").value = "khi2Obs";
    worksheet.getCell("N2").value = khi2Obs;
    worksheet.getCell("O1").value = "khi2";
    worksheet.getCell("O2").value = khi2;
}

function save() {
    workbook.xlsx.writeFile("test.xlsx").then(function () {
        console.log("done");
    });
}

export { save, setTable, setKhi };
