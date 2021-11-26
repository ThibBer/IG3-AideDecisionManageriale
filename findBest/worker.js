import { parentPort, workerData } from "worker_threads";
import { verificationThHullDobell } from "../hullDobell.js";
import { genRandom, testCarréUnite } from "../partie1func.js";
const start = workerData.start;
const end = workerData.end;

let oks = [];
for (let m = start; m < end; m++) {
    for (let a = start; a < end; a++) {
        for (let c = start; c < end; c++) {
            for (let x0 = start; x0 < end; x0++) {
                try {
                    verificationThHullDobell(m, a, c);
                    if (testCarréUnite([...genRandom(m, a, c, x0)])) {
                        oks.push([m, a, c, x0]);
                    }
                } catch (error) {
                    continue;
                }
            }
        }
    }
}

parentPort.postMessage({ start, end, oks });
