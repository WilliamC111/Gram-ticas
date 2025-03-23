const UI = {
  elements: {
    productionsTable: null,
    startSymbol: null,
    inputString: null,
    generatedGrammar: null,
    resultDiv: null,
    grammarTypeDiv: null,
    derivationsDiv: null,
    derivationTreeDiv: null,
    productionFileInput: null,
  },

  init: function () {
    // Inicializar referencias a elementos del DOM
    this.elements.productionsTable = document
      .getElementById('productionsTable')
      .getElementsByTagName('tbody')[0];
    this.elements.startSymbol = document.getElementById('start_symbol');
    this.elements.inputString = document.getElementById('input_string');
    this.elements.generatedGrammar = document.getElementById('generatedGrammar');
    this.elements.resultDiv = document.getElementById('result');
    this.elements.grammarTypeDiv = document.getElementById('grammarType');
    this.elements.derivationsDiv = document.getElementById('derivations');
    this.elements.derivationTreeDiv = document.getElementById('derivationTree');
    this.elements.productionFileInput = document.getElementById('productionFileInput');

    // Asegurar que hay al menos una fila de producción
    if (this.elements.productionsTable.children.length === 0) {
      this.addProductionRow();
    }
  },

  addProductionRow: function () {
    const newRow = UI.elements.productionsTable.insertRow();
    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);
    const cell4 = newRow.insertCell(3);

    // Variable input
    const variableInput = document.createElement('input');
    variableInput.type = 'text';
    variableInput.className = 'form-control variable-input';
    variableInput.placeholder = 'Ejemplo: S';
    variableInput.addEventListener('input', () => Validation.validateVariableInput(variableInput));
    cell1.appendChild(variableInput);

    // Símbolo →
    cell2.className = 'text-center align-middle';
    cell2.textContent = '→';

    // Production input
    const productionInput = document.createElement('input');
    productionInput.type = 'text';
    productionInput.className = 'form-control production-input';
    productionInput.placeholder = 'Ejemplo: aB | b';
    productionInput.addEventListener('input', () =>
      Validation.validateProductionInput(productionInput),
    );
    cell3.appendChild(productionInput);

    // Delete button
    cell4.className = 'text-center align-middle';
    cell4.appendChild(UI.createDeleteButton(newRow));
  },

  createDeleteButton: function (row) {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger btn-sm';
    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
    deleteBtn.addEventListener('click', function () {
      row.remove();
    });
    return deleteBtn;
  },

  displayResult: function (data) {
    UI.elements.resultDiv.innerHTML = `<div class="alert ${
      data.result ? 'alert-success' : 'alert-danger'
    }">
            Resultado: ${data.result ? 'Válida' : 'No válida'}
        </div>`;

    UI.elements.grammarTypeDiv.innerHTML = `<h5 class="mt-3">Tipo de Gramática:</h5><div class="fs-5">${data.grammar_type}</div>`;

    // Limpiar el árbol de derivación
    UI.elements.derivationTreeDiv.innerHTML = '';
  },

  displayDerivationTree: function (data) {
    if (typeof data === 'object') {
      UI.elements.derivationTreeDiv.innerHTML = `<h5 class="mt-3">Árbol de Derivación:</h5><pre>${JSON.stringify(
        data,
        null,
        2,
      )}</pre>`;
    } else {
      UI.elements.derivationTreeDiv.innerHTML = `<div class="alert alert-info">${data}</div>`;
    }
  },

  loadProductionsToUI: function (data) {
    UI.elements.productionsTable.innerHTML = '';

    if (data.productions && Array.isArray(data.productions)) {
      data.productions.forEach((prod) => {
        if (!prod || typeof prod !== 'object') return;

        const row = UI.elements.productionsTable.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        const cell3 = row.insertCell(2);
        const cell4 = row.insertCell(3);

        // Variable input
        const variableInput = document.createElement('input');
        variableInput.className = 'form-control variable-input';
        variableInput.value = prod.variable || '';
        variableInput.addEventListener('input', () =>
          Validation.validateVariableInput(variableInput),
        );
        cell1.appendChild(variableInput);

        // Símbolo →
        cell2.className = 'text-center align-middle';
        cell2.textContent = '→';

        // Production input
        const productionInput = document.createElement('input');
        productionInput.className = 'form-control production-input';
        productionInput.value = prod.production || '';
        productionInput.addEventListener('input', () =>
          Validation.validateProductionInput(productionInput),
        );
        cell3.appendChild(productionInput);

        cell4.className = 'text-center align-middle';
        cell4.appendChild(UI.createDeleteButton(row));
      });
    }

    // Cargar símbolo inicial
    if (data.startSymbol) {
      UI.elements.startSymbol.value = data.startSymbol;
    }

    // Asegurar al menos una fila vacía si no hay datos
    if (UI.elements.productionsTable.rows.length === 0) {
      UI.addProductionRow();
    }
  },
};
