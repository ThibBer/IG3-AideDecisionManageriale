import fs from "fs";
import path from "path";

const __dirname = path.resolve();

const MAX_DL = 50;
const SEPARATOR = ",";

const filepath = "./khi2Table.csv";
let dataFile;
try {
    dataFile = fs.readFileSync(filepath, "utf8");
} catch (err) {
    console.error(err);
}
const data = dataFile.split("\r\n");
// extract alpha
const alphas = data
    .shift()
    .split(SEPARATOR)
    .slice(1)
    .map((h) => parseFloat(h));

const table = data.map((line) =>
    line
        .split(SEPARATOR)
        .slice(1)
        .map((cell) => parseFloat(cell))
);

function getKhi2(alpha, dl) {
    if (dl > MAX_DL) throw new Error("DL too high");
    if (dl < 1) throw new Error("DL too low");
    const iAlpha = alphas.indexOf(alpha);
    const iDl = dl - 1;
    if (iAlpha === -1) throw new Error("Unknown alpha");

    const khi2 = table[iDl][iAlpha];
    return khi2;
}

export { getKhi2 };
