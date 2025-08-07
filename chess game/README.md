# Chess Game

A modern web-based chess game built with HTML, CSS (Tailwind), and JavaScript. Features include AI opponent, multiplayer support, and a beautiful responsive interface.

## Features

### 🎮 Game Modes
- **AI Mode**: Play against a computer opponent with intelligent move generation
- **Multiplayer Mode**: Play against other players online using room codes

### 🎯 Game Features
- **Complete Chess Rules**: All standard chess rules implemented
- **Move Validation**: Proper piece movement validation
- **Check/Checkmate Detection**: Automatic detection of game-ending conditions
- **Move History**: Track all moves with algebraic notation
- **Board Flipping**: Flip the board to view from either player's perspective
- **Undo Moves**: Go back to previous moves
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### 🎨 User Interface
- **Modern Design**: Clean, dark theme with Tailwind CSS
- **Smooth Animations**: Piece movement animations and visual feedback
- **Touch Support**: Swipe gestures for mobile devices
- **Keyboard Shortcuts**: Quick actions with keyboard commands

### 🤖 AI Features
- **Smart Opponent**: AI uses minimax algorithm with alpha-beta pruning
- **Configurable Difficulty**: Different AI difficulty levels
- **Move Evaluation**: Position-based move scoring

### 🌐 Multiplayer Features
- **Room System**: Create or join game rooms with unique codes
- **Real-time Updates**: Live game state synchronization
- **Player Management**: Handle player connections and disconnections

## Installation

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Setup Instructions

1. **Clone or download the project files**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Development Mode
For development with auto-restart:
```bash
npm run dev
```

## How to Play

### AI Mode
1. Click "Play vs AI" on the main menu
2. You play as White (bottom pieces)
3. Click on a piece to select it, then click on a valid square to move
4. The AI will automatically respond after your move

### Multiplayer Mode
1. Click "Play vs Player (Online)" on the main menu
2. **To create a game:**
   - A room code will be generated automatically
   - Share this code with your opponent
   - Click "Copy" to copy the room code
3. **To join a game:**
   - Enter the room code provided by your opponent
   - Click "Join" to enter the room
4. The game starts when both players are connected

## Controls

### Keyboard Shortcuts
- `Escape`: Return to main menu
- `Ctrl/Cmd + Z`: Undo last move
- `Ctrl/Cmd + F`: Flip board
- `Ctrl/Cmd + N`: New game

### Touch Gestures (Mobile)
- **Swipe Right**: Undo move
- **Swipe Left**: New game
- **Swipe Down**: Flip board

## Game Rules

The game follows standard chess rules:

- **Pawns**: Move forward one square (or two from starting position), capture diagonally
- **Rooks**: Move horizontally and vertically
- **Knights**: Move in L-shape (2 squares in one direction, 1 square perpendicular)
- **Bishops**: Move diagonally
- **Queens**: Move in any direction (horizontal, vertical, diagonal)
- **Kings**: Move one square in any direction
- **Check**: King is under attack
- **Checkmate**: King is under attack with no legal moves to escape
- **Stalemate**: No legal moves but king is not in check

## Technical Details

### Frontend
- **HTML5**: Semantic markup
- **Tailwind CSS**: Utility-first CSS framework
- **Vanilla JavaScript**: No frameworks, pure JS
- **Socket.IO Client**: Real-time communication

### Backend
- **Node.js**: Server runtime
- **Express.js**: Web framework
- **Socket.IO**: Real-time bidirectional communication

### AI Implementation
- **Minimax Algorithm**: Game tree search
- **Alpha-Beta Pruning**: Optimization for better performance
- **Position Evaluation**: Material and positional scoring

## File Structure

```
chess-game/
├── index.html          # Main HTML file
├── styles.css          # Custom CSS styles
├── chess.js           # Chess game logic
├── app.js             # Main application logic
├── server.js          # Node.js server
├── package.json       # Dependencies
└── README.md          # This file
```

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

Feel free to contribute to this project by:
- Reporting bugs
- Suggesting new features
- Improving the AI algorithm
- Enhancing the UI/UX

## License

This project is licensed under the Aditya Raj Singh's License.

## Acknowledgments

- Chess piece Unicode characters
- Tailwind CSS for styling
- Socket.IO for real-time communication
- Chess community for inspiration

---

**Enjoy playing chess! ♟️** 