// Row and column count
const ROWS: number = 6;
const COLS: number = 7;

// Turns
const PLAYER_TURN: number = 0;
const AI_TURN: number = 1;

// Pieces represented as numbers
const PLAYER_PIECE: number = 1;
const AI_PIECE: number = 2;

//depth
let depth: number;

let game_over: boolean = false;
let not_over: boolean = true;
let turn: number = Math.floor(Math.random() * 2);

const board = createBoard();

document.addEventListener('DOMContentLoaded', function(){
    const btn = document.getElementById("start");
	const value = document.querySelectorAll<HTMLInputElement>('input[name="dificultad"]');
	btn?.addEventListener("click",function(){
		value.forEach(num => {
			if(num.checked){
				depth = parseInt(num.value, 10);
			}
		})
		console.log("La profundidad es: ",depth);
		drawBoard();
		if(turn === AI_TURN){
			dropPieceAI();
		}else{
			console.log("Player's turn");
		}
	});
});

function createBoard(): number[][] {
    const board: number[][] = [];
    for (let i = 0; i < ROWS; i++) {
        const row: number[] = [];

        for (let j = 0; j < COLS; j++) row.push(0);
        
        board.push(row);
    }
    return board;
}

function dropPiece(board: number[][], row: number, col: number, piece: number): void {
    board[row][col] = piece;
}

function isValidLocation(board: number[][], col: number): boolean {
    return board[0][col] === 0;
}

function getNextOpenRow(board: number[][], col: number): number {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r][col] === 0) {
            return r;
        }
    }
    return -1;
}

function winningMove(board: number[][], piece: number): boolean {
    // Verificar movimientos horizontales de 4 para ganar
    for (let c = 0; c < COLS - 3; c++) {
        for (let r = 0; r < ROWS; r++) {
            if (board[r][c] === piece && board[r][c+1] === piece && board[r][c+2] === piece && board[r][c+3] === piece) {
                return true;
            }
        }
    }

    // Verificar movimientos verticales de 4 para ganar
    for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS - 3; r++) {
            if (board[r][c] === piece && board[r+1][c] === piece && board[r+2][c] === piece && board[r+3][c] === piece) {
                return true;
            }
        }
    }

    // Verificar diagonales positivamente inclinadas para ganar
    for (let c = 0; c < COLS - 3; c++) {
        for (let r = 3; r < ROWS; r++) {
            if (board[r][c] === piece && board[r-1][c+1] === piece && board[r-2][c+2] === piece && board[r-3][c+3] === piece) {
                return true;
            }
        }
    }

    // Verificar diagonales negativamente inclinadas para ganar
    for (let c = 3; c < COLS; c++) {
        for (let r = 3; r < ROWS; r++) {
            if (board[r][c] === piece && board[r-1][c-1] === piece && board[r-2][c-2] === piece && board[r-3][c-3] === piece) {
                return true;
            }
        }
    }

    return false;
}

function drawBoard(): void {
    const boardElement = document.getElementById('board');
    if (!boardElement) {
        console.error("No se encontró el elemento del tablero");
        return;
    }

    // Limpiar el tablero antes de redibujarlo
    boardElement.innerHTML = '';

    for (let c = 0; c < COLS; c++) {
        const column = document.createElement('div');
        column.className = 'column';
        column.onclick = () => { if (turn === PLAYER_TURN) dropPieceInit(c); }

        for (let r = ROWS - 1; r >= 0; r--) {
            const cell = document.createElement('div');
            cell.className = `cell`;
            
            if (board[r][c] === 1) cell.classList.add('red');
            else if (board[r][c] === 2) cell.classList.add('yellow');
            else cell.classList.add('white');
            
            column.appendChild(cell);
        }

        boardElement.appendChild(column);
    }
}

function drawBoardWon(): void {
    const boardElement = document.getElementById('board');
    if (!boardElement) {
        console.error("No se encontró el elemento del tablero");
        return;
    }

    // Limpiar el tablero antes de redibujarlo
    boardElement.innerHTML = '';

    for (let c = 0; c < COLS; c++) {
        const column = document.createElement('div');
        column.className = 'column';

        for (let r = ROWS - 1; r >= 0; r--) {
            const cell = document.createElement('div');
            cell.className = `cell`;
            
            if (board[r][c] === 1) cell.classList.add('red');
            else if (board[r][c] === 2) cell.classList.add('yellow');
            else cell.classList.add('white');
            
            column.appendChild(cell);
        }

        boardElement.appendChild(column);
    }
}

function evaluateWindow(window: number[], piece: number, opponentPiece: number): number {
    let score: number = 0;

    // Basado en cuántas piezas amigables hay en la ventana, aumentamos el puntaje
    if (window.filter(cell => cell === piece).length === 4) {
        score += 100;
    } else if (window.filter(cell => cell === piece).length === 3 && window.filter(cell => cell === 0).length === 1) {
        score += 5;
    } else if (window.filter(cell => cell === piece).length === 2 && window.filter(cell => cell === 0).length === 2) {
        score += 2;
    }

    // O disminuimos el puntaje si el oponente tiene 3 en línea
    if (window.filter(cell => cell === opponentPiece).length === 3 && window.filter(cell => cell === 0).length === 1) {
        score -= 4;
    }

    return score;
}

function scorePosition(board: number[][], piece: number): number {
    let score: number = 0;
    const opponentPiece: number = piece === PLAYER_PIECE ? AI_PIECE : PLAYER_PIECE;

    // Puntuar la columna central --> estamos priorizando la columna central porque proporciona más ventanas potenciales de victoria
    const centerColumn: number[] = board.map(row => row[Math.floor(COLS / 2)]);
    const centerCount: number = centerColumn.filter(cell => cell === piece).length;
    score += centerCount * 6;

    // Puntuar horizontalmente
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS - 3; c++) {
            const window: number[] = board[r].slice(c, c + 4);
            score += evaluateWindow(window, piece, opponentPiece);
        }
    }

    // Puntuar verticalmente
    for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS - 3; r++) {
            const window: number[] = [board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]];
            score += evaluateWindow(window, piece, opponentPiece);
        }
    }

    // Puntuar diagonales inclinadas positivamente
    for (let r = 3; r < ROWS; r++) {
        for (let c = 0; c < COLS - 3; c++) {
            const window: number[] = [board[r][c], board[r - 1][c + 1], board[r - 2][c + 2], board[r - 3][c + 3]];
            score += evaluateWindow(window, piece, opponentPiece);
        }
    }

    // Puntuar diagonales inclinadas negativamente
    for (let r = 3; r < ROWS; r++) {
        for (let c = 3; c < COLS; c++) {
            const window: number[] = [board[r][c], board[r - 1][c - 1], board[r - 2][c - 2], board[r - 3][c - 3]];
            score += evaluateWindow(window, piece, opponentPiece);
        }
    }

    return score;
}

function getValidLocations(board: number[][]): number[] {
    const validLocations: number[] = [];

    for (let column = 0; column < COLS; column++) {
        if (isValidLocation(board, column)) {
            validLocations.push(column);
        }
    }

    return validLocations;
}


function isTerminalNode(board: number[][]): boolean {
    return winningMove(board, PLAYER_PIECE) || winningMove(board, AI_PIECE) || getValidLocations(board).length === 0;
}


function minimax(board: number[][], depth: number, alpha: number, beta: number, maximizingPlayer: boolean): [number | null, number] {
    console.log("depth: ", depth);
    const validLocations: number[] = getValidLocations(board);
    const isTerminal: boolean = isTerminalNode(board);

    if (depth === 0 || isTerminal) {
        if (isTerminal) {
            if (winningMove(board, AI_PIECE)) return [null, 10000000];
            else if (winningMove(board, PLAYER_PIECE)) return [null, -10000000];
            else  return [null, 0];
        }else return [null, scorePosition(board, AI_PIECE)];   
    }

    if (maximizingPlayer) {
        let value: number = -Infinity;
        let column: number | null = validLocations[Math.floor(Math.random() * validLocations.length)];

        for (const col of validLocations) {
            const row: number = getNextOpenRow(board, col);
            const bCopy: number[][] = board.map(row => row.slice());
            dropPiece(bCopy, row, col, AI_PIECE);
            const newScore: number = minimax(bCopy, depth - 1, alpha, beta, false)[1];

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
    } else {
        let value: number = Infinity;
        let column: number | null = validLocations[Math.floor(Math.random() * validLocations.length)];

        for (const col of validLocations) {
            const row: number = getNextOpenRow(board, col);
            const bCopy: number[][] = board.map(row => row.slice());
            dropPiece(bCopy, row, col, PLAYER_PIECE);
            const newScore: number = minimax(bCopy, depth - 1, alpha, beta, true)[1];

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

function calculateDropDuration(row: number): number {
    const maxRow = ROWS - 1;
    const durationPerRow = 0.1; // Duración de la caída por fila
    return (maxRow - row) * durationPerRow;
}

function dropPieceInit(col: number): void {
    console.log("Player's turn");
    if (!isValidLocation(board, col)) return;

    const row: number = getNextOpenRow(board, col);
    if (row === -1) return;
	
    dropPiece(board, row, col, PLAYER_PIECE);
	
	drawBoard();

    // Encuentra la celda específica donde la ficha fue colocada.
    const columns = document.getElementsByClassName('column');
    const columnDOM = columns[col] as HTMLElement;
    const cellDOM = columnDOM.children[ROWS - 1 - row] as HTMLElement; // Ajusta según la inversión del flex-direction.

    // Asegúrate de que la celda obtenida es la correcta.
    if (!(cellDOM instanceof HTMLElement)) {
        console.error('No se pudo obtener la celda DOM correcta.');
        return;
    }

    // Aplica la animación solo a la celda recién colocada.
    const animationDuration = calculateDropDuration(row);
    cellDOM.classList.add('falling');
    cellDOM.style.animation = `dropAnimation ${animationDuration}s ease-out forwards`;

    cellDOM.addEventListener('animationend', () => {
        // Limpia la animación después de que termine.
        cellDOM.classList.remove('falling');
        cellDOM.style.animation = '';
    });


    if(winningMove(board, PLAYER_PIECE)){
        alert(`¡El jugador ${turn === 0 ? 'Rojo' : 'Amarillo'} ha ganado!`);
        drawBoardWon();
        return;
    }

    turn = turn === 0 ? 1 : 0;
    //drawBoard();
    
    //dropPieceAI();
	setTimeout(() => {
        if (turn === AI_TURN) {
            dropPieceAI();
        }
    }, animationDuration * 2100);
}

function dropPieceAI(): void{
    console.log("AI's turn");
    const [col,_]   = minimax(board, depth, -Infinity, Infinity, true);
    if (col === null || !isValidLocation(board, col)) return;

    const row: number = getNextOpenRow(board, col);
    dropPiece(board, row, col, AI_PIECE);
	
	drawBoard();

    // Encuentra la celda específica donde la ficha fue colocada.
    const columns = document.getElementsByClassName('column');
    const columnDOM = columns[col] as HTMLElement;
    const cellDOM = columnDOM.children[ROWS - 1 - row] as HTMLElement; // Ajusta según la inversión del flex-direction.

    // Asegúrate de que la celda obtenida es la correcta.
    if (!(cellDOM instanceof HTMLElement)) {
        console.error('No se pudo obtener la celda DOM correcta.');
        return;
    }

    // Aplica la animación solo a la celda recién colocada.
    const animationDuration = calculateDropDuration(row);
    cellDOM.classList.add('falling');
    cellDOM.style.animation = `dropAnimation ${animationDuration}s ease-out forwards`;

    cellDOM.addEventListener('animationend', () => {
        // Limpia la animación después de que termine.
        cellDOM.classList.remove('falling');
        cellDOM.style.animation = '';
    });


    if(winningMove(board, AI_PIECE)){
        alert(`¡El jugador ${turn === 0 ? 'Rojo' : 'Amarillo'} ha ganado!`);
        drawBoardWon();
        return;
    }
        
    turn = turn === 0 ? 1 : 0;
    //drawBoard();
}
