Goal: Create a complete, fully functional Chess Game using HTML5 + CSS3 + Vanilla JavaScript (no frameworks).
Output the entire project with the following files:

index.html

style.css

script.js

assets/ folder with chess piece icons (SVG or PNG)

The project must be polished, responsive, playable, and include full chess rules.

🧱 File Structure (MUST follow this):
/chess-game/
│── index.html
│── style.css
│── script.js
└── assets/
    ├── white_pawn.svg
    ├── white_rook.svg
    ├── white_knight.svg
    ├── white_bishop.svg
    ├── white_queen.svg
    ├── white_king.svg
    ├── black_pawn.svg
    ├── black_rook.svg
    ├── black_knight.svg
    ├── black_bishop.svg
    ├── black_queen.svg
    ├── black_king.svg


If the generator cannot produce files, embed Base64 placeholders inside the output.

🎮 CORE FEATURES (MANDATORY)
✔️ 1. FULL CHESS RULES IMPLEMENTATION

The game must support:

Legal moves for all pieces

Check

Checkmate

Stalemate

Draw by insufficient material

Castling (both sides)

En Passant

Pawn Promotion (popup modal with piece selection)

✔️ 2. BOARD INTERACTIONS

Drag and Drop piece movement (mouse + touch)

Click-to-select alternative (for mobile)

Highlight:

Selected piece

Legal moves

Enemy capture squares

King in check

✔️ 3. GAME UI PANELS

Include:

Turn indicator ("White to Move / Black to Move")

Move History panel (standard PGN format)

Restart/New Game button

Undo Move button (move stack)

Dark Mode toggle

Sound effects toggle

🎨 VISUAL & DESIGN REQUIREMENTS
✔️ Chessboard:

8×8 grid

Light/dark square colors

Coordinates on edges (a–h, 1–8)

Smooth hover and movement animations

Snap-to-square drop behavior

✔️ Pieces:

Use clean SVG chess icons

Smooth drag animation

Highlight captured pieces in a "graveyard" sidebar

✔️ UI:

Modern, minimal, glass-morphism theme

Responsive layout (mobile/tablet/desktop)

Header with game title

Right sidebar with:

Move history

Captured pieces

Controls

🧠 OPTIONAL (IF POSSIBLE): BUILT-IN CHESS AI

A simple minimax or random-move bot

Button: “Play vs Computer” or “Play 2-Player”

Difficulty selector (Easy / Medium / Hard)

If AI is not implemented, include a placeholder function.

💡 FUNCTIONALITY DETAILS
✔️ script.js MUST include:

Game state object

Board array representation (8×8)

Move generator functions

Check & checkmate logic

Fen string import/export

Move history stored in an array

Undo feature using previous state stack

Event listeners for drag/drop + clicks

Promotion UI logic

Castling + en passant rules

✔️ Code Organization:

Use separate modular functions:

initGame()

drawBoard()

placePieces()

generateLegalMoves(square)

makeMove(move)

undoMove()

isCheck()

isCheckmate()

isStalemate()

updateUI()

highlightMoves()

Add comments explaining each function.

🔊 SOUND EFFECTS (OPTIONAL)

Provide placeholders for:

Move sound

Capture sound

Check warning

Game win/loss tone

📱 RESPONSIVENESS

Board should resize based on screen width

Pieces scale proportionally

Mobile: use tap-to-select + tap-to-move option

Desktop: support drag & drop

📦 FINAL DELIVERABLES (REQUIRED)

The generator must output:

Complete index.html

Complete style.css with all board + UI styling

Complete script.js with full chess logic

All piece icons (SVG or Base64)

Instructions on how to run the game

Explanation of the code structure (150–300 words)

📘 Short Command Version (if needed):

"Generate a full-featured HTML/CSS/JS chess game with drag & drop, legal moves, check, checkmate, castling, en passant, promotion modal, move history, responsive board, SVG pieces, undo, restart, turn indicator, and complete code in index.html, style.css, script.js."