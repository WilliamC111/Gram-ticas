// api.js
const API = {
  evaluateGrammar: function () {
    Grammar.generateGrammar();

    const grammar = document
      .getElementById('generatedGrammar')
      .textContent.trim();
    const startSymbol = document.getElementById('start_symbol').value.trim();
    const inputString = document.getElementById('input_string').value.trim();

    if (!inputString) {
      document.getElementById('result').innerHTML = `
        <div class="text-danger font-medium flex items-center gap-2">
          <i class="bi bi-exclamation-triangle-fill"></i> Error: Debe ingresar una cadena para evaluar
        </div>
      `;
      document.getElementById('grammarType').innerHTML = '';
      document.getElementById('derivationTree').innerHTML = '<svg></svg>';
      document.getElementById('generatedStrings').innerHTML = '';
      return;
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
        // Llamar a la función para generar cadenas automáticamente después de evaluar
        API.generateStrings();
      })
      .catch((error) => {
        console.error('Error:', error);
        document.getElementById(
          'result',
        ).innerHTML = `<div class="alert alert-danger">Error al comunicarse con el servidor: ${error.message}</div>`;
      });
  },

  generateStrings: function () {
    const grammar = document
      .getElementById('generatedGrammar')
      .textContent.trim();
    const startSymbol = document.getElementById('start_symbol').value.trim();

    fetch('/generate_strings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grammar: grammar,
        start_symbol: startSymbol,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        UI.displayGeneratedStrings(data);
      })
      .catch((error) => {
        console.error('Error:', error);
        document.getElementById('generatedStrings').innerHTML = `
          <div class="text-danger font-medium flex items-center gap-2">
            <i class="bi bi-exclamation-triangle-fill"></i> Error al generar cadenas
          </div>
        `;
      });
  },
};