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
    if (a === b + 1 || a === b - 1) return true;
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
    const factors = new Set();

    while (i ** 2 <= n) {
        if (m % i) {
            i++;
        } else {
            n /= i;
            factors.add(i);
        }
    }

    if (n > 1) {
        factors.add(n);
    }

    return Array.from(factors);
}

function factorsRec(n, i) {}

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

    // m and c are relatively prime,
    if (!areCoPrime(c, m)) return false;
    const mPrimeFactors = primeFactors(m);

    const isAM1MultiplyP = aM1MultiplyP(mFactors, a);
    if (!isAM1MultiplyP) return false;

    const isMultiply4 = m % 4 != 0 || (a - 1) % 4 == 0;
    if (!isMultiply4) return false;

    return true;
}

function factors2(num) {
    let facts = new Set();
    facts.add(1);

    let half = Math.floor(num / 2), // Ensures a whole number <= num.
        i,
        j;

    // Determine our increment value for the loop and starting point.
    num % 2 === 0 ? ((i = 2), (j = 1)) : ((i = 3), (j = 2));

    for (i; i <= half; i += j) {
        num % i === 0 ? facts.add(i) : false;
    }

    facts.add(num); // Always include the original number.
    return Array.from(facts);
}

const factorsMemo = memoizer(factors);
// console.time("old");
// for (let i = 0; i < 1000000; i++) {
//     let m = factors(i);
// }
// console.timeEnd("old");
console.time("new");

for (let i = 0; i < 1000000; i++) {
    let m = factors2(i);
}
console.timeEnd("new");
console.log(hcf(198, 360));
export { verificationThHullDobell };
