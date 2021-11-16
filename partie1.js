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

const suite = generationSuiteAleatoire(8, 5, 5, 3);
console.log(suite)

