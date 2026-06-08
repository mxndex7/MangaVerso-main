


const Validators = {
  


  isValidEmail(email) {
    const trimmed = email.trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(trimmed);
  },

  


  isValidPhone(phone) {
    const digits = phone.replace(/\D/g, '');
    return /^(?:\d{10}|\d{11})$/.test(digits);
  },

  


  isValidCPF(cpf) {
    const digits = cpf.replace(/\D/g, '');
    
    if (!/^\d{11}$/.test(digits)) return false;
    if (/^(\d)\1{10}$/.test(digits)) return false;

    const calcCheckDigit = (baseDigits) => {
      let multiplier = baseDigits.length + 1;
      const sum = baseDigits.split('').reduce(
        (acc, digit) => acc + Number(digit) * multiplier--,
        0
      );
      const result = 11 - (sum % 11);
      return result >= 10 ? 0 : result;
    };

    const firstNine = digits.slice(0, 9);
    const firstCheck = calcCheckDigit(firstNine);
    const secondCheck = calcCheckDigit(firstNine + firstCheck);

    return (
      Number(digits[9]) === firstCheck &&
      Number(digits[10]) === secondCheck
    );
  },

  


  isValidCEP(cep) {
    const digits = cep.replace(/\D/g, '');
    return /^\d{8}$/.test(digits);
  },

  


  isValidCardNumber(cardNumber) {
    const digits = cardNumber.replace(/\D/g, '');
    return /^\d{16}$/.test(digits);
  },

  


  isValidExpiryDate(expiryDate) {
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) return false;
    const [month] = expiryDate.split('/').map(Number);
    return month >= 1 && month <= 12;
  },

  


  isValidCVV(cvv) {
    const digits = cvv.replace(/\D/g, '');
    return /^[0-9]{3,4}$/.test(digits);
  },

  


  isValidName(name) {
    return /^[A-Za-zÀ-ÿ\s]+$/.test(name.trim());
  }
};

export { Validators };
