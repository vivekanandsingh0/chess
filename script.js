// ===== GAME STATE =====
const gameState = {
    board: [],
    currentTurn: 'white',
    selectedSquare: null,
    legalMoves: [],
    moveHistory: [],
    capturedPieces: { white: [], black: [] },
    gameOver: false,
    check: false,
    checkmate: false,
    stalemate: false,
    enPassantTarget: null,
    castlingRights: {
        white: { kingSide: true, queenSide: true },
        black: { kingSide: true, queenSide: true }
    },
    kingMoved: { white: false, black: false },
    rookMoved: {
        white: { kingSide: false, queenSide: false },
        black: { kingSide: false, queenSide: false }
    },
    soundEnabled: true,
    darkMode: false
};

// ===== PIECE DEFINITIONS =====
const pieces = {
    white: {
        pawn: 'assets/white_pawn.svg',
        rook: 'assets/white_rook.svg',
        knight: 'assets/white_knight.svg',
        bishop: 'assets/white_bishop.svg',
        queen: 'assets/white_queen.svg',
        king: 'assets/white_king.svg'
    },
    black: {
        pawn: 'assets/black_pawn.svg',
        rook: 'assets/black_rook.svg',
        knight: 'assets/black_knight.svg',
        bishop: 'assets/black_bishop.svg',
        queen: 'assets/black_queen.svg',
        king: 'assets/black_king.svg'
    }
};

// ===== INITIALIZATION =====
function initGame() {
    createBoard();
    placePieces();
    drawBoard();
    setupEventListeners();
    updateUI();
}

function createBoard() {
    gameState.board = Array(8).fill(null).map(() => Array(8).fill(null));
}

function placePieces() {
    // Black pieces (top of board)
    const backRow = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    
    for (let col = 0; col < 8; col++) {
        gameState.board[0][col] = { type: backRow[col], color: 'black' };
        gameState.board[1][col] = { type: 'pawn', color: 'black' };
    }
    
    // White pieces (bottom of board)
    for (let col = 0; col < 8; col++) {
        gameState.board[6][col] = { type: 'pawn', color: 'white' };
        gameState.board[7][col] = { type: backRow[col], color: 'white' };
    }
}

function drawBoard() {
    const chessboard = document.getElementById('chessboard');
    chessboard.innerHTML = '';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
            square.dataset.row = row;
            square.dataset.col = col;
            
            const piece = gameState.board[row][col];
            if (piece) {
                const img = document.createElement('img');
                img.src = pieces[piece.color][piece.type];
                img.className = 'piece';
                img.draggable = true;
                img.dataset.row = row;
                img.dataset.col = col;
                square.appendChild(img);
            }
            
            chessboard.appendChild(square);
        }
    }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    const chessboard = document.getElementById('chessboard');
    
    // Click events
    chessboard.addEventListener('click', handleSquareClick);
    
    // Drag and drop events
    chessboard.addEventListener('dragstart', handleDragStart);
    chessboard.addEventListener('dragover', handleDragOver);
    chessboard.addEventListener('drop', handleDrop);
    chessboard.addEventListener('dragend', handleDragEnd);
    
    // Button events
    document.getElementById('newGameBtn').addEventListener('click', resetGame);
    document.getElementById('undoBtn').addEventListener('click', undoMove);
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
    document.getElementById('soundToggle').addEventListener('click', toggleSound);
}

function handleSquareClick(e) {
    if (gameState.gameOver) return;
    
    const square = e.target.closest('.square');
    if (!square) return;
    
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    
    // If a piece is selected and this is a legal move
    if (gameState.selectedSquare) {
        const isLegalMove = gameState.legalMoves.some(
            move => move.row === row && move.col === col
        );
        
        if (isLegalMove) {
            makeMove(gameState.selectedSquare, { row, col });
            clearSelection();
        } else if (gameState.board[row][col]?.color === gameState.currentTurn) {
            // Select different piece
            selectSquare(row, col);
        } else {
            clearSelection();
        }
    } else {
        // Select a piece
        const piece = gameState.board[row][col];
        if (piece && piece.color === gameState.currentTurn) {
            selectSquare(row, col);
        }
    }
}

let draggedPiece = null;

function handleDragStart(e) {
    if (gameState.gameOver) {
        e.preventDefault();
        return;
    }
    
    const piece = e.target;
    const row = parseInt(piece.dataset.row);
    const col = parseInt(piece.dataset.col);
    
    if (gameState.board[row][col]?.color !== gameState.currentTurn) {
        e.preventDefault();
        return;
    }
    
    draggedPiece = { row, col };
    piece.classList.add('dragging');
    selectSquare(row, col);
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    
    if (!draggedPiece) return;
    
    const square = e.target.closest('.square');
    if (!square) return;
    
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    
    const isLegalMove = gameState.legalMoves.some(
        move => move.row === row && move.col === col
    );
    
    if (isLegalMove) {
        makeMove(draggedPiece, { row, col });
    }
    
    clearSelection();
    draggedPiece = null;
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function selectSquare(row, col) {
    gameState.selectedSquare = { row, col };
    gameState.legalMoves = generateLegalMoves(row, col);
    highlightMoves();
}

function clearSelection() {
    gameState.selectedSquare = null;
    gameState.legalMoves = [];
    highlightMoves();
}

function highlightMoves() {
    // Clear all highlights
    document.querySelectorAll('.square').forEach(sq => {
        sq.classList.remove('selected', 'legal-move', 'capture-move', 'in-check');
    });
    
    // Highlight selected square
    if (gameState.selectedSquare) {
        const { row, col } = gameState.selectedSquare;
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"].square`);
        if (square) square.classList.add('selected');
    }
    
    // Highlight legal moves
    gameState.legalMoves.forEach(move => {
        const square = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"].square`);
        if (square) {
            if (gameState.board[move.row][move.col]) {
                square.classList.add('capture-move');
            } else {
                square.classList.add('legal-move');
            }
        }
    });
    
    // Highlight king in check
    if (gameState.check) {
        const kingPos = findKing(gameState.currentTurn);
        if (kingPos) {
            const square = document.querySelector(`[data-row="${kingPos.row}"][data-col="${kingPos.col}"].square`);
            if (square) square.classList.add('in-check');
        }
    }
}

// ===== MOVE GENERATION =====
function generateLegalMoves(row, col) {
    const piece = gameState.board[row][col];
    if (!piece) return [];
    
    let moves = [];
    
    switch (piece.type) {
        case 'pawn':
            moves = getPawnMoves(row, col, piece.color);
            break;
        case 'rook':
            moves = getRookMoves(row, col, piece.color);
            break;
        case 'knight':
            moves = getKnightMoves(row, col, piece.color);
            break;
        case 'bishop':
            moves = getBishopMoves(row, col, piece.color);
            break;
        case 'queen':
            moves = getQueenMoves(row, col, piece.color);
            break;
        case 'king':
            moves = getKingMoves(row, col, piece.color);
            break;
    }
    
    // Filter out moves that would leave king in check
    return moves.filter(move => !wouldBeInCheck(
        { row, col },
        move,
        piece.color
    ));
}

function getPawnMoves(row, col, color) {
    const moves = [];
    const direction = color === 'white' ? -1 : 1;
    const startRow = color === 'white' ? 6 : 1;
    
    // Forward move
    const newRow = row + direction;
    if (newRow >= 0 && newRow < 8 && !gameState.board[newRow][col]) {
        moves.push({ row: newRow, col });
        
        // Double move from start
        if (row === startRow) {
            const doubleRow = row + 2 * direction;
            if (!gameState.board[doubleRow][col]) {
                moves.push({ row: doubleRow, col, enPassant: true });
            }
        }
    }
    
    // Captures
    [-1, 1].forEach(offset => {
        const newCol = col + offset;
        if (newCol >= 0 && newCol < 8 && newRow >= 0 && newRow < 8) {
            const target = gameState.board[newRow][newCol];
            if (target && target.color !== color) {
                moves.push({ row: newRow, col: newCol });
            }
            
            // En passant
            if (gameState.enPassantTarget &&
                gameState.enPassantTarget.row === newRow &&
                gameState.enPassantTarget.col === newCol) {
                moves.push({ row: newRow, col: newCol, isEnPassant: true });
            }
        }
    });
    
    return moves;
}

function getRookMoves(row, col, color) {
    const moves = [];
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    
    directions.forEach(([dRow, dCol]) => {
        let newRow = row + dRow;
        let newCol = col + dCol;
        
        while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const target = gameState.board[newRow][newCol];
            
            if (!target) {
                moves.push({ row: newRow, col: newCol });
            } else {
                if (target.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
                break;
            }
            
            newRow += dRow;
            newCol += dCol;
        }
    });
    
    return moves;
}

function getKnightMoves(row, col, color) {
    const moves = [];
    const offsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    
    offsets.forEach(([dRow, dCol]) => {
        const newRow = row + dRow;
        const newCol = col + dCol;
        
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const target = gameState.board[newRow][newCol];
            if (!target || target.color !== color) {
                moves.push({ row: newRow, col: newCol });
            }
        }
    });
    
    return moves;
}

function getBishopMoves(row, col, color) {
    const moves = [];
    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    
    directions.forEach(([dRow, dCol]) => {
        let newRow = row + dRow;
        let newCol = col + dCol;
        
        while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const target = gameState.board[newRow][newCol];
            
            if (!target) {
                moves.push({ row: newRow, col: newCol });
            } else {
                if (target.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
                break;
            }
            
            newRow += dRow;
            newCol += dCol;
        }
    });
    
    return moves;
}

function getQueenMoves(row, col, color) {
    return [...getRookMoves(row, col, color), ...getBishopMoves(row, col, color)];
}

function getKingMoves(row, col, color) {
    const moves = [];
    const offsets = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];
    
    offsets.forEach(([dRow, dCol]) => {
        const newRow = row + dRow;
        const newCol = col + dCol;
        
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const target = gameState.board[newRow][newCol];
            if (!target || target.color !== color) {
                moves.push({ row: newRow, col: newCol });
            }
        }
    });
    
    // Castling
    if (!gameState.kingMoved[color] && !isCheck(color)) {
        // King side
        if (gameState.castlingRights[color].kingSide &&
            !gameState.rookMoved[color].kingSide) {
            const rookCol = 7;
            if (!gameState.board[row][5] && !gameState.board[row][6]) {
                // Check if squares are not under attack
                if (!isSquareUnderAttack(row, 5, color) &&
                    !isSquareUnderAttack(row, 6, color)) {
                    moves.push({ row, col: 6, isCastling: true, rookCol });
                }
            }
        }
        
        // Queen side
        if (gameState.castlingRights[color].queenSide &&
            !gameState.rookMoved[color].queenSide) {
            const rookCol = 0;
            if (!gameState.board[row][1] && !gameState.board[row][2] && !gameState.board[row][3]) {
                if (!isSquareUnderAttack(row, 2, color) &&
                    !isSquareUnderAttack(row, 3, color)) {
                    moves.push({ row, col: 2, isCastling: true, rookCol });
                }
            }
        }
    }
    
    return moves;
}

// ===== MOVE EXECUTION =====
function makeMove(from, to) {
    const piece = gameState.board[from.row][from.col];
    const capturedPiece = gameState.board[to.row][to.col];
    
    // Save state for undo
    const moveData = {
        from: { ...from },
        to: { ...to },
        piece: { ...piece },
        capturedPiece: capturedPiece ? { ...capturedPiece } : null,
        enPassantTarget: gameState.enPassantTarget,
        castlingRights: JSON.parse(JSON.stringify(gameState.castlingRights)),
        kingMoved: { ...gameState.kingMoved },
        rookMoved: JSON.parse(JSON.stringify(gameState.rookMoved))
    };
    
    // Handle en passant capture
    if (to.isEnPassant) {
        const captureRow = from.row;
        const capturedPawn = gameState.board[captureRow][to.col];
        moveData.enPassantCapture = { row: captureRow, col: to.col, piece: { ...capturedPawn } };
        gameState.board[captureRow][to.col] = null;
        gameState.capturedPieces[piece.color === 'white' ? 'black' : 'white'].push(capturedPawn);
    }
    
    // Handle castling
    if (to.isCastling) {
        const rookFromCol = to.rookCol;
        const rookToCol = to.col === 6 ? 5 : 3;
        const rook = gameState.board[from.row][rookFromCol];
        gameState.board[from.row][rookToCol] = rook;
        gameState.board[from.row][rookFromCol] = null;
        moveData.castling = { rookFromCol, rookToCol };
    }
    
    // Move piece
    gameState.board[to.row][to.col] = piece;
    gameState.board[from.row][from.col] = null;
    
    // Handle capture
    if (capturedPiece) {
        gameState.capturedPieces[piece.color === 'white' ? 'black' : 'white'].push(capturedPiece);
    }
    
    // Update en passant target
    gameState.enPassantTarget = null;
    if (piece.type === 'pawn' && Math.abs(to.row - from.row) === 2) {
        gameState.enPassantTarget = {
            row: (from.row + to.row) / 2,
            col: to.col
        };
    }
    
    // Update castling rights
    if (piece.type === 'king') {
        gameState.kingMoved[piece.color] = true;
        gameState.castlingRights[piece.color].kingSide = false;
        gameState.castlingRights[piece.color].queenSide = false;
    }
    
    if (piece.type === 'rook') {
        if (from.col === 0) {
            gameState.rookMoved[piece.color].queenSide = true;
            gameState.castlingRights[piece.color].queenSide = false;
        } else if (from.col === 7) {
            gameState.rookMoved[piece.color].kingSide = true;
            gameState.castlingRights[piece.color].kingSide = false;
        }
    }
    
    // Check for pawn promotion
    if (piece.type === 'pawn' && (to.row === 0 || to.row === 7)) {
        showPromotionModal(to.row, to.col, moveData);
        return;
    }
    
    // Add move to history
    gameState.moveHistory.push(moveData);
    
    // Switch turn
    switchTurn();
    
    // Update UI
    drawBoard();
    updateUI();
    
    // Play sound
    playSound('move');
}

function showPromotionModal(row, col, moveData) {
    const modal = document.getElementById('promotionModal');
    const choices = document.getElementById('promotionChoices');
    const color = gameState.board[row][col].color;
    
    choices.innerHTML = '';
    
    ['queen', 'rook', 'bishop', 'knight'].forEach(type => {
        const choice = document.createElement('div');
        choice.className = 'promotion-choice';
        
        const img = document.createElement('img');
        img.src = pieces[color][type];
        choice.appendChild(img);
        
        choice.addEventListener('click', () => {
            gameState.board[row][col].type = type;
            moveData.promotion = type;
            gameState.moveHistory.push(moveData);
            modal.classList.remove('active');
            switchTurn();
            drawBoard();
            updateUI();
            playSound('move');
        });
        
        choices.appendChild(choice);
    });
    
    modal.classList.add('active');
}

function undoMove() {
    if (gameState.moveHistory.length === 0) return;
    
    const moveData = gameState.moveHistory.pop();
    
    // Restore piece
    gameState.board[moveData.from.row][moveData.from.col] = moveData.piece;
    gameState.board[moveData.to.row][moveData.to.col] = moveData.capturedPiece;
    
    // Restore en passant capture
    if (moveData.enPassantCapture) {
        gameState.board[moveData.enPassantCapture.row][moveData.enPassantCapture.col] = 
            moveData.enPassantCapture.piece;
        const color = moveData.piece.color === 'white' ? 'black' : 'white';
        gameState.capturedPieces[color].pop();
    }
    
    // Restore castling
    if (moveData.castling) {
        const row = moveData.from.row;
        const rook = gameState.board[row][moveData.castling.rookToCol];
        gameState.board[row][moveData.castling.rookFromCol] = rook;
        gameState.board[row][moveData.castling.rookToCol] = null;
    }
    
    // Restore captured piece
    if (moveData.capturedPiece) {
        const color = moveData.piece.color === 'white' ? 'black' : 'white';
        gameState.capturedPieces[color].pop();
    }
    
    // Restore state
    gameState.enPassantTarget = moveData.enPassantTarget;
    gameState.castlingRights = moveData.castlingRights;
    gameState.kingMoved = moveData.kingMoved;
    gameState.rookMoved = moveData.rookMoved;
    
    // Switch turn back
    gameState.currentTurn = gameState.currentTurn === 'white' ? 'black' : 'white';
    gameState.gameOver = false;
    gameState.checkmate = false;
    gameState.stalemate = false;
    
    drawBoard();
    updateUI();
}

function switchTurn() {
    gameState.currentTurn = gameState.currentTurn === 'white' ? 'black' : 'white';
    
    // Check game state
    gameState.check = isCheck(gameState.currentTurn);
    
    if (hasNoLegalMoves(gameState.currentTurn)) {
        if (gameState.check) {
            gameState.checkmate = true;
            gameState.gameOver = true;
            playSound('checkmate');
        } else {
            gameState.stalemate = true;
            gameState.gameOver = true;
            playSound('stalemate');
        }
    } else if (gameState.check) {
        playSound('check');
    }
    
    // Check for insufficient material
    if (isInsufficientMaterial()) {
        gameState.stalemate = true;
        gameState.gameOver = true;
    }
}

// ===== CHECK DETECTION =====
function isCheck(color) {
    const kingPos = findKing(color);
    if (!kingPos) return false;
    
    return isSquareUnderAttack(kingPos.row, kingPos.col, color);
}

function isSquareUnderAttack(row, col, defendingColor) {
    const attackingColor = defendingColor === 'white' ? 'black' : 'white';
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = gameState.board[r][c];
            if (piece && piece.color === attackingColor) {
                const moves = generatePseudoLegalMoves(r, c);
                if (moves.some(move => move.row === row && move.col === col)) {
                    return true;
                }
            }
        }
    }
    
    return false;
}

function generatePseudoLegalMoves(row, col) {
    const piece = gameState.board[row][col];
    if (!piece) return [];
    
    switch (piece.type) {
        case 'pawn':
            return getPawnMoves(row, col, piece.color);
        case 'rook':
            return getRookMoves(row, col, piece.color);
        case 'knight':
            return getKnightMoves(row, col, piece.color);
        case 'bishop':
            return getBishopMoves(row, col, piece.color);
        case 'queen':
            return getQueenMoves(row, col, piece.color);
        case 'king':
            // For attack detection, don't include castling
            const moves = [];
            const offsets = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1], [0, 1],
                [1, -1], [1, 0], [1, 1]
            ];
            
            offsets.forEach(([dRow, dCol]) => {
                const newRow = row + dRow;
                const newCol = col + dCol;
                
                if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                    const target = gameState.board[newRow][newCol];
                    if (!target || target.color !== piece.color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                }
            });
            
            return moves;
    }
}

function wouldBeInCheck(from, to, color) {
    // Simulate move
    const originalPiece = gameState.board[to.row][to.col];
    const movingPiece = gameState.board[from.row][from.col];
    
    gameState.board[to.row][to.col] = movingPiece;
    gameState.board[from.row][from.col] = null;
    
    // Handle en passant
    let enPassantPiece = null;
    if (to.isEnPassant) {
        enPassantPiece = gameState.board[from.row][to.col];
        gameState.board[from.row][to.col] = null;
    }
    
    const inCheck = isCheck(color);
    
    // Restore board
    gameState.board[from.row][from.col] = movingPiece;
    gameState.board[to.row][to.col] = originalPiece;
    
    if (to.isEnPassant) {
        gameState.board[from.row][to.col] = enPassantPiece;
    }
    
    return inCheck;
}

function findKing(color) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = gameState.board[row][col];
            if (piece && piece.type === 'king' && piece.color === color) {
                return { row, col };
            }
        }
    }
    return null;
}

function hasNoLegalMoves(color) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = gameState.board[row][col];
            if (piece && piece.color === color) {
                const moves = generateLegalMoves(row, col);
                if (moves.length > 0) {
                    return false;
                }
            }
        }
    }
    return true;
}

function isInsufficientMaterial() {
    const pieces = [];
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = gameState.board[row][col];
            if (piece) {
                pieces.push(piece);
            }
        }
    }
    
    // King vs King
    if (pieces.length === 2) return true;
    
    // King + Bishop/Knight vs King
    if (pieces.length === 3) {
        return pieces.some(p => p.type === 'bishop' || p.type === 'knight');
    }
    
    return false;
}

// ===== UI UPDATES =====
function updateUI() {
    // Update turn indicator
    const turnIndicator = document.getElementById('turnIndicator');
    turnIndicator.textContent = `${gameState.currentTurn.charAt(0).toUpperCase() + 
        gameState.currentTurn.slice(1)} to Move`;
    
    // Update game status
    const gameStatus = document.getElementById('gameStatus');
    gameStatus.className = 'game-status';
    
    if (gameState.checkmate) {
        const winner = gameState.currentTurn === 'white' ? 'Black' : 'White';
        gameStatus.textContent = `Checkmate! ${winner} Wins!`;
        gameStatus.classList.add('checkmate');
    } else if (gameState.stalemate) {
        gameStatus.textContent = 'Stalemate! Game is a Draw!';
        gameStatus.classList.add('stalemate');
    } else if (gameState.check) {
        gameStatus.textContent = 'Check!';
        gameStatus.classList.add('check');
    } else {
        gameStatus.textContent = '';
    }
    
    // Update captured pieces
    updateCapturedPieces();
    
    // Update move history
    updateMoveHistory();
    
    // Update undo button
    document.getElementById('undoBtn').disabled = gameState.moveHistory.length === 0;
}

function updateCapturedPieces() {
    const whiteCaptured = document.getElementById('whiteCaptured');
    const blackCaptured = document.getElementById('blackCaptured');
    
    whiteCaptured.innerHTML = '';
    blackCaptured.innerHTML = '';
    
    gameState.capturedPieces.white.forEach(piece => {
        const img = document.createElement('img');
        img.src = pieces.white[piece.type];
        whiteCaptured.appendChild(img);
    });
    
    gameState.capturedPieces.black.forEach(piece => {
        const img = document.createElement('img');
        img.src = pieces.black[piece.type];
        blackCaptured.appendChild(img);
    });
}

function updateMoveHistory() {
    const moveList = document.getElementById('moveList');
    moveList.innerHTML = '';
    
    for (let i = 0; i < gameState.moveHistory.length; i += 2) {
        const moveItem = document.createElement('div');
        moveItem.className = 'move-item';
        
        const moveNumber = document.createElement('span');
        moveNumber.className = 'move-number';
        moveNumber.textContent = `${Math.floor(i / 2) + 1}.`;
        
        const whiteMove = document.createElement('span');
        whiteMove.className = 'move-white';
        whiteMove.textContent = formatMove(gameState.moveHistory[i]);
        
        const blackMove = document.createElement('span');
        blackMove.className = 'move-black';
        if (i + 1 < gameState.moveHistory.length) {
            blackMove.textContent = formatMove(gameState.moveHistory[i + 1]);
        }
        
        moveItem.appendChild(moveNumber);
        moveItem.appendChild(whiteMove);
        moveItem.appendChild(blackMove);
        
        moveList.appendChild(moveItem);
    }
    
    // Scroll to bottom
    moveList.scrollTop = moveList.scrollHeight;
}

function formatMove(moveData) {
    const files = 'abcdefgh';
    const piece = moveData.piece.type === 'pawn' ? '' : 
        moveData.piece.type.charAt(0).toUpperCase();
    const from = `${files[moveData.from.col]}${8 - moveData.from.row}`;
    const to = `${files[moveData.to.col]}${8 - moveData.to.row}`;
    const capture = moveData.capturedPiece || moveData.enPassantCapture ? 'x' : '-';
    
    if (moveData.castling) {
        return moveData.to.col === 6 ? 'O-O' : 'O-O-O';
    }
    
    let notation = `${piece}${capture}${to}`;
    
    if (moveData.promotion) {
        notation += `=${moveData.promotion.charAt(0).toUpperCase()}`;
    }
    
    return notation;
}

// ===== CONTROLS =====
function resetGame() {
    gameState.currentTurn = 'white';
    gameState.selectedSquare = null;
    gameState.legalMoves = [];
    gameState.moveHistory = [];
    gameState.capturedPieces = { white: [], black: [] };
    gameState.gameOver = false;
    gameState.check = false;
    gameState.checkmate = false;
    gameState.stalemate = false;
    gameState.enPassantTarget = null;
    gameState.castlingRights = {
        white: { kingSide: true, queenSide: true },
        black: { kingSide: true, queenSide: true }
    };
    gameState.kingMoved = { white: false, black: false };
    gameState.rookMoved = {
        white: { kingSide: false, queenSide: false },
        black: { kingSide: false, queenSide: false }
    };
    
    createBoard();
    placePieces();
    drawBoard();
    updateUI();
}

function toggleDarkMode() {
    gameState.darkMode = !gameState.darkMode;
    document.documentElement.setAttribute('data-theme', 
        gameState.darkMode ? 'dark' : 'light');
    
    const btn = document.getElementById('darkModeToggle');
    btn.textContent = gameState.darkMode ? '☀️' : '🌙';
}

function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    
    const btn = document.getElementById('soundToggle');
    btn.textContent = gameState.soundEnabled ? '🔊' : '🔇';
}

function playSound(type) {
    if (!gameState.soundEnabled) return;
    
    // Placeholder for sound effects
    // In a full implementation, you would play actual audio files here
    console.log(`Playing sound: ${type}`);
}

// ===== START GAME =====
document.addEventListener('DOMContentLoaded', initGame);
