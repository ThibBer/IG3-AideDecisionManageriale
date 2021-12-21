import crypto from "crypto";
import fs from "fs";
import os from "os";
import readline from "readline";

const rootPath = "./findBest/results/";
async function getParameters(mMin) {
    const paths = await fs.promises.readdir(rootPath);
    const validPaths = validFiles(mMin, paths);
    const nFile = crypto.randomInt(0, validPaths.length);
    const path = `./findBest/results/${validPaths[nFile]}`;
    const fileStream = fs.createReadStream(path);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });
    let m, a, c, x0;
    for await (const line of rl) {
        if (line === "" || line === os.EOL) return { m, a, c, x0 };
        [m, a, c, x0] = line.split(", ").map(Number);
        if (m >= mMin && crypto.randomInt(0, 100) < 25) {
            return { m, a, c, x0 };
        }
    }
}

function validFiles(mMin, paths) {
    return paths.filter((path) => parseInt(path.split("-")[2], 10) >= mMin);
}

export default getParameters;
