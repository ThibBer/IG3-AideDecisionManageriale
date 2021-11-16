// Code fait par joachim le 16/11
function factor(m){
    i = 2;
    factors = [];
    while (i * i <= m){
        if (m % i){
            i++;
        }
        else{
            m -= i;
            factors.push(i);
        }
    }
        
    if (m > 1){
        factors.push(m);
    }
        
    return Array.from(new Set(factors)); // set() supprime les doublons en python
}
function a_1_multiply_p(list, a){
    for (p in list){
        if ((a-1)%p==0){
            is_a_1_multiply_p = true;
        } 
        else{
            return false;
        }
    }
    return is_a_1_multiply_p;
}

function verificationThHullDobell(m,a,c,x0){
    // Hull-Dobel theorem

    // to know if the period will be m long or less

    // 1) if c and m are first between us

    m_factors = factor(m);
    console.log(m_factors);

    c_factors = factor(c);
    console.log(c_factors);

    is_first = true;
    for (x in m_factors){
        if (x in c_factors){
            is_first = false;
        }
    }
    console.log(is_first ? "c et m sont premiers entre eux !" : "c et m ne sont pas premiers entre eux !");


    // 2) if for all m factors called p, a-1 is multiply of p
    is_a_1_multiply_p = a_1_multiply_p(m_factors,a);

    console.log(is_a_1_multiply_p ?"a-1 est multiple de chaque facteur premier de m " : "a-1 n'est pas multiple de chaque facteur premier de m");

    // 
    //  3) if m is multiply of 4 then a-1 est multiple of 4
    // 
    if (m%4==0){
        is_multiply_4 = (a-1)%4==0
    }
    else{
        is_multiply_4 = true;
    }
        

    console.log(is_multiply_4 ?"m est multiple de 4, alors a-1 est multiple de 4 : " : "m n'est pas multiple de 4");
    // a vérifiez pour la formulation je suis pas sur

    // 
    // 4) Conclusion of the Hull-Dobell theorem
    // 
    if (is_first && is_a_1_multiply_p && is_multiply_4){
        console.log(`La suite de nombre pseudo-aléatoire est de période = ${m}`);
    }
        else{
            console.log(`La longueur de la suite sera inférieure à ${m}`);
        }
}
// fin du code de joachim

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

// code joachim 16/11
verificationThHullDobell(m,a,c,x0);
// fin code joachim 16/11

const suite = generationSuiteAleatoire(m, a, c, x0);
const suiteUn = Uns(suite, m);

console.log(suite);
console.log(suiteUn);