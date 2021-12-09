import { parentPort, workerData } from "worker_threads";
import { verificationThHullDobell } from "../hullDobell.js";
import { genRandom, testCarréUniteGen, u } from "../partie1Func.js";
const start = workerData.start;
const end = workerData.end;

let oks = [];
for (let m = start; m < end; m++) {
    for (let a = 0; a < m; a++) {
        for (let c = 1; c < m; c++) {
            if (verificationThHullDobell(m, a, c)) {
                for (let x0 = 0; x0 < m; x0++) {
                    if (
                        testCarréUniteGen({
                            suiteUns: genRandom(m, a, c, x0, u(m)),
                        })
                    ) {
                        console.log("FOUND: ", m, a, c, x0);
                        oks.push([m, a, c, x0]);
                    }
                }
            }
        }
    }
}

parentPort.postMessage({ start, end, oks });
