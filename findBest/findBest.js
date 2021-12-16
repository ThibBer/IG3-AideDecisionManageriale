import os from "os";
import { Worker } from "worker_threads";

const totalCpus = os.cpus().length;
const START_ITER = 4201;
const MAX_ITER = 10000;

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
const iterPerWorker = Math.ceil((MAX_ITER - START_ITER) / totalCpus);
for (let i = 0; i < totalCpus; i++) {
    const start = START_ITER + iterPerWorker * i;
    const end = Math.min(start + iterPerWorker - 1, MAX_ITER);
    workers.push(runWorker({ start, end }));
}

console.time("findbest");
Promise.all(workers).then((results) => {
    console.timeEnd("findbest");
});
