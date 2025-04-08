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
        // Removemos la llamada automática a generateStrings
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
    const maxLength = document.getElementById('max_length').value;

    // Validar que la gramática existe
    if (!grammar) {
      document.getElementById('generatedStrings').innerHTML = `
        <div class="text-warning font-medium flex items-center gap-2">
          <i class="bi bi-exclamation-triangle-fill"></i> Primero genere una gramática válida
        </div>
      `;
      return;
    }

    // Mostrar estado de carga
    document.getElementById('generatedStrings').innerHTML = `
      <div class="flex items-center justify-center gap-2 text-gray-400">
        <i class="bi bi-arrow-repeat animate-spin"></i> Generando cadenas...
      </div>
    `;

    fetch('/generate_strings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grammar: grammar,
        start_symbol: startSymbol,
        max_length: maxLength ? parseInt(maxLength) : null
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
            <i class="bi bi-exclamation-triangle-fill"></i> Error al generar cadenas: ${error.message}
          </div>
        `;
      });
  },
};