import winston from "winston";
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

const types = ["Ordinaire", "Relatif", "Absolu"];

const m = 4000,
    a = 21,
    c = 713,
    x0 = 1;

const logger = winston.createLogger({
    level: "debug",
    format: winston.format.simple(),
    transports: [new winston.transports.File({ filename: "sortie.log" }), new winston.transports.Console()],
});

function nbStationsOptimal(nbStationMin, nbStationMax, tempsSimulation) {
    // autant la faire en dernier pour pourvoir tester petit à petit

    let nbStations = nbStationMin;
    const couts = [];
    while (nbStations <= nbStationMax) {
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

        while (temps <= tempsSimulation) {
            if (temps <= 20) {
                logger.info("===============TEMPS DE SIMULATION : " + temps + "================");
                logger.info("Affichage des stations en début de minute");
                afficherStations(stations);

                logger.info("Affichage des clients dans la file avant placement");
                afficherFile(file);
            }

            const { clientsOrdinaires, clientsPrioritairesRelatifs, clientsPrioritairesAbsolus } = générerArrivées(Uns, temps);
            file = ajoutFile(file, clientsPrioritairesAbsolus, TYPE_CLIENT.ABSOLU);
            file = ajoutFile(file, clientsPrioritairesRelatifs, TYPE_CLIENT.RELATIF);
            file = ajoutFile(file, clientsOrdinaires, TYPE_CLIENT.ORDINAIRE);

            if (temps <= 20) {
                logger.info(
                    "Nombre d'arrivées " +
                        (clientsOrdinaires.length + clientsPrioritairesRelatifs.length + clientsOrdinaires.length)
                );

                afficherFile(clientsPrioritairesAbsolus);
                afficherFile(clientsPrioritairesRelatifs);
                afficherFile(clientsOrdinaires);

                logger.info("Affichage des clients dans la file après placement");
                afficherFile(file);
            }

            // Gestion du client absolu qui éjecte un client ordinaire avec la plus grande durée de service
            const iStationVide = getStationVide(stations);
            const nbAbsolus = rechercheFinType(file, TYPE_CLIENT.ABSOLU);
            let nbExclus = 0;
            while (
                nbExclus < nbAbsolus &&
                indiceDeLaStationOùLeClientEstOrdinaireEtAvecLaDuréeDeServiceMaximale(stations) > -1
            ) {
                const client = file.splice(nbExclus, 1)[0];
                const ancienClient = stations[iStationVide];
                ancienClient.type = TYPE_CLIENT.ABSOLU;
                stations[iStationVide] = client;
                file.unshift(ancienClient);
                nbExclus++;
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

            if (temps <= 20) {
                logger.info("Affichage des stations en fin de minute");
                afficherStations(stations);

                logger.info("Affichage des clients dans la file en fin de minute");
                afficherFile(file);
            }

            temps++;
        }
        couts.push({
            systeme: coutSysteme(nbMinutesSystemeOrdinaire, nbMinutesSystemeRelatif, nbMinutesSystemeAbsolu),
            station: coutStation(nbMinutesStationPrioritaire, nbMinutesStationOrdinaire),
            innocupationStations: coutInnocupationStations(nbMinutesStationInnocupée),
            perteClients: coutPerteClients(nbPrioritairesPartis, nbOrdinairesPartis),
        });
        nbStations++;
    }

    afficherCoutsStations(couts);

    const nbStationsOptimalTrouvees = rechercheMin(couts);
    logger.info("Nombre de stations optimale: " + nbStationsOptimalTrouvees);
}

function indiceDeLaStationOùLeClientEstOrdinaireEtAvecLaDuréeDeServiceMaximale(stations) {
    let duréeServiceMax = -1;
    let iStationDureeServiceMax = -1;

    let iStation = 0;
    let station = stations[iStation];

    while (iStation < stations.length && station !== undefined) {
        if (station.type === TYPE_CLIENT.ORDINAIRE && station.duréeService > duréeServiceMax) {
            duréeServiceMax = station.duréeService;
            iStationDureeServiceMax = iStation;
        }

        iStation++;
        station = stations[iStation];
    }

    return iStationDureeServiceMax;
}

function getStationVide(stations) {
    return stations.indexOf(undefined);
}

function stationEstVide(station) {
    return station === undefined || station.duréeService == 0;
}

function afficherCoutsStations(couts) {
    for (const iCout in couts) {
        logger.info(
            `${iCout} station(s) ouvertes -> Cout du système: ${couts[iCout].systeme} | Cout stations: ${couts[iCout].station} | Cout innocupation du système: ${couts[iCout].innocupationStations} | Cout de perte de clients: ${couts[iCout].perteClients}`
        );
    }
}

function afficherStations(stations) {
    for (const iStation in stations) {
        afficherStation(stations[iStation], iStation);
    }
}

function afficherStation(client, iStation) {
    if (client !== undefined) {
        logger.info(`Station ${iStation} - Client ${types[client.type]} durée de service restant : ${client.duréeService}`);
    } else {
        logger.info(`Station ${iStation} - vide`);
    }
}

function afficherFile(file) {
    for (let iClient = 0; iClient < file.length; iClient++) {
        const client = file[iClient];

        if (client.duréeService === undefined) {
            logger.info(`[${iClient + 1}] - ${types[client.type]} | Durée de service: ${client.duréeService}`);
        } else {
            logger.info(`[${iClient + 1}] - ${types[client.type]}`);
        }
    }
}

function rechercheMin(couts) {
    let iStation = 0;
    let countMin = Number.MAX_SAFE_INTEGER;
    let iStationsOptimale = -1;

    while (iStation < couts.length) {
        const coutsStation = coutsNStation(
            couts[iStation].coutDuSysteme,
            couts[iStation].coutDeStation,
            couts[iStation].coutDeInnocupationStations,
            couts[iStation].coutDePerteClients
        );

        if (coutsStation < countMin) {
            coutMin = coutsStation;
            iStationOptimale = iStation;
        }

        iStation++;
    }

    return iStationsOptimale;
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

function duréeServiceGénérée() {
    // on génère comment les durées de service?
    return 10;
}

function clientPrioritaire(temps, u) {
    if (u < PROPORTION_ABSOLU) {
        return new Client(TYPE_CLIENT.ABSOLU, duréeServiceGénérée(), temps);
    } else {
        return new Client(TYPE_CLIENT.RELATIF, duréeServiceGénérée(), temps);
    }
}

function clientOrdinaire(temps) {
    return new Client(TYPE_CLIENT.ORDINAIRE, duréeServiceGénérée(), temps);
}

// https://en.wikipedia.org/wiki/Poisson_distribution#Generating_Poisson-distributed_random_variables
function générerClients(lambda, temps, Uns, type) {
    const clients = [];
    const L = Math.exp(-lambda);
    let p = 1;
    while (p > L) {
        const u = Uns.next().value;
        clients.push(type(temps, u));
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

function coutsNStation(coutSysteme, coutStations, coutInnocupationStations, coutPerteClients) {
    return coutSysteme + coutStations + coutInnocupationStations + coutPerteClients;
}

function coutSysteme(nbMinutesSystemeOrdinaire, nbMinutesSystemeRelatif, nbMinutesSystemeAbsolu) {
    let cout = (nbMinutesSystemeOrdinaire / 60) * COUT_HORAIRE_SYSTEME.ORDINAIRE;
    cout += (nbMinutesSystemeRelatif / 60) * COUT_HORAIRE_SYSTEME.RELATIF;
    cout += (nbMinutesSystemeAbsolu / 60) * COUT_HORAIRE_SYSTEME.ABSOLU;
    return cout;
}

function coutStation(nbMinutesStationPrioritaire, nbMinutesStationOrdinaire) {
    let cout = (nbMinutesStationPrioritaire / 60) * COUT_HORAIRE_OCCUPATION.PRIORITAIRE;
    cout += (nbMinutesStationOrdinaire / 60) * COUT_HORAIRE_OCCUPATION.ORDINAIRE;
    return cout;
}

function coutInnocupationStations(nbMinutesStationInnocupée) {
    return (nbMinutesStationInnocupée / 60) * COUT_HORAIRE_INNOCUPATION;
}

function coutPerteClients(nbPrioritairesPartis, nbOrdinairesPartis) {
    return (nbPrioritairesPartis / 60) * PERTE.PRIORITAIRE + (nbOrdinairesPartis / 60) * PERTE.ORDINAIRE;
}

nbStationsOptimal(3, 4, 100);
