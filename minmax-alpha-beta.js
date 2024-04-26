// Row and column count
var ROWS = 6;
var COLS = 7;
// Turns
var PLAYER_TURN = 0;
var AI_TURN = 1;
// Pieces represented as numbers
var PLAYER_PIECE = 1;
var AI_PIECE = 2;
//depth
var depth;
var game_over = false;
var not_over = true;
var turn = Math.floor(Math.random() * 2);
var board = createBoard();
document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById("start");
    var resetButton = document.getElementById("reset");
    var value = document.querySelectorAll('input[name="dificultad"]');
    drawBoardWon();
    btn === null || btn === void 0 ? void 0 : btn.addEventListener("click", function () {
        value.forEach(function (num) {
            if (num.checked) {
                depth = parseInt(num.value, 10);
            }
        });
        console.log("La profundidad es: ", depth);
        drawBoard();
        if (turn === AI_TURN) {
            dropPieceAI();
        }
        else {
            console.log("Player's turn");
        }
        btn.style.display = 'none';
        if (resetButton) {
            resetButton.style.display = 'block';
        }
        mostrarTurno();
    });
    resetButton === null || resetButton === void 0 ? void 0 : resetButton.addEventListener("click", function () {
        board = createBoard();
        drawBoardWon();
        game_over = false;
        not_over = true;
        turn = Math.floor(Math.random() * 2);
        resetButton.style.display = 'none';
        if (btn) {
            btn.style.display = 'block';
        }
        var turnoMain = document.getElementById('turno-main');
        if (turnoMain) {
            turnoMain.style.display = 'none';
        }
    });
});
function mostrarTurno() {
    var turnoMain = document.getElementById('turno-main');
    if (turnoMain) {
        var turnoHtml = "\n            <h2 style=\"color: #F2F3F4\">Turno</h2>\n            <div style=\"color: #F2F3F4\">".concat(turn === AI_TURN ? 'Maquina' : 'Humano', "</div>\n        ");
        // Actualiza el contenido del contenedor
        turnoMain.innerHTML = turnoHtml;
        turnoMain.style.display = 'block';
    }
}
function createBoard() {
    var board = [];
    for (var i = 0; i < ROWS; i++) {
        var row = [];
        for (var j = 0; j < COLS; j++)
            row.push(0);
        board.push(row);
    }
    return board;
}
function dropPiece(board, row, col, piece) {
    board[row][col] = piece;
}
function isValidLocation(board, col) {
    return board[0][col] === 0;
}
function getNextOpenRow(board, col) {
    for (var r = ROWS - 1; r >= 0; r--) {
        if (board[r][col] === 0) {
            return r;
        }
    }
    return -1;
}
function winningMove(board, piece) {
    // Verificar movimientos horizontales de 4 para ganar
    for (var c = 0; c < COLS - 3; c++) {
        for (var r = 0; r < ROWS; r++) {
            if (board[r][c] === piece && board[r][c + 1] === piece && board[r][c + 2] === piece && board[r][c + 3] === piece) {
                return true;
            }
        }
    }
    // Verificar movimientos verticales de 4 para ganar
    for (var c = 0; c < COLS; c++) {
        for (var r = 0; r < ROWS - 3; r++) {
            if (board[r][c] === piece && board[r + 1][c] === piece && board[r + 2][c] === piece && board[r + 3][c] === piece) {
                return true;
            }
        }
    }
    // Verificar diagonales positivamente inclinadas para ganar
    for (var c = 0; c < COLS - 3; c++) {
        for (var r = 3; r < ROWS; r++) {
            if (board[r][c] === piece && board[r - 1][c + 1] === piece && board[r - 2][c + 2] === piece && board[r - 3][c + 3] === piece) {
                return true;
            }
        }
    }
    // Verificar diagonales negativamente inclinadas para ganar
    for (var c = 3; c < COLS; c++) {
        for (var r = 3; r < ROWS; r++) {
            if (board[r][c] === piece && board[r - 1][c - 1] === piece && board[r - 2][c - 2] === piece && board[r - 3][c - 3] === piece) {
                return true;
            }
        }
    }
    return false;
}
function drawBoard() {
    var boardElement = document.getElementById('board');
    if (!boardElement) {
        console.error("No se encontró el elemento del tablero");
        return;
    }
    boardElement.innerHTML = '';
    var _loop_1 = function (c) {
        var column = document.createElement('div');
        column.className = 'column';
        column.onclick = function () { if (turn === PLAYER_TURN)
            dropPieceInit(c); };
        for (var r = ROWS - 1; r >= 0; r--) {
            var cell = document.createElement('div');
            cell.className = "cell";
            if (board[r][c] === 1)
                cell.classList.add('red');
            else if (board[r][c] === 2)
                cell.classList.add('yellow');
            else
                cell.classList.add('white');
            column.appendChild(cell);
        }
        boardElement.appendChild(column);
    };
    for (var c = 0; c < COLS; c++) {
        _loop_1(c);
    }
}
function drawBoardWon() {
    var boardElement = document.getElementById('board');
    if (!boardElement) {
        console.error("No se encontró el elemento del tablero");
        return;
    }
    // Limpiar el tablero antes de redibujarlo
    boardElement.innerHTML = '';
    for (var c = 0; c < COLS; c++) {
        var column = document.createElement('div');
        column.className = 'column';
        for (var r = ROWS - 1; r >= 0; r--) {
            var cell = document.createElement('div');
            cell.className = "cell";
            if (board[r][c] === 1)
                cell.classList.add('red');
            else if (board[r][c] === 2)
                cell.classList.add('yellow');
            else
                cell.classList.add('white');
            column.appendChild(cell);
        }
        boardElement.appendChild(column);
    }
}
function evaluateWindow(window, piece, opponentPiece) {
    var score = 0;
    // Basado en cuántas piezas amigables hay en la ventana, aumentamos el puntaje
    if (window.filter(function (cell) { return cell === piece; }).length === 4) {
        score += 100;
    }
    else if (window.filter(function (cell) { return cell === piece; }).length === 3 && window.filter(function (cell) { return cell === 0; }).length === 1) {
        score += 5;
    }
    else if (window.filter(function (cell) { return cell === piece; }).length === 2 && window.filter(function (cell) { return cell === 0; }).length === 2) {
        score += 2;
    }
    // O disminuimos el puntaje si el oponente tiene 3 en línea
    if (window.filter(function (cell) { return cell === opponentPiece; }).length === 3 && window.filter(function (cell) { return cell === 0; }).length === 1) {
        score -= 4;
    }
    return score;
}
function scorePosition(board, piece) {
    var score = 0;
    var opponentPiece = piece === PLAYER_PIECE ? AI_PIECE : PLAYER_PIECE;
    // Puntuar la columna central --> estamos priorizando la columna central porque proporciona más ventanas potenciales de victoria
    var centerColumn = board.map(function (row) { return row[Math.floor(COLS / 2)]; });
    var centerCount = centerColumn.filter(function (cell) { return cell === piece; }).length;
    score += centerCount * 6;
    // Puntuar horizontalmente
    for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS - 3; c++) {
            var window_1 = board[r].slice(c, c + 4);
            score += evaluateWindow(window_1, piece, opponentPiece);
        }
    }
    // Puntuar verticalmente
    for (var c = 0; c < COLS; c++) {
        for (var r = 0; r < ROWS - 3; r++) {
            var window_2 = [board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]];
            score += evaluateWindow(window_2, piece, opponentPiece);
        }
    }
    // Puntuar diagonales inclinadas positivamente
    for (var r = 3; r < ROWS; r++) {
        for (var c = 0; c < COLS - 3; c++) {
            var window_3 = [board[r][c], board[r - 1][c + 1], board[r - 2][c + 2], board[r - 3][c + 3]];
            score += evaluateWindow(window_3, piece, opponentPiece);
        }
    }
    // Puntuar diagonales inclinadas negativamente
    for (var r = 3; r < ROWS; r++) {
        for (var c = 3; c < COLS; c++) {
            var window_4 = [board[r][c], board[r - 1][c - 1], board[r - 2][c - 2], board[r - 3][c - 3]];
            score += evaluateWindow(window_4, piece, opponentPiece);
        }
    }
    return score;
}
function getValidLocations(board) {
    var validLocations = [];
    for (var column = 0; column < COLS; column++) {
        if (isValidLocation(board, column)) {
            validLocations.push(column);
        }
    }
    return validLocations;
}
function isTerminalNode(board) {
    return winningMove(board, PLAYER_PIECE) || winningMove(board, AI_PIECE) || getValidLocations(board).length === 0;
}
function minimax(board, depth, alpha, beta, maximizingPlayer) {
    console.log("depth: ", depth);
    var validLocations = getValidLocations(board);
    var isTerminal = isTerminalNode(board);
    if (depth === 0 || isTerminal) {
        if (isTerminal) {
            if (winningMove(board, AI_PIECE))
                return [null, 10000000];
            else if (winningMove(board, PLAYER_PIECE))
                return [null, -10000000];
            else
                return [null, 0];
        }
        else
            return [null, scorePosition(board, AI_PIECE)];
    }
    if (maximizingPlayer) {
        var value = -Infinity;
        var column = validLocations[Math.floor(Math.random() * validLocations.length)];
        for (var _i = 0, validLocations_1 = validLocations; _i < validLocations_1.length; _i++) {
            var col = validLocations_1[_i];
            var row = getNextOpenRow(board, col);
            var bCopy = board.map(function (row) { return row.slice(); });
            dropPiece(bCopy, row, col, AI_PIECE);
            var newScore = minimax(bCopy, depth - 1, alpha, beta, false)[1];
            if (newScore > value) {
                value = newScore;
                column = col;
            }
            alpha = Math.max(value, alpha);
            if (alpha >= beta) {
                break;
            }
        }
        return [column, value];
    }
    else {
        var value = Infinity;
        var column = validLocations[Math.floor(Math.random() * validLocations.length)];
        for (var _a = 0, validLocations_2 = validLocations; _a < validLocations_2.length; _a++) {
            var col = validLocations_2[_a];
            var row = getNextOpenRow(board, col);
            var bCopy = board.map(function (row) { return row.slice(); });
            dropPiece(bCopy, row, col, PLAYER_PIECE);
            var newScore = minimax(bCopy, depth - 1, alpha, beta, true)[1];
            if (newScore < value) {
                value = newScore;
                column = col;
            }
            beta = Math.min(value, beta);
            if (alpha >= beta) {
                break;
            }
        }
        return [column, value];
    }
}
function calculateDropDuration(row) {
    var maxRow = ROWS - 1;
    var durationPerRow = 0.1; // Duración de la caída por fila
    return (maxRow - (maxRow - row)) * durationPerRow;
}
function mostrarGanador(winner) {
    var turnoMain = document.getElementById('turno-main');
    if (turnoMain) {
        var turnoHtml = "\n            <h2 style=\"color: #F2F3F4;\">Ganador ".concat(winner === AI_TURN ? 'Maquina' : 'Humano', "</h2>\n            <div style=\"color: #F2F3F4;\"></div>\n        ");
        // Actualiza el contenido del contenedor
        turnoMain.innerHTML = turnoHtml;
        turnoMain.style.display = 'block';
    }
}
function dropPieceInit(col) {
    console.log("Player's turn");
    if (!isValidLocation(board, col))
        return;
    var row = getNextOpenRow(board, col);
    if (row === -1)
        return;
    dropPiece(board, row, col, PLAYER_PIECE);
    drawBoard();
    // Encuentra la celda específica donde la ficha fue colocada.
    var columns = document.getElementsByClassName('column');
    var columnDOM = columns[col];
    var cellDOM = columnDOM.children[ROWS - 1 - row]; // Ajusta según la inversión del flex-direction.
    // Asegúrate de que la celda obtenida es la correcta.
    if (!(cellDOM instanceof HTMLElement)) {
        console.error('No se pudo obtener la celda DOM correcta.');
        return;
    }
    // Aplica la animación solo a la celda recién colocada.
    var animationDuration = calculateDropDuration(row);
    cellDOM.classList.add('falling');
    cellDOM.style.animation = "dropAnimation ".concat(animationDuration, "s ease-out forwards");
    cellDOM.addEventListener('animationend', function () {
        cellDOM.classList.remove('falling');
        cellDOM.style.animation = '';
    });
    if (winningMove(board, PLAYER_PIECE)) {
        mostrarGanador(turn);
        drawBoardWon();
        return;
    }
    turn = turn === 0 ? 1 : 0;
    //drawBoard();
    //dropPieceAI();
    mostrarTurno();
    setTimeout(function () {
        if (turn === AI_TURN) {
            dropPieceAI();
        }
    }, animationDuration * 2100);
}
function dropPieceAI() {
    console.log("AI's turn");
    var _a = minimax(board, depth, -Infinity, Infinity, true), col = _a[0], _ = _a[1];
    if (col === null || !isValidLocation(board, col))
        return;
    var row = getNextOpenRow(board, col);
    dropPiece(board, row, col, AI_PIECE);
    drawBoard();
    // Encuentra la celda específica donde la ficha fue colocada.
    var columns = document.getElementsByClassName('column');
    var columnDOM = columns[col];
    var cellDOM = columnDOM.children[ROWS - 1 - row]; // Ajusta según la inversión del flex-direction.
    // Asegúrate de que la celda obtenida es la correcta.
    if (!(cellDOM instanceof HTMLElement)) {
        console.error('No se pudo obtener la celda DOM correcta.');
        return;
    }
    // Aplica la animación solo a la celda recién colocada.
    var animationDuration = calculateDropDuration(row) * 2;
    cellDOM.classList.add('falling');
    cellDOM.style.animation = "dropAnimation ".concat(animationDuration, "s ease-out forwards");
    cellDOM.addEventListener('animationend', function () {
        // Limpia la animación después de que termine.
        cellDOM.classList.remove('falling');
        cellDOM.style.animation = '';
    });
    if (winningMove(board, AI_PIECE)) {
        mostrarGanador(turn);
        drawBoardWon();
        return;
    }
    turn = turn === 0 ? 1 : 0;
    mostrarTurno();
}
