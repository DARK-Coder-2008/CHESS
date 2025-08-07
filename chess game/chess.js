// Chess Game Logic
class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.gameMode = null; // 'ai' or 'multiplayer'
        this.isGameOver = false;
        this.boardFlipped = false;
        this.socket = null;
        this.roomCode = null;
        this.isMyTurn = true;
        
        // Remove duplicate call to initializeBoard()
        this.setupEventListeners();
    }

    initializeBoard() {
        const board = [];
        const initialPosition = {
            0: ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
            1: ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
            6: ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
            7: ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
        };

        for (let row = 0; row < 8; row++) {
            board[row] = [];
            for (let col = 0; col < 8; col++) {
                if (initialPosition[row]) {
                    board[row][col] = {
                        piece: initialPosition[row][col],
                        color: row < 2 ? 'black' : 'white'
                    };
                } else {
                    board[row][col] = null;
                }
            }
        }
        return board;
    }

    setupEventListeners() {
        // Game mode selection
        document.getElementById('aiMode').addEventListener('click', () => this.startAIGame());
        document.getElementById('multiplayerMode').addEventListener('click', () => this.startMultiplayerGame());

        // Game controls
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('backToMenuBtn').addEventListener('click', () => this.showMenu());
        document.getElementById('undoBtn').addEventListener('click', () => this.undoMove());
        document.getElementById('flipBoardBtn').addEventListener('click', () => this.flipBoard());

        // Multiplayer controls
        document.getElementById('copyRoomCode').addEventListener('click', () => this.copyRoomCode());
        document.getElementById('joinRoomBtn').addEventListener('click', () => this.joinRoom());
    }

    startAIGame() {
        this.gameMode = 'ai';
        this.showGame();
        this.renderBoard();
        this.updateGameStatus();
    }

    startMultiplayerGame() {
        this.gameMode = 'multiplayer';
        this.showMultiplayerRoom();
        this.initializeSocket();
    }

    initializeSocket() {
        // Connect to WebSocket server
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to server');
            // Create a room when multiplayer is selected
            this.socket.emit('createRoom');
        });
        
        this.socket.on('roomCreated', (data) => {
            this.roomCode = data.roomCode;
            document.getElementById('roomCode').value = this.roomCode;
            document.getElementById('roomStatus').textContent = 'Share this room code with your opponent';
        });
        
        this.socket.on('roomJoined', (data) => {
            this.roomCode = data.roomCode;
            this.isMyTurn = false; // Second player goes second
            this.showGame();
            this.renderBoard();
            document.getElementById('roomStatus').textContent = 'Joined room: ' + this.roomCode;
        });
        
        this.socket.on('roomError', (data) => {
            alert('Error: ' + data.message);
        });
        
        this.socket.on('playerJoined', (data) => {
            document.getElementById('roomStatus').textContent = 'Opponent joined! Game starting...';
            setTimeout(() => {
                this.showGame();
                this.renderBoard();
            }, 1000);
        });
        
        this.socket.on('gameStart', (data) => {
            this.board = data.gameState.board;
            this.currentPlayer = data.currentPlayer;
            this.renderBoard();
            this.updateGameStatus();
        });
        
        this.socket.on('moveMade', (data) => {
            // Update board with opponent's move
            this.board = data.gameState.board;
            this.currentPlayer = data.currentPlayer;
            this.isMyTurn = !this.isMyTurn;
            this.renderBoard();
            this.updateGameStatus();
        });
        
        this.socket.on('gameOver', (data) => {
            this.isGameOver = true;
            this.updateGameStatus('Game Over: ' + (data.winner || 'Draw'));
        });
    }

    generateRoomCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    copyRoomCode() {
        const roomCode = document.getElementById('roomCode').value;
        navigator.clipboard.writeText(roomCode).then(() => {
            const btn = document.getElementById('copyRoomCode');
            btn.textContent = 'Copied!';
            setTimeout(() => btn.textContent = 'Copy', 2000);
        });
    }

    joinRoom() {
        const roomCode = document.getElementById('joinRoomInput').value.trim();
        if (roomCode) {
            if (!this.socket) {
                // Initialize socket if not already connected
                this.socket = io();
            }
            this.socket.emit('joinRoom', roomCode);
        }
    }

    showGame() {
        document.getElementById('gameModeSelection').classList.add('hidden');
        document.getElementById('multiplayerRoom').classList.add('hidden');
        document.getElementById('gameContainer').classList.remove('hidden');
    }

    showMultiplayerRoom() {
        document.getElementById('gameModeSelection').classList.add('hidden');
        document.getElementById('multiplayerRoom').classList.remove('hidden');
    }

    showMenu() {
        document.getElementById('gameContainer').classList.add('hidden');
        document.getElementById('multiplayerRoom').classList.add('hidden');
        document.getElementById('gameModeSelection').classList.remove('hidden');
        this.resetGame();
    }

    renderBoard() {
        const chessboard = document.getElementById('chessboard');
        chessboard.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                const displayRow = this.boardFlipped ? 7 - row : row;
                const displayCol = this.boardFlipped ? 7 - col : col;
                
                square.className = `chess-square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
                square.dataset.row = displayRow;
                square.dataset.col = displayCol;

                const piece = this.board[displayRow][displayCol];
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = 'chess-piece';
                    pieceElement.textContent = piece.piece;
                    pieceElement.style.color = piece.color === 'white' ? '#fff' : '#000';
                    square.appendChild(pieceElement);
                }

                square.addEventListener('click', () => this.handleSquareClick(displayRow, displayCol));
                chessboard.appendChild(square);
            }
        }
    }

    handleSquareClick(row, col) {
        if (this.isGameOver) return;

        // Check if it's the player's turn in multiplayer
        if (this.gameMode === 'multiplayer' && !this.isMyTurn) return;

        const piece = this.board[row][col];
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);

        // Clear previous selections
        this.clearHighlights();

        if (this.selectedPiece) {
            // Try to move the selected piece
            if (this.isValidMove(this.selectedPiece.row, this.selectedPiece.col, row, col)) {
                this.makeMove(this.selectedPiece.row, this.selectedPiece.col, row, col);
                this.selectedPiece = null;
                
                // AI move if in AI mode
                if (this.gameMode === 'ai' && !this.isGameOver) {
                    setTimeout(() => this.makeAIMove(), 500);
                }
            } else {
                // Select new piece if clicked on a valid piece
                if (piece && piece.color === this.currentPlayer) {
                    this.selectPiece(row, col);
                } else {
                    this.selectedPiece = null;
                }
            }
        } else {
            // Select piece if it belongs to current player
            if (piece && piece.color === this.currentPlayer) {
                this.selectPiece(row, col);
            }
        }
    }

    selectPiece(row, col) {
        this.selectedPiece = { row, col };
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        square.classList.add('selected');

        // Show valid moves
        this.validMoves = this.getValidMoves(row, col);
        this.validMoves.forEach(move => {
            const moveSquare = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
            if (moveSquare) {
                moveSquare.classList.add('valid-move');
            }
        });
    }

    clearHighlights() {
        document.querySelectorAll('.chess-square').forEach(square => {
            square.classList.remove('selected', 'valid-move');
        });
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;

        // Check if destination has own piece
        const destPiece = this.board[toRow][toCol];
        if (destPiece && destPiece.color === piece.color) return false;

        // Get valid moves for the piece
        const validMoves = this.getValidMoves(fromRow, fromCol);
        return validMoves.some(move => move.row === toRow && move.col === toCol);
    }

    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];

        const moves = [];
        const pieceType = piece.piece;

        switch (pieceType) {
            case '♙': // White pawn
            case '♟': // Black pawn
                moves.push(...this.getPawnMoves(row, col, piece.color));
                break;
            case '♖': // White rook
            case '♜': // Black rook
                moves.push(...this.getRookMoves(row, col));
                break;
            case '♘': // White knight
            case '♞': // Black knight
                moves.push(...this.getKnightMoves(row, col));
                break;
            case '♗': // White bishop
            case '♝': // Black bishop
                moves.push(...this.getBishopMoves(row, col));
                break;
            case '♕': // White queen
            case '♛': // Black queen
                moves.push(...this.getQueenMoves(row, col));
                break;
            case '♔': // White king
            case '♚': // Black king
                moves.push(...this.getKingMoves(row, col));
                break;
        }

        return moves;
    }

    getPawnMoves(row, col, color) {
        const moves = [];
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;

        // Forward move
        const newRow = row + direction;
        if (newRow >= 0 && newRow < 8 && !this.board[newRow][col]) {
            moves.push({ row: newRow, col });
            
            // Double move from starting position
            if (row === startRow && !this.board[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col });
            }
        }

        // Diagonal captures - only if forward move is valid
        if (newRow >= 0 && newRow < 8) {
            for (const colOffset of [-1, 1]) {
                const newCol = col + colOffset;
                if (newCol >= 0 && newCol < 8) {
                    const targetPiece = this.board[newRow][newCol];
                    if (targetPiece && targetPiece.color !== color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                }
            }
        }

        return moves;
    }

    getRookMoves(row, col) {
        return this.getLinearMoves(row, col, [[0, 1], [0, -1], [1, 0], [-1, 0]]);
    }

    getBishopMoves(row, col) {
        return this.getLinearMoves(row, col, [[1, 1], [1, -1], [-1, 1], [-1, -1]]);
    }

    getQueenMoves(row, col) {
        return this.getLinearMoves(row, col, [
            [0, 1], [0, -1], [1, 0], [-1, 0],
            [1, 1], [1, -1], [-1, 1], [-1, -1]
        ]);
    }

    getKnightMoves(row, col) {
        const moves = [];
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        for (const [rowOffset, colOffset] of knightMoves) {
            const newRow = row + rowOffset;
            const newCol = col + colOffset;
            
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece || targetPiece.color !== this.board[row][col].color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }

        return moves;
    }

    getKingMoves(row, col) {
        const moves = [];
        const kingMoves = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (const [rowOffset, colOffset] of kingMoves) {
            const newRow = row + rowOffset;
            const newCol = col + colOffset;
            
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece || targetPiece.color !== this.board[row][col].color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }

        return moves;
    }

    getLinearMoves(row, col, directions) {
        const moves = [];
        const pieceColor = this.board[row][col].color;

        for (const [rowDir, colDir] of directions) {
            let newRow = row + rowDir;
            let newCol = col + colDir;

            while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetPiece = this.board[newRow][newCol];
                
                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (targetPiece.color !== pieceColor) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }

                newRow += rowDir;
                newCol += colDir;
            }
        }

        return moves;
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];

        // Store move for history
        this.moveHistory.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece.piece,
            captured: capturedPiece ? capturedPiece.piece : null,
            player: this.currentPlayer
        });

        // Make the move
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        // Check for pawn promotion
        if ((piece.piece === '♙' && toRow === 0) || (piece.piece === '♟' && toRow === 7)) {
            this.board[toRow][toCol].piece = piece.color === 'white' ? '♕' : '♛';
        }

        // Switch players
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        // Update multiplayer turn
        if (this.gameMode === 'multiplayer') {
            this.isMyTurn = !this.isMyTurn;
            
            // Send move to server
            if (this.socket && this.roomCode) {
                this.socket.emit('makeMove', {
                    roomCode: this.roomCode,
                    from: { row: fromRow, col: fromCol },
                    to: { row: toRow, col: toCol },
                    playerColor: piece.color
                });
            }
        }

        this.renderBoard();
        this.updateGameStatus();
        this.updateMoveHistory();

        // Check for game over conditions
        this.checkGameOver();
    }

    makeAIMove() {
        if (this.isGameOver || this.currentPlayer === 'white') return;

        // Simple AI: make a random valid move
        const allMoves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === 'black') {
                    const moves = this.getValidMoves(row, col);
                    moves.forEach(move => {
                        allMoves.push({ from: { row, col }, to: move });
                    });
                }
            }
        }

        if (allMoves.length > 0) {
            const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
            this.makeMove(randomMove.from.row, randomMove.from.col, randomMove.to.row, randomMove.to.col);
        }
    }

    checkGameOver() {
        // Check for checkmate or stalemate
        const hasValidMoves = this.hasValidMoves();
        
        if (!hasValidMoves) {
            this.isGameOver = true;
            const isCheck = this.isInCheck();
            
            if (isCheck) {
                this.updateGameStatus('Checkmate! ' + (this.currentPlayer === 'white' ? 'Black' : 'White') + ' wins!');
            } else {
                this.updateGameStatus('Stalemate! It\'s a draw!');
            }
        } else if (this.isInCheck()) {
            this.updateGameStatus('Check!');
        }
    }

    isInCheck() {
        // Find king position
        const kingPiece = this.currentPlayer === 'white' ? '♔' : '♚';
        let kingRow, kingCol;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.piece === kingPiece && piece.color === this.currentPlayer) {
                    kingRow = row;
                    kingCol = col;
                    break;
                }
            }
        }

        // Check if any opponent piece can attack the king
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color !== this.currentPlayer) {
                    const moves = this.getValidMoves(row, col);
                    if (moves.some(move => move.row === kingRow && move.col === kingCol)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    hasValidMoves() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === this.currentPlayer) {
                    const moves = this.getValidMoves(row, col);
                    if (moves.length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    updateGameStatus(message = null) {
        const statusElement = document.getElementById('gameStatus');
        const playerElement = document.getElementById('currentPlayer');
        
        if (message) {
            statusElement.textContent = message;
            statusElement.classList.add('game-status');
        } else {
            statusElement.textContent = '';
            statusElement.classList.remove('game-status');
        }

        if (!this.isGameOver) {
            playerElement.textContent = this.currentPlayer === 'white' ? 'White\'s Turn' : 'Black\'s Turn';
        }
    }

    updateMoveHistory() {
        const historyElement = document.getElementById('moveHistory');
        historyElement.innerHTML = '';

        if (this.moveHistory.length === 0) {
            historyElement.innerHTML = '<div class="text-center text-gray-400">No moves yet</div>';
            return;
        }

        for (let i = 0; i < this.moveHistory.length; i += 2) {
            const moveItem = document.createElement('div');
            moveItem.className = 'move-item';
            
            const moveNumber = Math.floor(i / 2) + 1;
            const whiteMove = this.moveHistory[i];
            const blackMove = this.moveHistory[i + 1];
            
            moveItem.innerHTML = `
                <span class="move-number">${moveNumber}.</span>
                <span>${this.getMoveNotation(whiteMove)}</span>
                ${blackMove ? `<span>${this.getMoveNotation(blackMove)}</span>` : ''}
            `;
            
            historyElement.appendChild(moveItem);
        }
    }

    getMoveNotation(move) {
        if (!move) return '';
        
        const files = 'abcdefgh';
        const ranks = '87654321';
        
        const fromFile = files[move.from.col];
        const fromRank = ranks[move.from.row];
        const toFile = files[move.to.col];
        const toRank = ranks[move.to.row];
        
        return `${fromFile}${fromRank}-${toFile}${toRank}`;
    }

    undoMove() {
        if (this.moveHistory.length === 0) return;
        
        const lastMove = this.moveHistory.pop();
        
        // Restore the board
        this.board[lastMove.from.row][lastMove.from.col] = {
            piece: lastMove.piece,
            color: lastMove.player
        };
        
        if (lastMove.captured) {
            this.board[lastMove.to.row][lastMove.to.col] = {
                piece: lastMove.captured,
                color: lastMove.player === 'white' ? 'black' : 'white'
            };
        } else {
            this.board[lastMove.to.row][lastMove.to.col] = null;
        }
        
        // Switch back to previous player
        this.currentPlayer = lastMove.player;
        
        this.renderBoard();
        this.updateGameStatus();
        this.updateMoveHistory();
        this.isGameOver = false;
    }

    flipBoard() {
        this.boardFlipped = !this.boardFlipped;
        this.renderBoard();
    }

    newGame() {
        this.resetGame();
        this.renderBoard();
        this.updateGameStatus();
        this.updateMoveHistory();
    }

    resetGame() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.isGameOver = false;
        this.boardFlipped = false;
        this.isMyTurn = true;
    }
}

// Initialize the game when the page loads
let chessGame;
document.addEventListener('DOMContentLoaded', () => {
    chessGame = new ChessGame();
}); 