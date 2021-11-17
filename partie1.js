function factor(m){
    i = 2;
    factors = new Set(); // set() supprime les doublons en python
    while (i * i <= m){
        if (m % i){
            i++;
        }
        else{
            m -= i;
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

function verificationThHullDobell(m,a,c,x0){
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
        else{
            console.log(`La longueur de la suite sera inférieure à ${m}`);
        }
}

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

verificationThHullDobell(m,a,c,x0);

const suite = generationSuiteAleatoire(m, a, c, x0);
const suiteUn = Uns(suite, m);

console.log(suite);
console.log(suiteUn);