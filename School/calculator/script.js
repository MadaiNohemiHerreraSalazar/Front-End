let cur = '0';
let op = null;
let prev = null;
let justCalc = false;
let exprStr = '';

const valEl = document.getElementById('val');
const exprEl = document.getElementById('expr');

function updateDisplay(v) {
    let s = String(v);
    valEl.className = 'val';
    if (s.length > 11) s = parseFloat(v).toExponential(4);
    if (s.length > 9) valEl.classList.add('xs');
    else if (s.length > 6) valEl.classList.add('sm');
    valEl.textContent = s;
}

function d(n) {
    if (justCalc) { cur = n; exprStr = ''; justCalc = false; }
    else if (cur === '0' && n !== '.') cur = n;
    else if (cur.length < 14) cur += n;
    updateDisplay(cur);
}

function dot() {
    if (justCalc) { cur = '0.'; justCalc = false; }
    else if (!cur.includes('.')) cur += '.';
    updateDisplay(cur);
}

function clr() {
    cur = '0'; op = null; prev = null;
    exprStr = ''; justCalc = false;
    updateDisplay('0');
    exprEl.textContent = '';
}

function del() {
    if (justCalc) { clr(); return; }
    cur = cur.slice(0, -1) || '0';
    updateDisplay(cur);
}

const sym = { '+': '+', '-': '−', '*': '×', '/': '÷' };

function setOp(o) {
    if (op && !justCalc) calc(false);
    prev = parseFloat(cur);
    op = o;
    exprStr = prev + ' ' + (sym[o] || o) + ' ';
    exprEl.textContent = exprStr;
    justCalc = true;
}

function applyOp(a, o, b) {
    if (o === '+') return a + b;
    if (o === '-') return a - b;
    if (o === '*') return a * b;
    if (o === '/') return b === 0 ? 'Erro' : a / b;
}

function fmt(n) {
    if (n === 'Erro' || !isFinite(n)) return 'Erro';
    return String(Math.round(n * 1e10) / 1e10);
}

function calc(show = true) {
    if (!op || prev === null) return;
    const b = parseFloat(cur);
    const expr = exprStr + b;
    const r = applyOp(prev, op, b);
    const res = fmt(r);
    if (show) exprEl.textContent = expr + ' =';
    cur = res === 'Erro' ? '0' : String(Math.round(r * 1e10) / 1e10);
    if (res === 'Erro') cur = '0';
    updateDisplay(res);
    op = null; prev = null; justCalc = true;
}

function calcLog() {
    const n = parseFloat(cur);
    if (isNaN(n) || n <= 0) { updateDisplay('Erro'); return; }
    const baseStr = prompt('Base do logaritmo (padrão = 10):');
    const base = baseStr ? parseFloat(baseStr) : 10;
    if (isNaN(base) || base <= 0 || base === 1) { updateDisplay('Erro'); return; }
    const r = Math.log(n) / Math.log(base);
    exprEl.textContent = 'log' + base + '(' + n + ') =';
    cur = fmt(r);
    updateDisplay(cur);
    justCalc = true;
}

function calcPow() {
    const base = parseFloat(cur);
    if (isNaN(base)) return;
    const expStr2 = prompt('Expoente para ' + base + '^y:');
    const exp = parseFloat(expStr2);
    if (isNaN(exp)) return;
    const r = Math.pow(base, exp);
    exprEl.textContent = base + '^' + exp + ' =';
    cur = fmt(r);
    updateDisplay(cur);
    justCalc = true;
}

document.addEventListener('keydown', e => {
    if (e.key >= '0' && e.key <= '9') d(e.key);
    else if (e.key === '.') dot();
    else if (e.key === '+') setOp('+');
    else if (e.key === '-') setOp('-');
    else if (e.key === '*') setOp('*');
    else if (e.key === '/') { e.preventDefault(); setOp('/'); }
    else if (e.key === 'Enter' || e.key === '=') calc();
    else if (e.key === 'Backspace') del();
    else if (e.key === 'Escape') clr();
});