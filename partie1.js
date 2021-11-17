function factor(m){
    i = 2;
    factors = new Set(); // set() supprime les doublons en python
    while (i * i <= m){
        if (m % i){
            i++;
        } else {
            m /= i;
            factors.add(i);
        }
    }
    if (m > 1){
        factors.add(m);
    }
    return Array.from(factors); 
}
function aM1MultiplyP(list, a){
    for (p of list){
        if ((a-1)%p==0){
            isAM1MultiplyP = true;
        } 
        else{
            return false;
        }
    }
    return isAM1MultiplyP;
}

function verificationThHullDobell(m, a, c, x0) {
    // Hull-Dobel theorem

    // to know if the period will be m long or less

    // 1) if c and m are first between us

    const mFactors = factor(m);
    console.log(mFactors);

    const cFactors = factor(c);
    console.log(cFactors);

    isFirst = true;
    for (x of mFactors){
        console.log(x);
        if (x in cFactors){
            isFirst = false;
        }
    }
    console.log(isFirst ? "c et m sont premiers entre eux !" : "c et m ne sont pas premiers entre eux !", isFirst);


    // 2) if for all m factors called p, a-1 is multiply of p
    isAM1MultiplyP = aM1MultiplyP(mFactors,a);

    console.log(isAM1MultiplyP ?"a-1 est multiple de chaque facteur premier de m " : "a-1 n'est pas multiple de chaque facteur premier de m",isAM1MultiplyP);

    //
    //  3) if m is multiply of 4 then a-1 est multiple of 4
    // 
    if (m%4==0){
        isMultiply4 = (a-1)%4==0
    }
    else{
        isMultiply4 = true;
    }

    console.log(isMultiply4 ?"m est multiple de 4, alors a-1 est multiple de 4 : " : "m n'est pas multiple de 4",isMultiply4);
    // a vérifiez pour la formulation je suis pas sur

    //
    // 4) Conclusion of the Hull-Dobell theorem
    // 
    if (isFirst && isAM1MultiplyP && isMultiply4){
        console.log(`La suite de nombre pseudo-aléatoire est de période = ${m}`);
    }
}

function generationSuiteAleatoire(m, a, c, x0) {
    return suiteAleatoire(m, a, c, x0);
}

function suiteAleatoire(m, a, c, x0) {
    const suite = [x0];

    for (let n = 1; n < m; n++) {
        suite[n] = formuleCongruentielleLinéaireMixte(m, a, c, suite[n - 1]);
    }

    return suite;
}

function formuleCongruentielleLinéaireMixte(m, a, c, xn) {
    return (a * xn + c) % m;
}

/*Génére les Un à partir des Xn*/
function Uns(suite, m) {
    return suite.map((xn) => xn / m);
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

function testCarréUnite(suiteUns) {
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
            delete valeurs[i + 1];
            i--;
        }
    }
    console.log(n);
    valeurs.forEach((v, i) => {
        console.log((i + 1) / 10, v.ri, v.pi * n);
    });
}

const m = 63;
const a = 22;
const c = 4;
const x0 = 19;

verificationThHullDobell(m,a,c,x0);

const suite = generationSuiteAleatoire(m, a, c, x0);
const suiteUn = Uns(suite, m);

console.log(suite);
console.log(suiteUn);
// juste pour avoir une liste assez longue pour les tests
const test = [];
for (let i = 0; i < 1000; i++) {
    test[i] = Math.random();
}
testCarréUnite(test);
