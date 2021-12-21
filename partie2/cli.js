import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import randomParameters from "../findBest/randomParameters.js";
import { verificationThHullDobell } from "../hullDobell.js";
import logger from "./logger.js";
import { nbStationsOptimal } from "./main.js";

const M = 6000,
    A = 361,
    C = 1243,
    X0 = 1;

yargs(hideBin(process.argv))
    .usage("Usage: $0 <cmd> [options]")
    .command({
        command: "simulation [min] [max] [temps]",
        aliases: ["s", "simu"],
        desc: "Lance une simulation de file d'attente",
        builder: (yargs) => {
            yargs.positional("min", {
                type: "number",
                default: 1,
                describe: "Nombre de stations minimum",
            });
            yargs.positional("max", {
                type: "number",
                default: 10,
                describe: "Nombre de stations maximum",
            });
            yargs.positional("temps", {
                type: "number",
                default: 600,
                describe: "Temps de simulation",
            });
            yargs.option("m", {
                type: "number",
                default: M,
                describe: "Paramètre m",
            });
            yargs.option("a", {
                type: "number",
                default: A,
                describe: "Paramètre a",
            });
            yargs.option("c", {
                type: "number",
                default: C,
                describe: "Paramètre c",
            });
            yargs.option("x0", {
                aliases: ["x"],
                type: "number",
                default: X0,
                describe: "Paramètre x0",
            });
            yargs.option("verbose", {
                type: "boolean",
                aliases: ["v"],
                default: false,
                describe: "Affiche les résultats au format JSON",
            });
        },
        handler: function (argv) {
            if (argv.v) logger.level = "debug";
            if (verificationThHullDobell(argv.m, argv.a, argv.c)) {
                nbStationsOptimal(argv.min, argv.max, argv.temps, { m: argv.m, a: argv.a, c: argv.c, x0: argv.x0 });
            } else {
                logger.error("La théorie de Hull-Dobell n'est pas vérifiée");
                logger.error("Paramètres conseillés: m = " + M + ", a = " + A + ", c = " + C + ", x0 = " + X0);
            }
        },
    })
    .command({
        command: "parametres [min]",
        aliases: ["p", "params"],
        desc: "Affiche des paramètres valides",
        builder: (yargs) => {
            yargs.positional("min", {
                type: "number",
                default: 500,
                describe: "valeur de `m` minimum (entre 500 et 10 000)",
            });
        },
        handler: async function (argv) {
            const res = await randomParameters(argv.min);
            console.log(res);
        },
    })
    .demandCommand()
    .help().argv;
