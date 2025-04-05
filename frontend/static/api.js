const API = {
  evaluateGrammar: function () {
    Grammar.generateGrammar();

    const grammar = document.getElementById('generatedGrammar').textContent.trim();
    const startSymbol = document.getElementById('start_symbol').value.trim();
    const inputString = document.getElementById('input_string').value.trim();

    // Validar que se haya ingresado una cadena
    if (!inputString) {
      document.getElementById('result').innerHTML = `
        <div class="text-danger font-medium flex items-center gap-2">
          <i class="bi bi-exclamation-triangle-fill"></i> Error: Debe ingresar una cadena para evaluar
        </div>
      `;
      document.getElementById('grammarType').innerHTML = '';
      document.getElementById('derivationTree').innerHTML = '<svg></svg>';
      return; // Salir de la función si no hay cadena
    }

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


    if (!inputString) {
      document.getElementById('derivationTree').innerHTML = `
        <div class="text-danger font-medium flex items-center gap-2">
          <i class="bi bi-exclamation-triangle-fill"></i> Error: Debe ingresar una cadena para generar el árbol de derivación
        </div>
      `;
      return; 
    }

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
