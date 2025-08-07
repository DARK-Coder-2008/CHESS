# Multiplayer Chess Testing Guide

## How to Test Player vs Player Mode

### Step 1: Test Server Connection
1. Open `http://localhost:3000/multiplayer-test.html`
2. Click "Test Socket" to verify WebSocket connection
3. Click "Test Room" to verify room creation and joining

### Step 2: Test Multiplayer Game
1. Open `http://localhost:3000` in two different browser windows/tabs
2. In both windows, click "Play vs Player (Online)"
3. In the first window, you'll see a room code (e.g., "ABC123")
4. Copy the room code from the first window
5. In the second window, paste the room code and click "Join"
6. Both players should now see the chess board and can play

### Step 3: Verify Game Functionality
- White player goes first
- Players take turns making moves
- Moves are synchronized between both players
- Game status updates for both players

## Troubleshooting

### If connection fails:
1. Make sure the server is running: `npm start`
2. Check browser console for errors
3. Try refreshing the page

### If room joining fails:
1. Make sure you're using the exact room code
2. Try creating a new room
3. Check that only 2 players are in the room

### If moves don't sync:
1. Check browser console for WebSocket errors
2. Try refreshing both browser windows
3. Make sure both players are connected

## Features Working:
- ✅ WebSocket connection
- ✅ Room creation and joining
- ✅ Real-time move synchronization
- ✅ Turn-based gameplay
- ✅ Game state management

## Known Issues:
- Undo move doesn't sync between players
- Game over detection is basic
- No chat functionality
- No spectator mode

## Testing URLs:
- Main Game: `http://localhost:3000`
- Multiplayer Test: `http://localhost:3000/multiplayer-test.html`
- Basic Test: `http://localhost:3000/simple-test.html` 