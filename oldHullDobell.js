function factor(m) {
    let i = 2;
    const factors = new Set(); // set() supprime les doublons en python

    while (i * i <= m) {
        if (m % i) {
            i++;
        } else {
            m /= i;
            factors.add(i);
        }
    }

    if (m > 1) {
        factors.add(m);
    }

    return Array.from(factors);
}

function aM1MultiplyP(list, a) {
    let isAM1MultiplyP;
    for (const p of list) {
        if ((a - 1) % p == 0) {
            isAM1MultiplyP = true;
        } else {
            return false;
        }
    }

    return isAM1MultiplyP;
}

function verificationThHullDobell(m, a, c, x0) {
    // Hull-Dobel theorem

    // to know if the period will be m long or less

    // 1) if c and m are prime between us

    const mFactors = factor(m);
    console.log(mFactors);

    const cFactors = factor(c);
    console.log(cFactors);

    let isPrime = true;
    for (const x of mFactors) {
        console.log(x);
        if (cFactors.includes(x)) {
            isPrime = false;
        }
    }
    console.log(
        isPrime
            ? "c et m sont premiers entre eux !"
            : "c et m ne sont pas premiers entre eux !",
        isPrime
    );

    // 2) if for all m factors called p, a-1 is multiply of p
    let isAM1MultiplyP = aM1MultiplyP(mFactors, a);

    console.log(
        isAM1MultiplyP
            ? "a-1 est multiple de chaque facteur premier de m "
            : "a-1 n'est pas multiple de chaque facteur premier de m",
        isAM1MultiplyP
    );

    //
    //  3) if m is multiply of 4 then a-1 is multiple of 4
    //
    const isMultiply4 = m % 4 != 0 || (a - 1) % 4 == 0;
    // if (m % 4 == 0) {
    //     isMultiply4 = (a - 1) % 4 == 0;
    // } else {
    //     isMultiply4 = true;
    // }

    console.log(
        isMultiply4
            ? "m est multiple de 4, alors a-1 est multiple de 4 : "
            : "m n'est pas multiple de 4",
        isMultiply4
    );
    // a vérifiez pour la formulation je suis pas sur

    //
    // 4) Conclusion of the Hull-Dobell theorem
    //
    if (isPrime && isAM1MultiplyP && isMultiply4) {
        console.log(
            `La suite de nombre pseudo-aléatoire est de période maximale = ${m}`
        );
    }
}
