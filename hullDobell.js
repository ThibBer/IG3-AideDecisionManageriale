function memoizer(fun) {
    let cache = {};
    return function (n) {
        if (cache[n] != undefined) {
            return cache[n];
        } else {
            let result = fun(n);
            cache[n] = result;
            return result;
        }
    };
}

// src: https://www.cuemath.com/numbers/coprime-numbers/
function areCoPrime(a, b) {
    if (Math.abs(a - b) === 1) return true;
    if (a % 2 === 0 && b % 2 === 0) return false;
    if (a < b) return hcf(a, b) === 1;
    return hcf(b, a) === 1;
}

// src: https://www.cuemath.com/numbers/hcf-highest-common-factor/
// pre-condition: a < b
function hcf(a, b) {
    if (a === 0) return b;
    return hcf(b % a, a);
}

function primeFactors(n) {
    let i = 2;
    const allFactors = new Set();

    while (i ** 2 <= n) {
        if (n % i) {
            i++;
        } else {
            n /= i;
            allFactors.add(i);
        }
    }

    if (n > 1) {
        allFactors.add(n);
    }
    const factors = [...allFactors];
    return factors;
}

function verificationThHullDobell(m, a, c) {
    // Hull-Dobel theorem

    // to know if the period will be m long or less

    // m and c are relatively prime,
    if (!areCoPrime(c, m)) return false;
    const mPrimeFactors = primeFactors(m);
    // a-1 is divisible by all prime factors of m,
    if (!mPrimeFactors.every((p) => (a - 1) % p === 0)) return false;
    // a - 1 is divisible by 4 if m is divisible by 4.
    const isMultiply4 = m % 4 != 0 || (a - 1) % 4 == 0;
    if (!isMultiply4) return false;

    return true;
}

export { verificationThHullDobell };
