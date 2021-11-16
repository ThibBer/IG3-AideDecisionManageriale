function generationSuiteAleatoire(m, a, c, x0){
    return suiteAleatoire(m, a, c, x0);
}

function suiteAleatoire(m, a, c, x0){
    const suite = [x0];

    for(let n = 1; n < m; n++){
        suite[n] = formuleCongruentielleLinéaireMixte(m, a, c, suite[n - 1]);
    }

    return suite;
}

function formuleCongruentielleLinéaireMixte(m, a, c, xn){
    return (a * xn + c) % m
}

/*Génére les Un à partir des Xn*/
function Uns(suite, m){
    return suite.map(xn => xn / m);
}

/*Calcul la distance entre les points*/
function distanceCarre(xn, xn1, xn2, xn3){
    return Math.pow(xn3 - xn1, 2) + Math.pow(xn2 - xn, 2);
}

function testCarréUnite(suiteUns){
    const nbGroupes = parseInt(suiteUns.length / 4);

    for(let n = 0; n < nbGroupes; n += 3){
        const distance = distanceCarre(suiteUns[n], suiteUns[n + 1], suiteUns[n + 2], suiteUns[n + 3]);
    }
}

const m = 8;
const a = 5;
const c = 5;
const x0 = 3;

const suite = generationSuiteAleatoire(m, a, c, x0);
const suiteUn = Uns(suite, m);

console.log(suite);
console.log(suiteUn);