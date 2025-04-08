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
      // Find the input elements directly within the row's cells to avoid class name issues
      const cells = row.getElementsByTagName('td');
      const variableInput = cells[0]?.querySelector('input');
      const productionInput = cells[2]?.querySelector('input');

      if (!variableInput || !productionInput) continue;

      const variable = variableInput.value.trim();
      const production = productionInput.value.trim();

      if (variable) {
        variables.add(variable);

        const alternatives = production.split('|').map((alt) => alt.trim());

        if (
          alternatives.length === 0 ||
          (alternatives.length === 1 && alternatives[0] === '')
        ) {
          alternatives[0] = 'λ';
        }

        for (const alt of alternatives) {
          if (alt === '' || alt === 'λ') {
            productions.push(`${variable} → λ`);
          } else {
            // Process each character, keeping uppercase letters as separate symbols
            const symbols = [];
            for (let i = 0; i < alt.length; i++) {
              const char = alt[i];
              if (/[A-Z]/.test(char)) {
                symbols.push(char);
                variables.add(char);
              } else if (/[a-z0-9]/.test(char)) {
                symbols.push(char);
                terminals.add(char);
              }
            }

            if (symbols.length === 0) {
              productions.push(`${variable} → λ`);
            } else {
              const formattedProduction = symbols.join(' ');
              productions.push(`${variable} → ${formattedProduction}`);
            }
          }
        }
      }
    }

    const filteredProductions = productions.filter(
      (prod) => prod.trim() !== '',
    );

    const grammarText = `
    T = {${Array.from(terminals).join(', ')}}
    N = {${Array.from(variables).join(', ')}}
    S = ${startSymbol}
    P = {
        ${filteredProductions.join('\n    ')}
    }`;

    document.getElementById('generatedGrammar').textContent = grammarText;
    return grammarText;
  },
};
