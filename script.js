// Gaussian Elimination REF/RREF – clean version without Fill Example

const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const solveBtn = document.getElementById('solveBtn');
const matrixArea = document.getElementById('matrixArea');
const stepsContainer = document.getElementById('stepsContainer');
const finalResult = document.getElementById('finalResult');
const finalText = document.getElementById('finalText');
const modeSelect = document.getElementById('mode');

let entries = [];
let n = 0;

clearBtn.style.display = 'none';
solveBtn.style.display = 'none';

function prettyNum(x) {
    if (!isFinite(x)) return String(x);
    if (Math.abs(x - Math.round(x)) < 1e-9) return String(Math.round(x));
    return Number.parseFloat(x.toFixed(6)).toString();
}

function matrixToString(M) {
    if (!M.length) return '';
    const rows = M.map(r => r.map(prettyNum));
    const cols = rows[0].length;
    const widths = Array(cols).fill(0);

    for (const r of rows)
        for (let j = 0; j < cols; j++)
            widths[j] = Math.max(widths[j], String(r[j]).length);

    return rows.map(r => {
        const left = r.slice(0, cols - 1)
            .map((v, j) => v.toString().padStart(widths[j], ' '))
            .join(' ');

        const last = r[cols - 1].toString().padStart(widths[cols - 1], ' ');
        return `[ ${left}  | ${last} ]`;
    }).join('\n');
}

function appendStep(title, M, note) {
    const div = document.createElement('div');
    div.className = 'step';
    const h = document.createElement('h3');
    h.textContent = title;
    div.appendChild(h);

    const pre = document.createElement('div');
    pre.className = 'matrix-snap';
    pre.textContent = matrixToString(M);
    div.appendChild(pre);

    if (note) {
        const p = document.createElement('div');
        p.style.marginTop = '8px';
        p.style.color = '#6b7280';
        p.style.fontSize = '13px';
        p.textContent = note;
        div.appendChild(p);
    }

    stepsContainer.appendChild(div);
    stepsContainer.scrollTop = stepsContainer.scrollHeight;
}

generateBtn.addEventListener('click', () => {
    stepsContainer.innerHTML = '';
    finalResult.style.display = 'none';
    finalText.textContent = '';

    const nInput = parseInt(document.getElementById('n').value);
    if (!nInput || nInput <= 0) { alert('Enter a positive integer for n.'); return; }

    n = nInput;
    entries = [];
    matrixArea.innerHTML = '';

    const label = document.createElement('div');
    label.className = 'hint';
    label.textContent = `Enter augmented matrix (${n} × ${n + 1})`;
    matrixArea.appendChild(label);

    const grid = document.createElement('div');
    grid.className = 'matrix-grid';
    grid.style.gridTemplateColumns = `repeat(${n + 1}, 1fr)`;
    matrixArea.appendChild(grid);

    for (let i = 0; i < n; i++) {
        const rowEls = [];
        for (let j = 0; j < n + 1; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';

            const inp = document.createElement('input');
            inp.type = 'text';
            inp.value = '';

            cell.appendChild(inp);
            grid.appendChild(cell);

            rowEls.push(inp);
        }
        entries.push(rowEls);
    }

    clearBtn.style.display = 'inline-flex';
    solveBtn.style.display = 'inline-flex';
});

clearBtn.addEventListener('click', () => {
    matrixArea.innerHTML = '<div class="hint">Press "Generate Matrix" to create the input grid.</div>';
    entries = [];
    stepsContainer.innerHTML = '<div class="hint">No steps yet — generate matrix and press Solve.</div>';
    finalResult.style.display = 'none';

    clearBtn.style.display = 'none';
    solveBtn.style.display = 'none';
});

function readMatrix() {
    const M = [];
    for (let i = 0; i < n; i++) {
        const row = [];
        for (let j = 0; j < n + 1; j++) {
            const raw = entries[i][j].value.trim();
            if (raw === '') { row.push(0); continue; }

            const v = Number(raw);
            if (Number.isNaN(v)) { alert('All values must be numeric'); return null; }

            row.push(v);
        }
        M.push(row);
    }
    return M;
}

solveBtn.addEventListener('click', () => {
    stepsContainer.innerHTML = '';
    finalResult.style.display = 'none';

    const A = readMatrix();
    if (!A) return;

    const M = A.map(r => r.slice());
    appendStep('Initial Matrix', M);

    const mode = modeSelect.value;
    const eps = 1e-12;
    let row = 0;

    for (let col = 0; col < n && row < n; col++) {
        let pivot = row;
        let maxv = Math.abs(M[row][col]);

        for (let r = row + 1; r < n; r++) {
            if (Math.abs(M[r][col]) > maxv) {
                maxv = Math.abs(M[r][col]);
                pivot = r;
            }
        }

        if (Math.abs(M[pivot][col]) < eps) {
            appendStep(`Column ${col + 1} skipped`, M, 'No pivot found');
            continue;
        }

        if (pivot !== row) {
            [M[row], M[pivot]] = [M[pivot], M[row]];
            appendStep(`Swap rows ${row + 1} and ${pivot + 1}`, M);
        }

        const pv = M[row][col];
        for (let j = col; j < n + 1; j++)
            M[row][j] /= pv;

        appendStep(`Divide row ${row + 1} by ${prettyNum(pv)}`, M);

        for (let r = row + 1; r < n; r++) {
            const factor = M[r][col];
            if (Math.abs(factor) < eps) continue;

            for (let j = col; j < n + 1; j++)
                M[r][j] -= factor * M[row][j];

            appendStep(`R${r + 1} = R${r + 1} - (${prettyNum(factor)})*R${row + 1}`, M);
        }

        row++;
    }

    appendStep('Row Echelon Form (REF)', M);

    if (mode === 'REF') {
        return; 
    }

    for (let i = n - 1; i >= 0; i--) {
        let pivot_col = -1;

        for (let j = 0; j < n; j++)
            if (Math.abs(M[i][j]) > eps) { pivot_col = j; break; }

        if (pivot_col === -1) continue;

        const val = M[i][pivot_col];
        if (Math.abs(val - 1) > eps) {
            for (let j = pivot_col; j < n + 1; j++)
                M[i][j] /= val;

            appendStep(`Normalize row ${i + 1}`, M);
        }

        for (let r = 0; r < i; r++) {
            const factor = M[r][pivot_col];
            if (Math.abs(factor) < eps) continue;

            for (let j = pivot_col; j < n + 1; j++)
                M[r][j] -= factor * M[i][j];

            appendStep(`R${r + 1} = R${r + 1} - (${prettyNum(factor)})*R${i + 1}`, M);
        }
    }

    appendStep('Reduced Row Echelon Form (RREF)', M);

    const sol = [];
    for (let i = 0; i < n; i++) sol.push(M[i][n]);

    finalText.textContent = sol.map((v, i) => `x${i + 1} = ${prettyNum(v)}`).join('\n');
    finalResult.style.display = 'block';
});
