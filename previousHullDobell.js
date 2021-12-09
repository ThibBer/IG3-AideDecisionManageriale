function factors(m) {
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

function verificationThHullDobell(m, a, c) {
    // Hull-Dobel theorem

    // to know if the period will be m long or less

    // 1) if c and m are prime between us

    const mFactors = factors(m);
    const cFactors = factors(c);

    const isPrime = !mFactors.some((mf) => cFactors.includes(mf));
    if (!isPrime) throw new Error("c and m are not prime between them");

    const isAM1MultiplyP = aM1MultiplyP(mFactors, a);
    if (!isAM1MultiplyP) throw new Error("a - 1 is not a multiple of p");

    const isMultiply4 = m % 4 != 0 || (a - 1) % 4 == 0;
    if (!isMultiply4) throw new Error("m is  multiple of 4 but a - 1 is not.");

    return isPrime && isAM1MultiplyP && isMultiply4;
}

export { verificationThHullDobell };
