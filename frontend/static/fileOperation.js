const FileOperations = {
  triggerFileInput: function () {
    document.getElementById('productionFileInput').click();
  },

  handleFileUpload: function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const productions = JSON.parse(e.target.result);
          UI.loadProductionsToUI(productions);
        } catch (error) {
          alert('Error al cargar el archivo: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  },

  downloadProductions: function () {
    const productions = FileOperations.collectProductionsFromUI();
    const dataStr = JSON.stringify(productions, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'producciones.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  },

  collectProductionsFromUI: function () {
    const rows = document.querySelectorAll('#productionsTable tbody tr');
    const productions = [];
    const startSymbol = document.getElementById('start_symbol').value;

    // Depuración: ver cuántas filas estamos procesando
    console.log(`Procesando ${rows.length} filas de producción`);

    rows.forEach((row, index) => {
      const inputs = row.querySelectorAll('input');

      if (inputs.length >= 2) {
        const variableInput = inputs[0];
        const productionInput = inputs[1];

        const variable = variableInput.value.trim();
        let production = productionInput.value.trim();

        console.log(
          `Fila ${index + 1}: Variable=${variable}, Producción=${production}`,
        );

        // Asegurarse de que capturamos producciones que solo contienen lambda (λ)
        if (
          variable &&
          (production || production === 'λ' || production === '')
        ) {
          // Si la producción está vacía o es exactamente "λ", la consideramos como lambda
          if (production === '' || production === 'λ') {
            production = 'λ';
          }

          productions.push({
            variable: variable,
            production: production,
          });
        }
      }
    });

    console.log('Producciones recopiladas:', productions);

    return {
      productions: productions,
      startSymbol: startSymbol,
    };
  },
};
