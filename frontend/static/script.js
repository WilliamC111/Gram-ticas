document.addEventListener('DOMContentLoaded', function () {
  const productionsTable = document
    .getElementById('productionsTable')
    .getElementsByTagName('tbody')[0];
  const addProductionBtn = document.getElementById('addProductionBtn');
  const generateGrammarBtn = document.getElementById('generateGrammarBtn');
  const evaluateGrammarBtn = document.getElementById('evaluateGrammarBtn');
  const generateDerivationsBtn = document.getElementById('generateDerivationsBtn');
  const loadProductionBtn = document.getElementById('loadProductionBtn');
  const downloadProductionBtn = document.getElementById('downloadProductionBtn');
  const productionFileInput = document.getElementById('productionFileInput');
  const generatedGrammar = document.getElementById('generatedGrammar');
  const resultDiv = document.getElementById('result');
  const derivationsDiv = document.getElementById('derivations');
  const grammarTypeDiv = document.getElementById('grammarType');
  const derivationTreeDiv = document.getElementById('derivationTree');

  addProductionBtn.addEventListener('click', function () {
    const newRow = productionsTable.insertRow();
    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);

    cell1.innerHTML =
      '<input type="text" class="form-control variable-input" placeholder="Ejemplo: S">';
    cell2.className = 'text-center align-middle';
    cell2.textContent = '→';
    cell3.innerHTML =
      '<input type="text" class="form-control production-input" placeholder="Ejemplo: aB | b">';
  });

  generateGrammarBtn.addEventListener('click', function () {
    const variables = new Set();
    const terminals = new Set();
    const productions = [];
    const startSymbol = document.getElementById('start_symbol').value.trim();

    const rows = productionsTable.getElementsByTagName('tr');
    for (let row of rows) {
      const variableInput = row.getElementsByClassName('variable-input')[0];
      const productionInput = row.getElementsByClassName('production-input')[0];

      if (!variableInput || !productionInput) continue;

      const variable = variableInput.value.trim();
      const production = productionInput.value.trim();

      if (variable) {
        variables.add(variable);

        if (production) {
          const alternatives = production.split('|').map((alt) => alt.trim());
          for (const alt of alternatives) {
            const symbols = alt.split(/(?=[A-Z])|\B/).filter((c) => c !== '' && c !== 'λ');
            if (symbols.length === 0) {
              productions.push(`${variable} → λ`);
            } else {
              const formattedProduction = symbols.join(' ');
              productions.push(`${variable} → ${formattedProduction}`);
              symbols.forEach((symbol) => {
                if (/^[a-z]+$/.test(symbol)) {
                  terminals.add(symbol);
                } else if (/^[A-Z]+$/.test(symbol)) {
                  variables.add(symbol);
                }
              });
            }
          }
        } else {
          productions.push(`${variable} → `);
        }
      }
    }

    const grammarText = `
T = (${Array.from(terminals).join(', ')})
N = (${Array.from(variables).join(', ')})
S = ${startSymbol}
P = {
    ${productions.join('\n    ')}
}`;

    generatedGrammar.textContent = grammarText;
  });

  evaluateGrammarBtn.addEventListener('click', function () {
    const grammar = generatedGrammar.textContent.trim();
    const startSymbol = document.getElementById('start_symbol').value.trim();
    if (!startSymbol || !/[A-Z]/.test(startSymbol)) {
      alert('Símbolo inicial inválido. Debe ser una letra mayúscula.');
      return;
    }
    const inputString = document.getElementById('input_string').value.trim();

    fetch('/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grammar: grammar,
        start_symbol: startSymbol || 'S',
        input_string: inputString,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        resultDiv.innerHTML = `<div class="alert ${data.result ? 'alert-success' : 'alert-danger'}">
        Resultado: ${data.result ? 'Válida' : 'No válida'}
    </div>`;

        derivationsDiv.innerHTML =
          data.derivations.length > 0
            ? `<h5 class="mt-3">Derivaciones:</h5><ul>${data.derivations
                .map((d) => `<li>${d.join(' → ')}</li>`)
                .join('')}</ul>`
            : '';

        grammarTypeDiv.innerHTML = `<h5 class="mt-3">Tipo de Gramática:</h5><div class="fs-5">${data.grammar_type}</div>`;

        derivationTreeDiv.innerHTML =
          data.derivation_tree && typeof data.derivation_tree === 'object'
            ? `<h5 class="mt-3">Árbol de Derivación:</h5><pre>${JSON.stringify(
                data.derivation_tree,
                null,
                2,
              )}</pre>`
            : `<div class="alert alert-info mt-3">${
                data.derivation_tree || 'No se pudo generar el árbol'
              }</div>`;
      });
  });

  generateDerivationsBtn.addEventListener('click', function () {
    const grammar = generatedGrammar.textContent.trim();
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
        derivationsDiv.textContent = `Derivaciones: ${JSON.stringify(data.derivations)}`;

        if (data.grammar_type === 'Tipo 2' || data.grammar_type === 'Tipo 3') {
          derivationTreeDiv.innerHTML = `<pre class="bg-light p-3 border rounded">Árbol de Derivación:\n${JSON.stringify(
            data.derivation_tree,
            null,
            2,
          )}</pre>`;
        } else {
          derivationTreeDiv.innerHTML = `<div class="alert alert-info">No aplica: La gramática no es de Tipo 2 o Tipo 3.</div>`;
        }
      })
      .catch((error) => {
        derivationsDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
      });
  });

  loadProductionBtn.addEventListener('click', function () {
    productionFileInput.click();
  });

  productionFileInput.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const productions = JSON.parse(e.target.result);
          loadProductionsToUI(productions);
        } catch (error) {
          alert('Error al cargar el archivo: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  });

  downloadProductionBtn.addEventListener('click', function () {
    const productions = collectProductionsFromUI();
    const dataStr = JSON.stringify(productions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'producciones.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  });

  function collectProductionsFromUI() {
    const rows = document.querySelectorAll('#productionsTable tbody tr');
    const productions = [];

    rows.forEach((row) => {
      const variableInput = row.querySelector('.variable-input');
      const productionInput = row.querySelector('.production-input');

      if (variableInput && productionInput) {
        const variable = variableInput.value.trim();
        const production = productionInput.value.trim();

        if (variable && production) {
          productions.push({
            variable: variable,
            production: production,
          });
        }
      }
    });

    return {
      productions: productions,
      startSymbol: document.getElementById('start_symbol').value,
    };
  }

  function loadProductionsToUI(data) {
    productionsTable.innerHTML = '';

    if (data.productions && Array.isArray(data.productions)) {
      data.productions.forEach((prod) => {
        if (!prod || typeof prod !== 'object') return;

        const row = productionsTable.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        const cell3 = row.insertCell(2);

        cell1.innerHTML = `<input type="text" class="form-control variable-input" value="${
          prod.variable ? prod.variable.replace(/"/g, '&quot;') : ''
        }">`;
        cell2.className = 'text-center align-middle';
        cell2.textContent = '→';
        cell3.innerHTML = `<input type="text" class="form-control production-input" value="${
          prod.production ? prod.production.replace(/"/g, '&quot;') : ''
        }">`;
      });
    }

    if (productionsTable.children.length === 0) {
      const row = productionsTable.insertRow();
      const cell1 = row.insertCell(0);
      const cell2 = row.insertCell(1);
      const cell3 = row.insertCell(2);

      cell1.innerHTML =
        '<input type="text" class="form-control variable-input" placeholder="Ejemplo: S">';
      cell2.className = 'text-center align-middle';
      cell2.textContent = '→';
      cell3.innerHTML =
        '<input type="text" class="form-control production-input" placeholder="Ejemplo: aB | b">';
    }

    if (data.startSymbol) {
      document.getElementById('start_symbol').value = data.startSymbol;
    }
  }

  if (productionsTable.children.length === 0) {
    addProductionBtn.click();
  }
});
