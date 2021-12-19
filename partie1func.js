import { getKhi2 } from "./khi2.js";
import { setKhi, setTable } from "./saveFile.js";

function formuleCongruentielleLinéaireMixte(m, a, c, xn) {
    return (a * xn + c) % m;
}

function u(m) {
    return (x) => x / m;
}
function y(u) {
    return Math.floor(u * 10);
}

function* genRandom(m, a, c, x0, method = (x) => x) {
    yield method(x0);
    let xn = x0;
    for (let n = 0; n < m; n++) {
        xn = formuleCongruentielleLinéaireMixte(m, a, c, xn);
        yield method(xn);
    }
}

/*Calcul la distance entre les points*/
function distanceCarre(x1, y1, x2, y2) {
    return Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2);
}

function F(x) {
    if (x <= 1) {
        return Math.PI * x - (8 / 3) * Math.pow(x, 3 / 2) + Math.pow(x, 2) / 2;
    }
    return (
        1 / 3 +
        (Math.PI - 2) * x +
        4 * Math.sqrt(x - 1) +
        (8 / 3) * Math.pow(x - 1, 3 / 2) -
        Math.pow(x, 2) / 2 -
        4 * x * Math.acos(1 / Math.sqrt(x))
    );
}

function* genPi() {
    let n = 1;
    let oldFx = 0;
    let fx;
    while (n <= 20) {
        fx = F(n / 10);
        let pi = fx - oldFx;
        yield pi;
        n += 1;
        oldFx = fx;
    }
}

function getKhi2Obs(valeurs, n) {
    return valeurs.reduce((a, b) => a + Math.pow(b.ri - n * b.pi, 2) / (n * b.pi), 0);
}

function testCarréUniteGen({ suiteUns, alpha = 0.05, saveFile = false }) {
    if (suiteUns === undefined) throw new Error("suiteUns is undefined");
    let n = 0;
    // const valeurs = [
    //     { ri: 0, pi: 0.23483186108782253 },
    //     { ri: 0, pi: 0.17497275203015852 },
    //     { ri: 0, pi: 0.13949513695482413 },
    //     { ri: 0, pi: 0.11271807719385785 },
    //     { ri: 0, pi: 0.09096945794617028 },
    //     { ri: 0, pi: 0.07261363615466931 },
    //     { ri: 0, pi: 0.05674855328174522 },
    //     { ri: 0, pi: 0.04281330742276601 },
    //     { ri: 0, pi: 0.03043069083756711 },
    //     { ri: 0, pi: 0.019332514013545632 },
    //     { ri: 0, pi: 0.010777309350941788 },
    //     { ri: 0, pi: 0.006344711603793574 },
    //     { ri: 0, pi: 0.003740382167142009 },
    //     { ri: 0, pi: 0.002137228998475127 },
    //     { ri: 0, pi: 0.001154608980475036 },
    //     { ri: 0, pi: 0.000571269516336681 },
    //     { ri: 0, pi: 0.00024597989021035715 },
    //     { ri: 0, pi: 0.0000836123297860425 },
    //     { ri: 0, pi: 0.000017802490300589113 },
    //     { ri: 0, pi: 0.0000011077494113109765 },
    // ];
    const valeurs = [];
    const pi = genPi();
    for (let x = 0; x < 20; x += 1) {
        valeurs[x] = {
            ri: 0,
            pi: pi.next().value,
        };
    }
    for (let Un of suiteUns) {
        const x1 = Un;
        const y1 = suiteUns.next().value;
        const x2 = suiteUns.next().value;
        const y2 = suiteUns.next().value;
        if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) {
            break;
        }
        const distance = distanceCarre(x1, y1, x2, y2);
        const val = Math.floor(distance * 10);

        valeurs[val].ri += 1;
        n++;
    }
    if (saveFile) {
        setTable("before", valeurs, n);
    }
    //! Ici, on commence par le bas et on remonte en additionnant tant qu'on a pas npi > 5
    for (let i = valeurs.length - 2; i >= 0; i--) {
        while (i >= 0 && valeurs[i].pi * n < 5) {
            valeurs[i].pi += valeurs[i + 1].pi;
            valeurs[i].ri += valeurs[i + 1].ri;
            valeurs.pop();
            i--;
        }
    }
    if (saveFile) {
        setTable("after", valeurs, n);
    }

    const dl = valeurs.length - 1;
    if (dl < 1) return false;
    const khi2Obs = getKhi2Obs(valeurs, n);
    const khi2 = getKhi2(alpha, dl);
    if (saveFile) {
        setKhi(khi2Obs, khi2);
    }
    return khi2Obs < khi2;
}

function testCarréUnite({ suiteUns, alpha = 0.05, saveFile = false }) {
    if (suiteUns === undefined) throw new Error("suiteUns is undefined");
    let n = 0;
    const valeurs = [];
    const pi = genPi();
    for (let x = 0; x < 20; x += 1) {
        valeurs[x] = {
            ri: 0,
            pi: pi.next().value,
        };
    }

    for (let n = 0; n <= suiteUns.length - 4; n += 4) {
        const distance = distanceCarre(suiteUns[n], suiteUns[n + 1], suiteUns[n + 2], suiteUns[n + 3]);

        const val = Math.floor(distance * 10);
        valeurs[val].ri += 1;
    }

    //! Ici, on commence par le bas et on remonte en additionnant tant qu'on a pas npi > 5
    for (let i = valeurs.length - 2; i >= 0; i--) {
        while (i >= 0 && valeurs[i].pi * n < 5) {
            valeurs[i].pi += valeurs[i + 1].pi;
            valeurs[i].ri += valeurs[i + 1].ri;
            valeurs.pop();
            i--;
        }
    }
    const dl = valeurs.length - 1;
    const khi2Obs = getKhi2Obs(valeurs, n);
    const khi2 = getKhi2(alpha, dl);
    return khi2Obs < khi2;
}

// const m = 63;
// const a = 22;
// const c = 4;
// const x0 = 19;
// console.time("carre");

// try {
//     verificationThHullDobell(m, a, c);
//     if (testCarréUniteGen({ suiteUns: genRandom(m, a, c, x0, u(m)) })) {
//         console.log("OK");
//     }
//     if (testCarréUnite({ suiteUns: [...genRandom(m, a, c, x0, u(m))] })) {
//         console.log("OK");
//     }
// } catch (e) {
//     console.log(e);
// }
// console.timeEnd("carre");

export { testCarréUnite, testCarréUniteGen, genRandom, u, y };
