


const Formatters = {
  


  formatCPF(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    input.value = value;
  },

  


  formatCEP(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    input.value = value;
  },

  


  formatPhone(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/(\d{2})(\d)/, '($1) $2');
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    input.value = value;
  },

  


  formatCardNumber(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})/g, '$1 ').trim();
    input.value = value;
  },

  


  formatExpiryDate(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.replace(/(\d{2})(\d)/, '$1/$2');
    }
    input.value = value;
  },

  


  formatPrice(value) {
    const amount = Number(value);
    if (Number.isNaN(amount)) return '0,00';
    return amount.toFixed(2).replace('.', ',');
  },

  


  makePriceFromScore(score) {
    const base = 19.9;
    const validScore = score && !isNaN(score) ? Math.min(Math.max(score, 0), 10) : 5; 
    const extra = validScore * 1.5;
    return (base + extra).toFixed(2);
  }
};

export { Formatters };
