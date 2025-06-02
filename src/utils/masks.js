// src/utils/masks.js
export function getCpfCnpjMask(value = "") {
  // Remove tudo que não for dígito
  const digits = value.replace(/\D/g, "");
  // CNPJ tem 14 dígitos, CPF tem 11
  return digits.length > 11 ? "99.999.999/9999-99" : "999.999.999-99";
}
