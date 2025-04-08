document.addEventListener('DOMContentLoaded', function () {
  UI.init();

  document.getElementById('addProductionBtn').addEventListener('click', UI.addNewRow);
  document.getElementById('generateGrammarBtn').addEventListener('click', Grammar.generateGrammar);
  document.getElementById('evaluateGrammarBtn').addEventListener('click', API.evaluateGrammar);
  document
    .getElementById('generateDerivationsBtn')
    .addEventListener('click', drawTree.generateTree);
  document
    .getElementById('loadProductionBtn')
    .addEventListener('click', FileOperations.triggerFileInput);
  document
    .getElementById('downloadProductionBtn')
    .addEventListener('click', FileOperations.downloadProductions);
  document
    .getElementById('productionFileInput')
    .addEventListener('change', FileOperations.handleFileUpload);
    document.getElementById('generateStringsBtn').addEventListener('click', API.generateStrings);
});