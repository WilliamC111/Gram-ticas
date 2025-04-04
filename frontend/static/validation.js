const Validation = {
  validateVariableInput: function (input) {
    input.value = input.value.replace(/[^A-Z]/g, '').toUpperCase();
  },

  validateProductionInput: function (input) {
    input.value = input.value.replace(/[^A-Za-z0-9|λ\s]/g, '');
},
};
