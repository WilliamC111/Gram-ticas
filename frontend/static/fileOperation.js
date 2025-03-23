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
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'producciones.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  },

  collectProductionsFromUI: function () {
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
  },
};
