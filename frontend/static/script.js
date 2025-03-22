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

  function createDeleteButton(row) {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger btn-sm';
    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
    deleteBtn.addEventListener('click', function () {
      row.remove();
    });
    return deleteBtn;
  }

  function validateVariableInput(input) {
    input.value = input.value.replace(/[^A-Z]/g, '').toUpperCase();
  }

  function validateProductionInput(input) {
    input.value = input.value.replace(/[^A-Za-z|λ\s]/g, '');
  }

  addProductionBtn.addEventListener('click', function () {
    const newRow = productionsTable.insertRow();
    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);
    const cell4 = newRow.insertCell(3);

    const variableInput = document.createElement('input');
    variableInput.type = 'text';
    variableInput.className = 'form-control variable-input';
    variableInput.placeholder = 'Ejemplo: S';
    variableInput.addEventListener('input', () => validateVariableInput(variableInput));
    cell1.appendChild(variableInput);

    cell2.className = 'text-center align-middle';
    cell2.textContent = '→';

    const productionInput = document.createElement('input');
    productionInput.type = 'text';
    productionInput.className = 'form-control production-input';
    productionInput.placeholder = 'Ejemplo: aB | b';
    productionInput.addEventListener('input', () => validateProductionInput(productionInput));
    cell3.appendChild(productionInput);

    // Add the center alignment classes to the delete button cell
    cell4.className = 'text-center align-middle';
    cell4.appendChild(createDeleteButton(newRow));
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
        // Variable es obligatoria
        variables.add(variable);

        // Procesar incluso si la producción está vacía (epsilon)
        const alternatives = production.split('|').map((alt) => alt.trim());

        // Si no hay producción, agregar epsilon
        if (alternatives.length === 0) alternatives.push('');

        for (const alt of alternatives) {
          if (alt === '') {
            // Producción vacía = epsilon
            productions.push(`${variable} → λ`);
          } else {
            const symbols = alt.split(/(?=[A-Z])|\B/).filter((c) => c !== '' && c !== 'λ');
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

    const filteredProductions = productions.filter((prod) => prod.trim() !== '');
    const grammarText = `
    T = (${Array.from(terminals).join(', ')})
    N = (${Array.from(variables).join(', ')})
    S = ${startSymbol}
    P = {
        ${filteredProductions.join('\n    ')}
    }`;

    generatedGrammar.textContent = grammarText;
  });

  evaluateGrammarBtn.addEventListener('click', function () {
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
        resultDiv.innerHTML = `<div class="alert ${data.result ? 'alert-success' : 'alert-danger'}">
                Resultado: ${data.result ? 'Válida' : 'No válida'}
            </div>`;

        grammarTypeDiv.innerHTML = `<h5 class="mt-3">Tipo de Gramática:</h5><div class="fs-5">${data.grammar_type}</div>`;

        // Limpiar el árbol de derivación al evaluar la cadena
        derivationTreeDiv.innerHTML = '';
      });
  });

  generateDerivationsBtn.addEventListener('click', function () {
    const grammar = generatedGrammar.textContent.trim();
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
        if (typeof data === 'object') {
          derivationTreeDiv.innerHTML = `<h5 class="mt-3">Árbol de Derivación:</h5><pre>${JSON.stringify(
            data,
            null,
            2,
          )}</pre>`;
        } else {
          derivationTreeDiv.innerHTML = `<div class="alert alert-info">${data}</div>`;
        }
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
        const cell4 = row.insertCell(3);

        // Variable input
        const variableInput = document.createElement('input');
        variableInput.className = 'form-control variable-input';
        variableInput.value = prod.variable || '';
        variableInput.addEventListener('input', () => validateVariableInput(variableInput));
        cell1.appendChild(variableInput);

        // Símbolo →
        cell2.className = 'text-center align-middle';
        cell2.textContent = '→';

        // Production input
        const productionInput = document.createElement('input');
        productionInput.className = 'form-control production-input';
        productionInput.value = prod.production || '';
        productionInput.addEventListener('input', () => validateProductionInput(productionInput));
        cell3.appendChild(productionInput);

        cell4.className = 'text-center align-middle';
        cell4.appendChild(createDeleteButton(row));
      });
    }

    // Cargar símbolo inicial
    if (data.startSymbol) {
      document.getElementById('start_symbol').value = data.startSymbol;
    }

    // Asegurar al menos una fila vacía si no hay datos
    if (productionsTable.rows.length === 0) {
      const row = productionsTable.insertRow();
      const cell1 = row.insertCell(0);
      const cell2 = row.insertCell(1);
      const cell3 = row.insertCell(2);
      const cell4 = row.insertCell(3);

      // Variable
      const variableInput = document.createElement('input');
      variableInput.className = 'form-control variable-input';
      variableInput.placeholder = 'Ejemplo: S';
      variableInput.addEventListener('input', () => validateVariableInput(variableInput));
      cell1.appendChild(variableInput);

      // Símbolo →
      cell2.className = 'text-center align-middle';
      cell2.textContent = '→';

      // Producción
      const productionInput = document.createElement('input');
      productionInput.className = 'form-control production-input';
      productionInput.placeholder = 'Ejemplo: aB | b';
      productionInput.addEventListener('input', () => validateProductionInput(productionInput));
      cell3.appendChild(productionInput);

      // Botón de eliminar
      cell4.className = 'text-center align-middle';
      cell4.appendChild(createDeleteButton(row));
    }
  }

  if (productionsTable.children.length === 0) {
    addProductionBtn.click();
  }
});
