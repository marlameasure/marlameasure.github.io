// Area constants and conversion logic are centralized here for review and updates.
export const SQFT_PER_SQM = 10.7639104167;
export const SQFT_PER_ACRE = 43560;
export const SQFT_PER_SQYD = 9;
export const MARLA_PER_KANAL = 20;
// Agricultural convention used by the dedicated converter page; not asserted as universal.
export const ACRES_PER_MURABBA = 25;
export const SQFT_PER_MURABBA = SQFT_PER_ACRE * ACRES_PER_MURABBA;
export const DEFAULT_MARLA_STANDARDS = Object.freeze([225, 250, 272.25]);
export const UNITS = Object.freeze(['sqft', 'marla', 'kanal', 'sqyd', 'sqm', 'acre', 'murabba']);
const DISPLAY_FORMAT = new Intl.NumberFormat('en-PK', { maximumFractionDigits: 2 });

export function formatArea(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new RangeError('Display value must be finite.');
  return DISPLAY_FORMAT.format(Object.is(value, -0) ? 0 : value);
}

export function toSquareFeet(value, unit, sqftPerMarla) {
  assertValue(value, 'Value');
  assertUnit(unit);
  assertMarlaSize(sqftPerMarla);
  switch (unit) {
    case 'sqft': return value;
    case 'marla': return value * sqftPerMarla;
    case 'kanal': return value * MARLA_PER_KANAL * sqftPerMarla;
    case 'sqyd': return value * SQFT_PER_SQYD;
    case 'sqm': return value * SQFT_PER_SQM;
    case 'acre': return value * SQFT_PER_ACRE;
    case 'murabba': return value * SQFT_PER_MURABBA;
  }
}

export function fromSquareFeet(squareFeet, unit, sqftPerMarla) {
  assertValue(squareFeet, 'Area');
  assertUnit(unit);
  assertMarlaSize(sqftPerMarla);
  switch (unit) {
    case 'sqft': return squareFeet;
    case 'marla': return squareFeet / sqftPerMarla;
    case 'kanal': return squareFeet / (sqftPerMarla * MARLA_PER_KANAL);
    case 'sqyd': return squareFeet / SQFT_PER_SQYD;
    case 'sqm': return squareFeet / SQFT_PER_SQM;
    case 'acre': return squareFeet / SQFT_PER_ACRE;
    case 'murabba': return squareFeet / SQFT_PER_MURABBA;
  }
}

export function convertArea(value, fromUnit, toUnit, sqftPerMarla) {
  return fromSquareFeet(toSquareFeet(value, fromUnit, sqftPerMarla), toUnit, sqftPerMarla);
}

export function rectangularArea(length, width, dimensionUnit, sqftPerMarla) {
  assertValue(length, 'Length');
  assertValue(width, 'Width');
  assertMarlaSize(sqftPerMarla);
  if (length === 0 || width === 0) throw new RangeError('Length and width must be greater than zero.');
  if (!['ft', 'm'].includes(dimensionUnit)) throw new RangeError('Choose feet or metres for dimensions.');
  const area = length * width * (dimensionUnit === 'm' ? SQFT_PER_SQM : 1);
  if (!Number.isFinite(area)) throw new RangeError('Dimensions are too large to calculate safely.');
  return { sqft: area, marla: area / sqftPerMarla, sqyd: area / SQFT_PER_SQYD, sqm: area / SQFT_PER_SQM, kanal: area / (sqftPerMarla * MARLA_PER_KANAL) };
}

export function assertMarlaSize(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || value > 1e9) throw new RangeError('Marla size must be a positive number no greater than 1,000,000,000 sq ft.');
}

function assertValue(value, label) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1e15) throw new RangeError(`${label} must be a number from 0 to 1,000,000,000,000,000.`);
}
function assertUnit(unit) { if (!UNITS.includes(unit)) throw new RangeError('Choose a supported area unit.'); }
