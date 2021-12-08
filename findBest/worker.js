import { parentPort, workerData } from "worker_threads";
import { verificationThHullDobell } from "../hullDobell.js";
import { genRandom, testCarréUniteGen } from "../partie1func.js";
const start = workerData.start;
const end = workerData.end;

let oks = [];
for (let m = 500 + start; m < 500 + end; m++) {
    for (let a = 0; a < 1000; a++) {
        for (let c = 0; c < 1000; c++) {
            try {
                verificationThHullDobell(m, a, c);
                for (let x0 = 0; x0 < 1000; x0++) {
                    if (
                        testCarréUniteGen({ suiteUns: genRandom(m, a, c, x0) })
                    ) {
                        oks.push([m, a, c, x0]);
                    }
                }
            } catch (error) {
                continue;
            }
        }
    }
}

parentPort.postMessage({ start, end, oks });
