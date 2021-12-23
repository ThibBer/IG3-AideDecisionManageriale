import { genRandom, u } from "../partie1func.js";
import { Client } from "./client.js";
import {
    COUT_HORAIRE_INNOCUPATION,
    COUT_HORAIRE_OCCUPATION,
    COUT_HORAIRE_SYSTEME,
    PERTE,
    POISSON_CLIENTS_ORDINAIRES,
    POISSON_CLIENTS_PRIORITAIRES,
    PROPORTION_ABSOLU,
    TYPE_CLIENT,
} from "./constant.js";
import logger from "./logger.js";

// const m = 4000,
//     a = 21,
//     c = 713,
//     x0 = 1;
// const m = 3625,
//     a = 146,
//     c = 112,
//     x0 = 1;
const M = 20000,
    A = 161,
    C = 15519,
    X0 = 1;

const repetDS = new Array(10).fill(0);
let nU = 0;

function nbStationsOptimal(nbStationsMin, nbStationsMax, tempsSimulation, { m = M, a = A, c = C, x0 = X0 }) {
    // autant la faire en dernier pour pourvoir tester petit à petit

    let nbStations = nbStationsMin;
    const couts = [];
    while (nbStations <= nbStationsMax) {
        nU = 0;
        let file = [];
        const stations = [];

        let nbMinutesSystemeOrdinaire = 0;
        let nbMinutesSystemeRelatif = 0;
        let nbMinutesSystemeAbsolu = 0;
        let nbMinutesStationPrioritaire = 0;
        let nbMinutesStationOrdinaire = 0;
        let nbMinutesStationInnocupée = 0;
        let nbPrioritairesPartis = 0;
        let nbOrdinairesPartis = 0;

        let temps = 1;
        const Uns = genRandom(m, a, c, x0, u(m));

        logger.info(`~~~~~~~~~~~~~~Nombre de stations: ${nbStations}~~~~~~~~~~~~~~`);

        while (temps <= tempsSimulation) {
            if (nbStations === nbStationsMin && temps <= 20) {
                logger.info("\n\n");
                logger.info("===============TEMPS DE SIMULATION : " + temps + "================");
                logger.info("---Affichage des stations en début de minute:");
                afficherStations(stations);

                logger.info("---Affichage des clients dans la file avant placement:");
                logger.info("***************************************************");
                afficherFile(file);
                logger.info("***************************************************");
            }

            const { clientsOrdinaires, clientsPrioritairesRelatifs, clientsPrioritairesAbsolus } = générerArrivées(Uns, temps);
            file = ajoutFile(file, clientsPrioritairesAbsolus, TYPE_CLIENT.ABSOLU);
            file = ajoutFile(file, clientsPrioritairesRelatifs, TYPE_CLIENT.RELATIF);
            file = ajoutFile(file, clientsOrdinaires, TYPE_CLIENT.ORDINAIRE);

            if (nbStations === nbStationsMin && temps <= 20) {
                logger.info(
                    "Nombre d'arrivées: " +
                        (clientsOrdinaires.length + clientsPrioritairesRelatifs.length + clientsPrioritairesAbsolus.length)
                );

                logger.info("Ordinaires: " + clientsOrdinaires.length);
                afficherFile(clientsOrdinaires);
                logger.info("Prioritaires relatifs: " + clientsPrioritairesRelatifs.length);
                afficherFile(clientsPrioritairesRelatifs);
                logger.info("Prioritaires absolus: " + clientsPrioritairesAbsolus.length);
                afficherFile(clientsPrioritairesAbsolus);

                logger.info("---Affichage des clients dans la file après placement:");
                logger.info("***************************************************");
                afficherFile(file);
                logger.info("***************************************************");
            }

            // Gestion du client absolu qui éjecte un client ordinaire avec la plus grande durée de service
            let iStationVide = indiceStationPourAbsolu(stations);
            const nbAbsolus = rechercheFinType(file, TYPE_CLIENT.ABSOLU);
            let nbExclus = 0;
            while (nbExclus < nbAbsolus && iStationVide > -1) {
                // logger.warn("Ejection d'un client absolu");
                const client = file.splice(nbExclus, 1)[0];
                const ancienClient = stations[iStationVide];
                if (ancienClient !== undefined && ancienClient.duréeService > 0) {
                    ancienClient.type = TYPE_CLIENT.ABSOLU;
                    file.unshift(ancienClient);
                }
                stations[iStationVide] = client;
                nbExclus++;
                iStationVide = indiceStationPourAbsolu(stations);
            }

            let iStation = 0;
            while (iStation < nbStations) {
                if (stationEstVide(stations[iStation])) {
                    if (file.length > 0) {
                        stations[iStation] = file.shift(); // récupère le premier élément de la file et le met dans la station
                        stations[iStation].duréeService--;
                    } else {
                        nbMinutesStationInnocupée++;
                    }
                } else {
                    stations[iStation].duréeService--;
                    if (stations[iStation].type === TYPE_CLIENT.ORDINAIRE) {
                        nbMinutesStationOrdinaire++;
                        nbMinutesSystemeOrdinaire++;
                    } else {
                        nbMinutesStationPrioritaire++;

                        if (stations[iStation].type === TYPE_CLIENT.RELATIF) {
                            nbMinutesSystemeRelatif++;
                        } else {
                            nbMinutesSystemeAbsolu++;
                        }
                    }
                }

                iStation++;
            }

            let iClient = 0;
            while (iClient < file.length) {
                if (temps - file[iClient].tempsArrivée >= 10 && iClient >= 3) {
                    // logger.warn("Ejection IMPATIENCE");
                    if (file[iClient].type === TYPE_CLIENT.ORDINAIRE) {
                        nbOrdinairesPartis++;
                    } else {
                        nbPrioritairesPartis++;
                    }

                    file.splice(iClient, 1);
                } else {
                    if (file[iClient].type === TYPE_CLIENT.ORDINAIRE) {
                        nbMinutesSystemeOrdinaire++;
                    } else if (file[iClient].type === TYPE_CLIENT.RELATIF) {
                        nbMinutesSystemeRelatif++;
                    } else {
                        nbMinutesSystemeAbsolu++;
                    }
                }

                iClient++;
            }

            if (nbStations === nbStationsMin && temps <= 20) {
                logger.info("\n");
                logger.info("Affichage des stations en fin de minute");
                afficherStations(stations);

                logger.info("Affichage des clients dans la file en fin de minute");
                logger.info("***************************************************");
                afficherFile(file);
                logger.info("***************************************************");
            }

            temps++;
        }
        couts.push({
            systeme: [
                coutSystemeOrdinaire(nbMinutesSystemeOrdinaire),
                coutSystemeRelatif(nbMinutesSystemeRelatif),
                coutSystemeAbsolu(nbMinutesSystemeAbsolu),
            ],
            station: [coutStationOrdinaire(nbMinutesStationOrdinaire), coutStationPrioritaire(nbMinutesStationPrioritaire)],
            innocupationStations: coutInnocupationStations(nbMinutesStationInnocupée),
            perteClients: coutPerteClients(nbPrioritairesPartis, nbOrdinairesPartis),
        });
        nbStations++;
        nU;
    }

    afficherCoutsStations(couts, nbStationsMin);

    const nbStationsOptimalTrouvees = rechercheMin(couts) + nbStationsMin;
    logger.info("Nombre de stations optimale: " + nbStationsOptimalTrouvees);
    const infos = {
        systeme: [],
        station: [],
        innocupation: [],
        perte: [],
        total: [],
    };
    for (let i = 0; i < couts.length; i++) {
        infos.systeme.push(coutAccumulé(couts[i].systeme));
        infos.station.push(coutAccumulé(couts[i].station));
        infos.innocupation.push(couts[i].innocupationStations);
        infos.perte.push(couts[i].perteClients);
        infos.total.push(
            coutAccumulé(couts[i].systeme) +
                coutAccumulé(couts[i].station) +
                couts[i].innocupationStations +
                couts[i].perteClients
        );
    }
    logger.debug("Couts des différentes stations");
    logger.debug(JSON.stringify(infos));
}

function indiceStationPourAbsolu(stations) {
    let duréeServiceMax = -1;
    let iStationDureeServiceMax = -1;

    let iStation = 0;
    let station = stations[iStation];

    while (iStation < stations.length && !stationEstVide(station)) {
        if (station.type === TYPE_CLIENT.ORDINAIRE && station.duréeService > duréeServiceMax) {
            duréeServiceMax = station.duréeService;
            iStationDureeServiceMax = iStation;
        }

        iStation++;
        station = stations[iStation];
    }

    return iStationDureeServiceMax;
}

function stationEstVide(station) {
    return station === undefined || station.duréeService === 0;
}

function afficherCoutsStations(couts, nbStationMin) {
    couts.forEach((cout, i) => {
        logger.info(
            `${i + nbStationMin} station(s) ouvertes -> Cout du système: ${coutSysteme(cout.systeme).toFixed(
                2
            )} | Cout stations: ${coutStation(cout.station).toFixed(
                2
            )} | Cout innocupation du système: ${cout.innocupationStations.toFixed(
                2
            )} | Cout de perte de clients: ${cout.perteClients.toFixed(2)} \n\t Cout total: ${coutNStations(cout).toFixed(2)}`
        );
        logger.debug(
            `\tCout système détaillé: ordinaire: ${cout.systeme[0].toFixed(2)} | relatif: ${cout.systeme[1].toFixed(
                2
            )} | absolu: ${cout.systeme[2].toFixed(2)}`
        );
        logger.debug(
            `\tCout stations détaillé: ordinaire: ${cout.station[0].toFixed(2)} | prioritaire: ${cout.station[1].toFixed(2)}`
        );
        logger.debug(`\tCout innocupation détaillé: ${cout.innocupationStations.toFixed(2)}`);
        logger.debug(`\tCout perte détaillé: ${cout.perteClients.toFixed(2)}`);
    });
}

function afficherStations(stations) {
    if (stations.length === 0) {
        logger.info("Aucune station occupée");
    } else {
        logger.info("--------------------------------------------------------------------------");
        for (const iStation in stations) {
            afficherStation(stations[iStation], iStation);
        }
        logger.info("--------------------------------------------------------------------------");
    }
}

function afficherStation(client, iStation) {
    if (client !== undefined) {
        logger.info(
            `|| Station ${iStation} - Client ${client.typeString} (${client.id}) durée de service restant : ${client.duréeService} \t||`
        );
    } else {
        logger.info(`|| Station ${iStation} - vide \t||`);
    }
}

function afficherFile(file) {
    for (let iClient = 0; iClient < file.length; iClient++) {
        const client = file[iClient];

        if (client.duréeService !== undefined) {
            logger.info(
                `| [${iClient + 1}] - ${client.typeString} (${client.id}) | Durée de service: ${client.duréeService} \t|`
            );
        } else {
            logger.info(`| [${iClient + 1}] - ${client.typeString} \t|`);
        }
    }
}

function rechercheMin(couts) {
    let iStation = 0;
    let coutMin = Number.MAX_SAFE_INTEGER;
    let iStationOptimale = -1;

    while (iStation < couts.length) {
        const coutsStation = coutNStations(couts[iStation]);

        if (coutsStation < coutMin) {
            coutMin = coutsStation;
            iStationOptimale = iStation;
        }

        iStation++;
    }

    return iStationOptimale;
}

function générerArrivées(Uns, temps) {
    const clientsOrdinaires = générerClients(POISSON_CLIENTS_ORDINAIRES, temps, Uns, clientOrdinaire);
    const clientsPrioritaires = générerClients(POISSON_CLIENTS_PRIORITAIRES, temps, Uns, clientPrioritaire);
    const clientsPrioritairesRelatifs = clientsPrioritaires.filter((client) => client.type === TYPE_CLIENT.RELATIF);
    const clientsPrioritairesAbsolus = clientsPrioritaires.filter((client) => client.type === TYPE_CLIENT.ABSOLU);

    return {
        clientsOrdinaires,
        clientsPrioritairesRelatifs,
        clientsPrioritairesAbsolus,
    };
}

// function générerClients(nbClients, type, temps) {
//     const clients = [];
//     for (let i = 0; i < nbClients; i++) {
//         const duréeService = duréeServiceGénérée();
//         const client = new Client(type, duréeService, temps);
//         clients.push(client);
//     }
//     return clients;
// }

// function duréeServiceGénéréeOld(lambda, Uns) {
//     const L = Math.exp(-lambda);
//     let p = 1;
//     let x = 0;
//     while (p > L) {
//         nU++;
//         const { done, value: u } = Uns.next();
//         if (done) throw new Error("Aucun nombre aléatoire disponible");
//         p *= u;
//         x++;
//     }
//     return x;
// }

function duréeServiceGénérée(Uns) {
    const probDuréesCumulPr = [0.387096774, 0.677419355, 0.85483871, 0.919354839, 0.967741935, 1];
    // const probDuréesCumulTh = [0.366111592, 0.598185486, 0.745294438, 0.838545097, 0.897655608, 0.935125077, 0.999930455, 1];
    const { done, value: u } = Uns.next();
    if (done) throw new Error("Aucun nombre aléatoire disponible");
    let iDurée = 0;
    while (u > probDuréesCumulPr[iDurée]) {
        iDurée++;
    }
    return iDurée + 1;
}

function clientPrioritaire(temps, duréeService, u) {
    const type = u <= PROPORTION_ABSOLU ? TYPE_CLIENT.ABSOLU : TYPE_CLIENT.RELATIF;
    return new Client(type, duréeService, temps);
}

function clientOrdinaire(temps, duréeService) {
    return new Client(TYPE_CLIENT.ORDINAIRE, duréeService, temps);
}

// https://en.wikipedia.org/wiki/Poisson_distribution#Generating_Poisson-distributed_random_variables
function générerClients(lambda, temps, Uns, type) {
    const clients = [];
    const L = Math.exp(-lambda);
    let p = 1;
    while (p > L) {
        nU++;
        const { done, value: u } = Uns.next();
        if (done) throw new Error("Aucun nombre aléatoire disponible");
        const duréeService = duréeServiceGénérée(Uns);
        repetDS[duréeService]++;
        clients.push(type(temps, duréeService, u));
        p *= u;
    }
    return clients;
}

// function valeurPoisson(Un, lambda) {
//     let cumulProbas = 0;
//     let x = 0;
//     while (Un > cumulProbas) {
//         cumulProbas += (Math.exp(-lambda) * lambda ** x) / math.factorial(x);
//         x++;
//     }
//     return x;
// }

// Premier indice qui ne correspond pas au type (là où l'insertion va se faire)
function rechercheFinType(file, type) {
    if (type === TYPE_CLIENT.ORDINAIRE) {
        return file.length;
    } else {
        const taille = file.length;
        let i = 0;
        while (i < taille && file[i].type >= type) {
            i++;
        }
        return i;
    }
}

function ajoutFile(file, clients, type) {
    let indice = rechercheFinType(file, type);
    for (const nouvelleArrivee of clients) {
        file.splice(indice, 0, nouvelleArrivee);
        indice++;
    }

    return file;
}

function coutNStations(cout) {
    return coutAccumulé(cout.systeme) + coutAccumulé(cout.station) + cout.innocupationStations + cout.perteClients;
}

function coutSysteme(couts) {
    return coutAccumulé(couts);
}

function coutAccumulé(couts) {
    return couts.reduce((acc, cout) => acc + cout, 0);
}

function coutSystemeOrdinaire(nbMinutesSystemeOrdinaire) {
    return (nbMinutesSystemeOrdinaire / 60) * COUT_HORAIRE_SYSTEME.ORDINAIRE;
}

function coutSystemeRelatif(nbMinutesSystemeRelatif) {
    return (nbMinutesSystemeRelatif / 60) * COUT_HORAIRE_SYSTEME.RELATIF;
}

function coutSystemeAbsolu(nbMinutesSystemeAbsolu) {
    return (nbMinutesSystemeAbsolu / 60) * COUT_HORAIRE_SYSTEME.ABSOLU;
}

function coutStation(couts) {
    return coutAccumulé(couts);
}

function coutStationPrioritaire(nbMinutesStationPrioritaire) {
    return (nbMinutesStationPrioritaire / 60) * COUT_HORAIRE_OCCUPATION.PRIORITAIRE;
}

function coutStationOrdinaire(nbMinutesStationOrdinaire) {
    return (nbMinutesStationOrdinaire / 60) * COUT_HORAIRE_OCCUPATION.ORDINAIRE;
}

function coutInnocupationStations(nbMinutesStationInnocupée) {
    return (nbMinutesStationInnocupée / 60) * COUT_HORAIRE_INNOCUPATION;
}

function coutPerteClients(nbPrioritairesPartis, nbOrdinairesPartis) {
    return nbPrioritairesPartis * PERTE.PRIORITAIRE + nbOrdinairesPartis * PERTE.ORDINAIRE;
}

// nbStationsOptimal(1, 20, 600);

export { nbStationsOptimal };
