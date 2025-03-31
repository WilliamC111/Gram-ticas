const API = {
  evaluateGrammar: function () {
    Grammar.generateGrammar();

    const grammar = document.getElementById('generatedGrammar').textContent.trim();
    const startSymbol = document.getElementById('start_symbol').value.trim();
    const inputString = document.getElementById('input_string').value.trim();

    fetch('/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grammar: grammar,
        start_symbol: startSymbol,
        input_string: inputString,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        UI.displayResult(data);
      })
      .catch((error) => {
        console.error('Error:', error);
        document.getElementById(
          'result',
        ).innerHTML = `<div class="alert alert-danger">Error al comunicarse con el servidor: ${error.message}</div>`;
      });
  },

  generateDerivationTree: function () {
    const grammar = document.getElementById('generatedGrammar').textContent.trim();
    const startSymbol = document.getElementById('start_symbol').value.trim();
    const inputString = document.getElementById('input_string').value.trim();

    fetch('/generate-derivation-tree', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grammar: grammar,
        start_symbol: startSymbol,
        input_string: inputString,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        UI.displayDerivationTree(data);
      })
      .catch((error) => {
        console.error('Error:', error);
        document.getElementById(
          'derivationTree',
        ).innerHTML = `<div class="alert alert-danger">Error al generar el árbol de derivación: ${error.message}</div>`;
      });
  },
};
