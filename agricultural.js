import { convertArea, formatArea, fromSquareFeet } from './calculator.js';

const $ = id => document.getElementById(id);
const standard = $('agri-standard');
const custom = $('agri-custom-size');
const amount = $('agri-amount');
const from = $('agri-from');
const to = $('agri-to');
const labels = { murabba: 'Murabba', acre: 'acres', kanal: 'kanal', marla: 'marla', sqft: 'sq ft' };
let lastResult = 25;
let validResult = true;

function marlaSize() {
  const size = standard.value === 'custom' ? Number(custom.value) : Number(standard.value);
  if (!Number.isFinite(size) || size <= 0 || size > 1e9) throw new RangeError('Enter a custom marla size greater than zero and no more than 1,000,000,000 sq ft.');
  return size;
}
function readAmount() {
  if (!amount.value.trim()) throw new RangeError('Enter a value to see the conversion.');
  const value = Number(amount.value);
  if (!Number.isFinite(value) || value < 0 || value > 1e15) throw new RangeError('Enter a valid number from 0 to 1,000,000,000,000,000.');
  return value;
}
function renderTable(size) {
  $('agri-table-standard').textContent = `Acres use 25 acres per Murabba; Marla and Kanal follow ${formatArea(size)} sq ft per marla.`;
  $('agri-table').replaceChildren(...[1,2,5,10].map(count => {
    const acres = count * 25;
    const sqft = acres * 43560;
    const cells = [count, acres, fromSquareFeet(sqft, 'kanal', size), fromSquareFeet(sqft, 'marla', size)];
    const row = document.createElement('tr');
    cells.forEach((value, index) => {
      const cell = document.createElement(index === 0 ? 'th' : 'td');
      if (index === 0) cell.scope = 'row';
      cell.textContent = index === 0 ? `${formatArea(value)} Murabba` : formatArea(value);
      row.append(cell);
    });
    return row;
  }));
}
function update() {
  $('agri-error').textContent = '';
  $('agri-copy-status').textContent = '';
  try {
    const value = readAmount();
    const size = marlaSize();
    const sqft = convertArea(value, from.value, 'sqft', size);
    const result = fromSquareFeet(sqft, to.value, size);
    if (![sqft, result].every(Number.isFinite)) throw new RangeError('This value is too large to display safely.');
    lastResult = result;
    validResult = true;
    $('agri-result').textContent = formatArea(result);
    $('agri-result-unit').textContent = labels[to.value];
    $('agri-context').textContent = `Using 25 acres per Murabba · 1 kanal = 20 marla · ${formatArea(size)} sq ft per marla`;
    $('agri-eq-murabba').textContent = formatArea(fromSquareFeet(sqft, 'murabba', size));
    $('agri-eq-acre').textContent = formatArea(fromSquareFeet(sqft, 'acre', size));
    $('agri-eq-kanal').textContent = formatArea(fromSquareFeet(sqft, 'kanal', size));
    $('agri-eq-marla').textContent = formatArea(fromSquareFeet(sqft, 'marla', size));
    $('agri-eq-sqft').textContent = formatArea(sqft);
  } catch (error) {
    validResult = false;
    $('agri-result').textContent = '—';
    $('agri-result-unit').textContent = labels[to.value];
    $('agri-context').textContent = 'Choose a valid marla standard and enter a valid value.';
    for (const id of ['murabba','acre','kanal','marla','sqft']) $(`agri-eq-${id}`).textContent = '—';
    $('agri-error').textContent = error.message;
  }
  try { renderTable(marlaSize()); } catch { $('agri-table-standard').textContent = 'Enter a valid custom marla size to update this table.'; }
}

for (const field of [amount, from, to, custom]) field.addEventListener('input', update);
for (const field of [from, to]) field.addEventListener('change', update);
standard.addEventListener('change', () => { $('agri-custom-field').hidden = standard.value !== 'custom'; update(); });
$('agri-swap').addEventListener('click', () => {
  if (!validResult) return;
  const previousFrom = from.value;
  amount.value = String(lastResult);
  from.value = to.value;
  to.value = previousFrom;
  update(); amount.focus();
});
$('agri-copy').addEventListener('click', async () => {
  if (!validResult) { $('agri-copy-status').textContent = 'Enter a valid value first.'; return; }
  try { await navigator.clipboard.writeText(`${amount.value} ${labels[from.value]} = ${formatArea(lastResult)} ${labels[to.value]} (25 acres per Murabba)`); $('agri-copy-status').textContent = 'Result copied.'; }
  catch { $('agri-copy-status').textContent = 'Copy is unavailable in this browser.'; }
});
$('agri-reset').addEventListener('click', () => { standard.value = '272.25'; custom.value = ''; $('agri-custom-field').hidden = true; amount.value = '1'; from.value = 'murabba'; to.value = 'acre'; update(); amount.focus(); });
$('year').textContent = new Date().getFullYear();
update();
