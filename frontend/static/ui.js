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
      this.addNewRow();
    }
  },

  addNewRow: function () {
    const tableBody = document.querySelector('#productionsTable tbody');
    const newRow = tableBody.insertRow();
    
    // Add hover class to make it interactive
    newRow.className = 'hover:bg-gray-50 transition-colors';
    
    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);
    const cell4 = newRow.insertCell(3);

    // Style the cells
    cell1.className = 'p-3 border-b border-gray-100';
    cell2.className = 'p-3 text-center align-middle border-b border-gray-100';
    cell3.className = 'p-3 border-b border-gray-100';
    cell4.className = 'p-3 text-center border-b border-gray-100';

    // Variable input
    const variableInput = document.createElement('input');
    variableInput.type = 'text';
    variableInput.className = 'w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors variable-input';
    variableInput.placeholder = 'Ejemplo: S';
    variableInput.addEventListener('input', () =>
      Validation.validateVariableInput(variableInput),
    );
    cell1.appendChild(variableInput);

    // Arrow
    const arrowSpan = document.createElement('span');
    arrowSpan.className = 'text-primary font-bold text-lg';
    arrowSpan.textContent = '→';
    cell2.appendChild(arrowSpan);

    // Production input
    const productionInput = document.createElement('input');
    productionInput.type = 'text';
    productionInput.className = 'w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors production-input';
    productionInput.placeholder = 'Ejemplo: aB | b | λ';
    productionInput.addEventListener('input', () =>
      Validation.validateProductionInput(productionInput),
    );
    cell3.appendChild(productionInput);

    // Delete button
    cell4.appendChild(UI.createDeleteButton(newRow));
    
    // Focus on the first input to make it clear this is a new row
    setTimeout(() => variableInput.focus(), 50);
    
    // Scroll to the bottom of the table to make the new row visible
    const tableContainer = document.querySelector('.overflow-x-auto');
    if (tableContainer) {
      tableContainer.scrollTop = tableContainer.scrollHeight;
    }
  },

  createDeleteButton: function (row) {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'p-2 rounded-full bg-danger/10 hover:bg-danger/20 transition-colors text-danger';
    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
    deleteBtn.title = 'Eliminar fila';
    deleteBtn.addEventListener('click', function () {
      // Add animation before removing
      row.style.transition = 'all 0.3s';
      row.style.opacity = '0';
      row.style.transform = 'translateX(10px)';
      
      setTimeout(() => {
        row.remove();
      }, 300);
    });
    return deleteBtn;
  },

  displayResult: function (data) {
    const deriveBtn = document.getElementById('generateDerivationsBtn');
    
    // Limpiar el árbol de derivación en cualquier caso
    UI.elements.derivationTreeDiv.innerHTML = "<svg></svg>";
    
    if (data.result) {
      // Si la cadena es válida
      UI.elements.resultDiv.innerHTML = `
        <div class="text-success font-medium flex items-center gap-2">
          <i class="bi bi-check-circle-fill"></i> Resultado: Válida
        </div>
        <div class="bg-success/10 text-success rounded px-3 py-2 text-sm mt-2 flex items-center gap-2">
          <i class="bi bi-info-circle"></i> Puede generar el árbol de derivación ahora
        </div>
      `;
      
      // Habilitar el botón de derivaciones y añadir una animación sutil para llamar la atención
      deriveBtn.disabled = false;
      deriveBtn.classList.add('animate-pulse');
      setTimeout(() => deriveBtn.classList.remove('animate-pulse'), 1500);
    } else {
      // Si la cadena no es válida
      UI.elements.resultDiv.innerHTML = `
        <div class="text-danger font-medium flex items-center gap-2">
          <i class="bi bi-x-circle-fill"></i> Resultado: No válida
        </div>
      `;
      
      // Desactivar explícitamente el botón
      deriveBtn.disabled = true;
    }

    UI.elements.grammarTypeDiv.innerHTML = `<div class="text-gray-700 mt-2">Tipo de Gramática: <span class="font-medium">${data.grammar_type}</span></div>`;
  },

  displayDerivationTree: function (data) {
    // Crear un contenedor para la información del árbol en lugar de reemplazar todo el SVG
    let infoContainer = document.createElement('div');
    infoContainer.className = 'tree-info mt-3';
    
    if (typeof data === 'object') {
      infoContainer.innerHTML = `<h5>Datos del Árbol de Derivación:</h5><pre>${JSON.stringify(
        data,
        null,
        2,
      )}</pre>`;
    } else {
      infoContainer.innerHTML = `<div class="alert alert-info">${data}</div>`;
    }
    
    // Limpiar información previa si existe
    const existingInfo = UI.elements.derivationTreeDiv.querySelector('.tree-info');
    if (existingInfo) {
      existingInfo.remove();
    }
    
    // Añadir la nueva información sin afectar al SVG
    UI.elements.derivationTreeDiv.appendChild(infoContainer);
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