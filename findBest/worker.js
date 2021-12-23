import fs from "fs";
import { parentPort, workerData } from "worker_threads";
import { verificationThHullDobell } from "../hullDobell.js";
import { genRandom, testCarréUniteGen, u } from "../partie1Func.js";
const start = workerData.start;
const end = workerData.end;

let oks = [];
const stream = fs.createWriteStream(`findBest/results/result-${start}-${end}.txt`, {
    flags: "a",
});
stream.write("m, a, c, x0\n");
let n = 0;
for (let m = start; m < end; m++) {
    for (let a = 0; a < m; a++) {
        stream.cork();
        for (let c = 1; c < m; c++) {
            if (verificationThHullDobell(m, a, c)) {
                if (
                    testCarréUniteGen({
                        suiteUns: genRandom(m, a, c, 1, u(m)),
                    })
                ) {
                    stream.write(`${m}, ${a}, ${c}, ${1}\n`);
                    // oks.push([m, a, c, x0]);
                }
            }
        }
        process.nextTick(() => stream.uncork());
    }
}
stream.end();

parentPort.postMessage({ start, end, oks });
