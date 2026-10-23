import { convertArea, formatArea, fromSquareFeet, rectangularArea } from './calculator.js';

const $ = (id) => document.getElementById(id);
const standard = $('marla-standard');
const customInput = $('custom-size');
const from = $('from-unit');
const to = $('to-unit');
const amount = $('amount');
const labels = { sqft: 'sq ft', marla: 'marla', kanal: 'kanal', sqyd: 'sq yd', sqm: 'm²', acre: 'acres' };
const selectLabels = { sqft: 'Square feet (sq ft)', marla: 'Marla', kanal: 'Kanal', sqyd: 'Square yards (sq yd)', sqm: 'Square metres (m²)', acre: 'Acres' };
let lastResult = 0;
let hasResult = false;

function activeMarlaSize() {
  const value = standard.value === 'custom' ? Number(customInput.value) : Number(standard.value);
  if (!Number.isFinite(value) || value <= 0 || value > 1e9) throw new RangeError('Enter a custom marla size greater than zero and no more than 1,000,000,000 sq ft.');
  return value;
}
function format(value) { return formatArea(value); }
function inputNumber(input) {
  if (input.value.trim() === '') throw new RangeError('Enter a value to see the conversion.');
  const value = Number(input.value);
  if (!Number.isFinite(value) || value < 0 || value > 1e15) throw new RangeError('Enter a valid number from 0 to 1,000,000,000,000,000.');
  return value;
}
function resetOutput() {
  $('main-result').textContent = '—';
  $('result-unit-label').textContent = labels[to.value];
  ['sqft','sqyd','sqm','kanal','acre'].forEach(unit => $(`eq-${unit}`).textContent = '—');
  $('conversion-context').textContent = 'Choose a marla standard and enter a valid value.';
  hasResult = false;
}
function updateConverter() {
  $('copy-status').textContent = '';
  $('convert-error').textContent = '';
  try {
    const marlaSize = activeMarlaSize();
    const value = inputNumber(amount);
    const sqft = convertArea(value, from.value, 'sqft', marlaSize);
    const result = fromSquareFeet(sqft, to.value, marlaSize);
    if (![sqft, result].every(Number.isFinite)) throw new RangeError('This value is too large to display safely.');
    lastResult = result;
    hasResult = true;
    $('main-result').textContent = format(result);
    $('result-unit-label').textContent = labels[to.value];
    $('eq-sqft').textContent = format(sqft);
    $('eq-sqyd').textContent = format(fromSquareFeet(sqft, 'sqyd', marlaSize));
    $('eq-sqm').textContent = format(fromSquareFeet(sqft, 'sqm', marlaSize));
    $('eq-kanal').textContent = format(fromSquareFeet(sqft, 'kanal', marlaSize));
    $('eq-acre').textContent = format(fromSquareFeet(sqft, 'acre', marlaSize));
    $('conversion-context').textContent = `Using ${format(marlaSize)} sq ft per marla · 1 kanal = 20 marla`;
  } catch (error) {
    resetOutput();
    $('convert-error').textContent = error.message;
  }
  updateReference();
}
function updateReference() {
  let size;
  try { size = activeMarlaSize(); }
  catch { $('table-standard').textContent = 'Enter a valid custom marla size to update this table.'; return; }
  $('table-standard').textContent = `Based on ${format(size)} square feet per marla`;
  const rows = [1, 3, 5, 10, 20];
  $('reference-rows').replaceChildren(...rows.map(marla => {
    const row = document.createElement('tr');
    const heading = document.createElement('th'); heading.scope = 'row'; heading.textContent = marla === 20 ? '20 marla (1 kanal)' : `${marla} marla`;
    const area = document.createElement('td'); area.textContent = format(marla * size);
    const kanal = document.createElement('td'); kanal.textContent = format(marla / 20);
    row.append(heading, area, kanal); return row;
  }));
  document.querySelectorAll('[data-marla]').forEach(button => {
    const marla = Number(button.dataset.marla);
    button.querySelector('strong').textContent = `${format(marla * size)} sq ft`;
  });
}
function updateDimensions() {
  $('dimension-error').textContent = '';
  try {
    const length = inputNumber($('length'));
    const width = inputNumber($('width'));
    const result = rectangularArea(length, width, $('dimension-unit').value, activeMarlaSize());
    $('dimension-marla').textContent = `${format(result.marla)} marla`;
    $('dimension-summary').textContent = `${format(length)} × ${format(width)} ${$('dimension-unit').value === 'ft' ? 'ft' : 'm'} = ${format(result.sqft)} sq ft · using ${format(activeMarlaSize())} sq ft per marla`;
    $('dimension-sqft').textContent = `${format(result.sqft)} sq ft`;
    $('dimension-sqyd').textContent = `${format(result.sqyd)} sq yd`;
    $('dimension-sqm').textContent = `${format(result.sqm)} m²`;
    $('dimension-kanal').textContent = `${format(result.kanal)} kanal`;
  } catch (error) {
    $('dimension-marla').textContent = '—';
    $('dimension-summary').textContent = 'Enter length and width to see the area and its equivalents.';
    ['dimension-sqft','dimension-sqyd','dimension-sqm','dimension-kanal'].forEach(id => $(id).textContent = '—');
    if ($('length').value || $('width').value || standard.value === 'custom') $('dimension-error').textContent = error.message;
  }
}
function activateTab(tabName) {
  const dimensions = tabName === 'dimensions';
  $('convert-tab').setAttribute('aria-selected', String(!dimensions));
  $('dimensions-tab').setAttribute('aria-selected', String(dimensions));
  $('convert-tab').tabIndex = dimensions ? -1 : 0;
  $('dimensions-tab').tabIndex = dimensions ? 0 : -1;
  $('convert-panel').hidden = dimensions;
  $('dimensions-panel').hidden = !dimensions;
}

[amount, from, to, customInput].forEach(element => element.addEventListener('input', updateConverter));
[from, to].forEach(element => element.addEventListener('change', updateConverter));
standard.addEventListener('change', () => {
  $('custom-field').hidden = standard.value !== 'custom';
  customInput.setAttribute('aria-invalid', 'false');
  updateConverter(); updateDimensions();
});
customInput.addEventListener('input', () => { updateConverter(); updateDimensions(); });
$('swap-units').addEventListener('click', () => {
  if (!hasResult) return;
  const previousFrom = from.value;
  amount.value = String(lastResult);
  from.value = to.value;
  to.value = previousFrom;
  updateConverter(); amount.focus();
});
$('copy-result').addEventListener('click', async () => {
  if (!hasResult) { $('copy-status').textContent = 'Enter a valid value first.'; return; }
  const text = `${amount.value} ${selectLabels[from.value]} = ${format(lastResult)} ${selectLabels[to.value]} (${format(activeMarlaSize())} sq ft per marla)`;
  try { await navigator.clipboard.writeText(text); $('copy-status').textContent = 'Result copied.'; }
  catch { $('copy-status').textContent = 'Copy is unavailable in this browser.'; }
});
$('reset-converter').addEventListener('click', () => { standard.value = '272.25'; customInput.value = ''; $('custom-field').hidden = true; amount.value = '5'; from.value = 'marla'; to.value = 'sqft'; $('copy-status').textContent = ''; updateConverter(); updateDimensions(); amount.focus(); });
document.querySelectorAll('[data-marla]').forEach(button => button.addEventListener('click', () => {
  amount.value = button.dataset.marla; from.value = 'marla'; to.value = 'sqft'; activateTab('convert'); updateConverter(); $('calculator').scrollIntoView({ behavior: 'smooth', block: 'center' }); amount.focus({ preventScroll: true });
}));
['length','width','dimension-unit'].forEach(id => $(id).addEventListener('input', updateDimensions));
$('dimension-unit').addEventListener('change', updateDimensions);
for (const name of ['convert','dimensions']) {
  const tab = $(`${name}-tab`);
  tab.addEventListener('click', () => activateTab(name));
  tab.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); const next = name === 'convert' ? 'dimensions' : 'convert'; activateTab(next); $(`${next}-tab`).focus(); }
  });
}
document.querySelector('[data-open-dimensions]').addEventListener('click', () => activateTab('dimensions'));
$('year').textContent = new Date().getFullYear();
updateConverter(); updateDimensions();
