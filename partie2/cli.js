import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import randomParameters from "../findBest/randomParameters.js";
import { verificationThHullDobell } from "../hullDobell.js";
import { genRandom, testCarréUniteGen, u } from "../partie1func.js";
import { setInfo } from "../saveFile.js";
import logger from "./logger.js";
import { nbStationsOptimal } from "./main.js";

const M = 20000,
    A = 161,
    C = 15519,
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
                default: 6,
                describe: "Nombre de stations minimum",
            });
            yargs.positional("max", {
                type: "number",
                default: 36,
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
                try {
                    logger.info("Les paramètres vérifient la théorie de Hull-Dobell");
                    logger.info(`min: ${argv.min}, max: ${argv.max}, temps: ${argv.temps}`);
                    logger.info(`m: ${argv.m}, a: ${argv.a}, c: ${argv.c}, x0: ${argv.x0}`);
                    logger.info("");
                    logger.info("Lancement de la simulation");
                    logger.info("");
                    nbStationsOptimal(argv.min, argv.max, argv.temps, { m: argv.m, a: argv.a, c: argv.c, x0: argv.x0 });
                } catch (e) {
                    logger.error(e);
                }
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
    .command({
        command: "carréUnité",
        aliases: ["cu", "carré", "carreUnite", "unite", "unité"],
        desc: "vérifie que les paramètres vérifient le test du carré unité",
        builder: (yargs) => {
            yargs.options("m", {
                type: "number",
                default: M,
                describe: "Paramètre m",
            });
            yargs.options("a", {
                type: "number",
                default: A,
                describe: "Paramètre a",
            });
            yargs.options("c", {
                type: "number",
                default: C,
                describe: "Paramètre c",
            });
            yargs.options("x0", {
                aliases: ["x"],
                type: "number",
                default: X0,
                describe: "Paramètre x0",
            });
            yargs.option("saveFile", {
                type: "boolean",
                default: true,
                describe: "Enregistre les résultats dans un fichier",
            });
            yargs.option("alpha", {
                type: "number",
                default: 0.05,
                describe: "valeur alpha pour Khi²",
            });
        },
        handler: function (argv) {
            logger.info("Vérification du test carré unité. pour les paramètres suivants:");
            logger.info("m = " + argv.m);
            logger.info("a = " + argv.a);
            logger.info("c = " + argv.c);
            logger.info("x0 = " + argv.x0);
            logger.debug("saveFile = " + argv.saveFile);
            logger.info("");
            if (argv.saveFile) {
                setInfo(argv.alpha, argv.m, argv.a, argv.c, argv.x0);
            }
            if (
                testCarréUniteGen({
                    suiteUns: genRandom(argv.m, argv.a, argv.c, argv.x0, u(argv.m)),
                    alpha: argv.alpha,
                    saveFile: argv.saveFile,
                })
            ) {
                logger.info("Les paramètres vérifient le test du carré unité");
            } else {
                logger.error("Les paramètres ne vérifient pas le test du carré unité");
                logger.error("Paramètres conseillés: m = " + M + ", a = " + A + ", c = " + C);
            }
        },
    })
    .demandCommand()
    .help().argv;
