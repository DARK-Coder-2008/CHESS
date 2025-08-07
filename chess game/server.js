const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Game rooms storage
const rooms = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Create a new room
    socket.on('createRoom', () => {
        const roomCode = generateRoomCode();
        rooms.set(roomCode, {
            players: [socket.id],
            gameState: null,
            currentPlayer: 'white'
        });
        
        socket.join(roomCode);
        socket.emit('roomCreated', { roomCode });
        console.log(`Room created: ${roomCode}`);
    });

    // Join an existing room
    socket.on('joinRoom', (roomCode) => {
        const room = rooms.get(roomCode);
        
        if (!room) {
            socket.emit('roomError', { message: 'Room not found' });
            return;
        }
        
        if (room.players.length >= 2) {
            socket.emit('roomError', { message: 'Room is full' });
            return;
        }
        
        room.players.push(socket.id);
        socket.join(roomCode);
        
        socket.emit('roomJoined', { roomCode, playerColor: 'black' });
        socket.to(roomCode).emit('playerJoined', { playerColor: 'black' });
        
        // Start the game if both players are present
        if (room.players.length === 2) {
            io.to(roomCode).emit('gameStart', { 
                currentPlayer: 'white',
                gameState: initializeGameState()
            });
        }
        
        console.log(`Player joined room: ${roomCode}`);
    });

    // Handle game moves
    socket.on('makeMove', (data) => {
        const { roomCode, from, to, playerColor } = data;
        const room = rooms.get(roomCode);
        
        if (!room) return;
        
        // Validate move (basic validation)
        if (room.currentPlayer !== playerColor) return;
        
        // Update game state
        const newGameState = makeMove(room.gameState, from, to);
        room.gameState = newGameState;
        room.currentPlayer = room.currentPlayer === 'white' ? 'black' : 'white';
        
        // Broadcast move to all players in the room
        io.to(roomCode).emit('moveMade', {
            from,
            to,
            gameState: newGameState,
            currentPlayer: room.currentPlayer
        });
        
        // Check for game over conditions
        const gameStatus = checkGameStatus(newGameState);
        if (gameStatus.isOver) {
            io.to(roomCode).emit('gameOver', gameStatus);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        // Remove player from rooms
        for (const [roomCode, room] of rooms.entries()) {
            const playerIndex = room.players.indexOf(socket.id);
            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);
                
                // Notify other players
                socket.to(roomCode).emit('playerLeft');
                
                // Clean up empty rooms
                if (room.players.length === 0) {
                    rooms.delete(roomCode);
                    console.log(`Room deleted: ${roomCode}`);
                }
                break;
            }
        }
    });
});

// Helper functions
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function initializeGameState() {
    // Initialize chess board with starting position
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
    
    return {
        board,
        moveHistory: [],
        isGameOver: false
    };
}

function makeMove(gameState, from, to) {
    const newGameState = JSON.parse(JSON.stringify(gameState));
    const piece = newGameState.board[from.row][from.col];
    
    if (!piece) return gameState;
    
    // Make the move
    newGameState.board[to.row][to.col] = piece;
    newGameState.board[from.row][from.col] = null;
    
    // Add to move history
    newGameState.moveHistory.push({
        from,
        to,
        piece: piece.piece,
        player: piece.color
    });
    
    return newGameState;
}

function checkGameStatus(gameState) {
    // Basic game over check (simplified)
    // In a real implementation, you'd check for checkmate, stalemate, etc.
    
    return {
        isOver: false,
        winner: null,
        reason: null
    };
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Chess server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} to play`);
}); 