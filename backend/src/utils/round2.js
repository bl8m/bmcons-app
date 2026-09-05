// Arrotonda a 2 decimali un valore numerico (importi, quote, ecc.).
// Non tocca valori non numerici: comodo da usare sia come Mongoose `set`
// sia dentro le trasformazioni zod.
export const round2 = (value) => (typeof value === 'number' ? Math.round(value * 100) / 100 : value);
