import fs from "fs";
import { Worker } from "worker_threads";

const totalCpus = os.cpus().length;
const START_ITER = 500;
const MAX_ITER = 1000;

function runWorker(workerData) {
    return new Promise((resolve, reject) => {
        const worker = new Worker("./findBest/worker.js", {
            workerData,
        });
        worker.on("message", resolve); //This promise is gonna resolve when messages comes back from the worker thread
        worker.on("error", reject);
        worker.on("exit", (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}
const workers = [];
const iterPerWorker = Math.floor((MAX_ITER - START_ITER) / totalCpus);
for (let i = 0; i < totalCpus; i++) {
    const start = START_ITER + iterPerWorker * i + 1;
    const end = Math.min(start + iterPerWorker, MAX_ITER);
    workers.push(runWorker({ start, end, max: MAX_ITER }));
}

console.time("findbest");
Promise.all(workers).then((results) => {
    const oks = results.reduce((acc, val) => acc.concat(val.oks), []);
    fs.writeFileSync("ok.json", JSON.stringify(oks));
    console.timeEnd("findbest");
});
