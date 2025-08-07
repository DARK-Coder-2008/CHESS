// Main Application Logic
class ChessApp {
    constructor() {
        this.game = null;
        this.initializeApp();
    }

    initializeApp() {
        // Initialize the chess game
        this.game = new ChessGame();
        
        // Add additional UI enhancements
        this.setupKeyboardShortcuts();
        this.setupTouchSupport();
        this.setupAnimations();
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'Escape':
                    this.game.showMenu();
                    break;
                case 'z':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.game.undoMove();
                    }
                    break;
                case 'f':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.game.flipBoard();
                    }
                    break;
                case 'n':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.game.newGame();
                    }
                    break;
            }
        });
    }

    setupTouchSupport() {
        // Add touch support for mobile devices
        let touchStartX, touchStartY;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            // Swipe gestures
            if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // Horizontal swipe
                    if (deltaX > 0) {
                        // Swipe right - undo move
                        this.game.undoMove();
                    } else {
                        // Swipe left - new game
                        this.game.newGame();
                    }
                } else {
                    // Vertical swipe
                    if (deltaY > 0) {
                        // Swipe down - flip board
                        this.game.flipBoard();
                    }
                }
            }
            
            touchStartX = null;
            touchStartY = null;
        });
    }

    setupAnimations() {
        // Add smooth animations for piece movements
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('chess-piece')) {
                            node.classList.add('piece-moving');
                            setTimeout(() => {
                                node.classList.remove('piece-moving');
                            }, 300);
                        }
                    });
                }
            });
        });

        const chessboard = document.getElementById('chessboard');
        if (chessboard) {
            observer.observe(chessboard, { childList: true, subtree: true });
        }
    }
}

// Enhanced AI opponent with different difficulty levels
class ChessAI {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.pieceValues = {
            '♙': 1, '♟': 1,   // Pawns
            '♘': 3, '♞': 3,   // Knights
            '♗': 3, '♝': 3,   // Bishops
            '♖': 5, '♜': 5,   // Rooks
            '♕': 9, '♛': 9,   // Queens
            '♔': 1000, '♚': 1000 // Kings
        };
    }

    evaluateBoard(board) {
        let score = 0;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece) {
                    const value = this.pieceValues[piece.piece] || 0;
                    score += piece.color === 'white' ? value : -value;
                }
            }
        }
        return score;
    }

    getBestMove(board, depth = 3) {
        const moves = this.getAllMoves(board, 'black');
        let bestMove = null;
        let bestScore = -Infinity;

        for (const move of moves) {
            const newBoard = this.makeMoveOnBoard(board, move);
            const score = this.minimax(newBoard, depth - 1, false, -Infinity, Infinity);
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    getAllMoves(board, color) {
        const moves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.color === color) {
                    const validMoves = this.getValidMovesForPiece(board, row, col);
                    validMoves.forEach(move => {
                        moves.push({
                            from: { row, col },
                            to: move
                        });
                    });
                }
            }
        }
        return moves;
    }

    getValidMovesForPiece(board, row, col) {
        // Simplified move generation for AI
        const piece = board[row][col];
        if (!piece) return [];

        const moves = [];
        const pieceType = piece.piece;

        // Basic move patterns (simplified version)
        switch (pieceType) {
            case '♙': // White pawn
            case '♟': // Black pawn
                const direction = piece.color === 'white' ? -1 : 1;
                const newRow = row + direction;
                
                if (newRow >= 0 && newRow < 8 && !board[newRow][col]) {
                    moves.push({ row: newRow, col });
                }
                
                // Diagonal captures
                for (const colOffset of [-1, 1]) {
                    const newCol = col + colOffset;
                    if (newCol >= 0 && newCol < 8) {
                        const targetPiece = board[newRow][newCol];
                        if (targetPiece && targetPiece.color !== piece.color) {
                            moves.push({ row: newRow, col: newCol });
                        }
                    }
                }
                break;
                
            case '♘': // Knight
            case '♞':
                const knightMoves = [
                    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                    [1, -2], [1, 2], [2, -1], [2, 1]
                ];
                
                for (const [rowOffset, colOffset] of knightMoves) {
                    const newRow = row + rowOffset;
                    const newCol = col + colOffset;
                    
                    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                        const targetPiece = board[newRow][newCol];
                        if (!targetPiece || targetPiece.color !== piece.color) {
                            moves.push({ row: newRow, col: newCol });
                        }
                    }
                }
                break;
                
            case '♗': // Bishop
            case '♝':
                const bishopDirections = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
                moves.push(...this.getLinearMoves(board, row, col, bishopDirections));
                break;
                
            case '♖': // Rook
            case '♜':
                const rookDirections = [[0, 1], [0, -1], [1, 0], [-1, 0]];
                moves.push(...this.getLinearMoves(board, row, col, rookDirections));
                break;
                
            case '♕': // Queen
            case '♛':
                const queenDirections = [
                    [0, 1], [0, -1], [1, 0], [-1, 0],
                    [1, 1], [1, -1], [-1, 1], [-1, -1]
                ];
                moves.push(...this.getLinearMoves(board, row, col, queenDirections));
                break;
                
            case '♔': // King
            case '♚':
                const kingMoves = [
                    [-1, -1], [-1, 0], [-1, 1],
                    [0, -1], [0, 1],
                    [1, -1], [1, 0], [1, 1]
                ];
                
                for (const [rowOffset, colOffset] of kingMoves) {
                    const newRow = row + rowOffset;
                    const newCol = col + colOffset;
                    
                    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                        const targetPiece = board[newRow][newCol];
                        if (!targetPiece || targetPiece.color !== piece.color) {
                            moves.push({ row: newRow, col: newCol });
                        }
                    }
                }
                break;
        }

        return moves;
    }

    getLinearMoves(board, row, col, directions) {
        const moves = [];
        const pieceColor = board[row][col].color;

        for (const [rowDir, colDir] of directions) {
            let newRow = row + rowDir;
            let newCol = col + colDir;

            while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetPiece = board[newRow][newCol];
                
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

    makeMoveOnBoard(board, move) {
        const newBoard = JSON.parse(JSON.stringify(board));
        const piece = newBoard[move.from.row][move.from.col];
        newBoard[move.to.row][move.to.col] = piece;
        newBoard[move.from.row][move.from.col] = null;
        return newBoard;
    }

    minimax(board, depth, isMaximizing, alpha, beta) {
        if (depth === 0) {
            return this.evaluateBoard(board);
        }

        if (isMaximizing) {
            let maxScore = -Infinity;
            const moves = this.getAllMoves(board, 'black');
            
            for (const move of moves) {
                const newBoard = this.makeMoveOnBoard(board, move);
                const score = this.minimax(newBoard, depth - 1, false, alpha, beta);
                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            const moves = this.getAllMoves(board, 'white');
            
            for (const move of moves) {
                const newBoard = this.makeMoveOnBoard(board, move);
                const score = this.minimax(newBoard, depth - 1, true, alpha, beta);
                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) break;
            }
            return minScore;
        }
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChessApp();
}); 
// --- User Data JSON Section ---
// Functions to load and save user data from user_data.json
async function loadUserData() {
    try {
        const response = await fetch('user_data.json');
        if (!response.ok) throw new Error('Failed to load user data');
        return await response.json();
    } catch (e) {
        console.error('Error loading user data:', e);
        return { users: [] };
    }
}

async function saveUserData(data) {
    // Note: Browsers cannot write to local files directly for security reasons.
    // This function is a placeholder for server-side or Electron apps.
    // For a real web app, send data to a backend API to save.
    console.warn('saveUserData is not implemented for browser-only apps.');
}
// Example usage:
// loadUserData().then(data => { data.users.push({username: 'player1'}); saveUserData(data); });