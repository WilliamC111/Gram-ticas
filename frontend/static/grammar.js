const Grammar = {
  generateGrammar: function () {
    const variables = new Set();
    const terminals = new Set();
    const productions = [];
    const startSymbol = document.getElementById('start_symbol').value.trim();
    const rows = document
      .getElementById('productionsTable')
      .getElementsByTagName('tbody')[0]
      .getElementsByTagName('tr');

    for (let row of rows) {
      const variableInput = row.getElementsByClassName('variable-input')[0];
      const productionInput = row.getElementsByClassName('production-input')[0];

      if (!variableInput || !productionInput) continue;

      const variable = variableInput.value.trim();
      const production = productionInput.value.trim();

      if (variable) {
        variables.add(variable);

        const alternatives = production.split('|').map((alt) => alt.trim());

        if (alternatives.length === 0) alternatives.push('');

        for (const alt of alternatives) {
          if (alt === '') {
            productions.push(`${variable} → λ`);
          } else {
            const symbols = alt
              .split(/(?=[A-Z])|\B/)
              .filter((c) => c !== '' && c !== 'λ');
            if (symbols.length === 0) {
              productions.push(`${variable} → λ`);
            } else {
              const formattedProduction = symbols.join(' ');
              productions.push(`${variable} → ${formattedProduction}`);
              symbols.forEach((symbol) => {
                if (/^[a-zλ]+$/.test(symbol)) {
                  terminals.add(symbol);
                } else if (/^[A-Z]+$/.test(symbol)) {
                  variables.add(symbol);
                }
              });
            }
          }
        }
      }
    }

    const filteredProductions = productions.filter(
      (prod) => prod.trim() !== '',
    );
    const grammarText = `
    T = (${Array.from(terminals).join(', ')})
    N = (${Array.from(variables).join(', ')})
    S = ${startSymbol}
    P = {
        ${filteredProductions.join('\n    ')}
    }`;

    document.getElementById('generatedGrammar').textContent = grammarText;
    return grammarText;
  },
};
