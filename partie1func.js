import { verificationThHullDobell } from "./hullDobell.js";
import { getKhi2 } from "./khi2.js";

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
function distanceCarre(xn, xn1, xn2, xn3) {
    return Math.pow(xn3 - xn1, 2) + Math.pow(xn2 - xn, 2);
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
    return valeurs.reduce(
        (a, b) => a + Math.pow(b.ri - n * b.pi, 2) / (n * b.pi),
        0
    );
}

function testCarréUnite({ suiteUns, alpha = 0.05, saveFile = false }) {
    if (suiteUns === undefined) throw new Error("suiteUns is undefined");
    const n = Math.floor(suiteUns.length / 4);
    const valeurs = [];
    const pi = genPi();
    for (let x = 0; x < 20; x += 1) {
        valeurs[x] = {
            ri: 0,
            pi: pi.next().value,
        };
    }

    for (let n = 0; n <= suiteUns.length - 4; n += 4) {
        const distance = distanceCarre(
            suiteUns[n],
            suiteUns[n + 1],
            suiteUns[n + 2],
            suiteUns[n + 3]
        );

        const val = Math.floor(distance * 10);
        valeurs[val].ri += 1;
    }

    //! Attention, vérifier la méthode pour rassembler les nombres
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

const m = 63;
const a = 22;
const c = 4;
const x0 = 19;
console.time("carre");

try {
    verificationThHullDobell(m, a, c);
    if (testCarréUnite([...genRandom(m, a, c, x0)])) {
        oks.push([m, a, c, x0]);
        console.log(m, a, c, x0);
        console.log("OK");
    }
} catch (e) {
    console.log(e);
}
console.timeEnd("carre");

export { testCarréUnite, genRandom };
