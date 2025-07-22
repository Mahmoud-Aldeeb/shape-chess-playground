$("document").ready(function () {
  const $canvas = $("#canvas1");
  $canvas.hide(); // Initially hide the canvas until the "Draw Chess" button is clicked

  $("#drawChess").on("click", () => {
    const tileSize = 40; // Set tile size for each chessboard square
    const board = []; // Store the board tiles
    let selectedTile = null; // Track the selected tile for piece movement

    $canvas.show(); // Show the canvas when the button is clicked

    // Define initial pieces and their positions (using chess symbols)
    const pieces = {
      // 0,0: The first 0 represents the row, and the second 0 represents the column of the tile.
      // Note that the row number starts from 0, not 1.
      "0,0": "♖",
      "0,7": "♖",
      "7,0": "♜",
      "7,7": "♜",
      "0,4": "♔",
      "7,4": "♚",

      // Add Pawns (battling pieces)
      "1,0": "♙",
      "1,1": "♙",
      "1,2": "♙",
      "1,3": "♙",
      "1,4": "♙",
      "1,5": "♙",
      "1,6": "♙",
      "1,7": "♙",

      "6,0": "♟",
      "6,1": "♟",
      "6,2": "♟",
      "6,3": "♟",
      "6,4": "♟",
      "6,5": "♟",
      "6,6": "♟",
      "6,7": "♟",
    };

    // Draw the chessboard with initial pieces
    function drawChessBoard() {
      $canvas.empty(); // Clear the canvas before redrawing the board

      // I used a nested loop to generate the rows and columns
      for (let row = 0; row < 8; row++) {
        board[row] = []; // Create a new row for each chessboard row
        for (let col = 0; col < 8; col++) {
          // Create each tile of the chessboard
          const $tile = $('<div class="chess-tile">')
            .css({
              width: tileSize + "px", // Set tile width and height
              height: tileSize + "px",
              backgroundColor: (row + col) % 2 === 0 ? "#eeeed2" : "#769656", // Alternate light and dark tile colors
              display: "flex", // Use flexbox to center the pieces on the tile
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              border: "1px solid #444",
              cursor: "pointer",
            })
            .data({ row, col }); // Store row and column data on each tile

          const key = `${row},${col}`; // Create a key for identifying tile positions
          if (pieces[key]) {
            $tile.text(pieces[key]); // Place the piece (if any) on the tile
            $tile.data("piece", pieces[key]); // Store the piece data on the tile
          }

          // (important!) I'm not using arrow functions because I need to use this which behaves differently in arrow functions
          $tile.on("click", function () {
            handleTileClick($(this)); // Set up click event for selecting and moving pieces
          });

          board[row][col] = $tile; // Store the tile in the board array
          $canvas.append($tile); // Add the tile to the canvas
        }
      }
    }

    // Handle tile click (select piece or move piece)
    function handleTileClick($tile) {
      const piece = $tile.data("piece"); // Get the piece on the clicked tile
      if (selectedTile) {
        if ($tile.hasClass("highlight")) {
          movePiece(selectedTile, $tile); // Move the piece if clicked tile is highlighted
        }
        clearHighlights(); // Clear previous highlights
        selectedTile = null; // Deselect the tile
      } else if (piece) {
        selectedTile = $tile; // Select the tile if it contains a piece
        showPossibleMoves($tile); // Show possible moves for the selected piece
      }
    }

    // Move piece from one tile to another
    function movePiece($from, $to) {
      const piece = $from.data("piece");
      $to.text(piece).data("piece", piece); // Move the piece to the new tile
      $from.text("").removeData("piece"); // Remove the piece from the original tile
      animateMove($from, $to); // Animate the move
    }

    // Show possible moves for the selected piece
    function showPossibleMoves($tile) {
      const piece = $tile.data("piece");
      const row = $tile.data("row");
      const col = $tile.data("col");

      const moves = [];
      if (piece === "♖" || piece === "♜") {
        // Rook: can move horizontally or vertically
        for (let i = 0; i < 8; i++) {
          if (i !== row) moves.push([i, col]); // Vertical moves
          if (i !== col) moves.push([row, i]); // Horizontal moves
        }
      } else if (piece === "♔" || piece === "♚") {
        // King: can move one square in any direction
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr !== 0 || dc !== 0) moves.push([row + dr, col + dc]);
          }
        }
      } else if (piece === "♙") {
        // White Pawn: moves 1 square forward, or 2 squares on first move
        if (row < 7) moves.push([row + 1, col]); // Normal 1-square forward move
        if (row === 1) moves.push([row + 2, col]); // Special first move: 2 squares forward
      } else if (piece === "♟") {
        // Black Pawn: moves 1 square forward, or 2 squares on first move
        if (row > 0) moves.push([row - 1, col]); // Normal 1-square forward move
        if (row === 6) moves.push([row - 2, col]); // Special first move: 2 squares forward
      }

      highlightTiles(moves); // Highlight valid move tiles
    }

    // Highlight the tiles that can be moved to
    function highlightTiles(moves) {
      moves.forEach(([r, c]) => {
        if (r >= 0 && r < 8 && c >= 0 && c < 8) {
          board[r][c].addClass("highlight"); // Add highlight class to the tile
        }
      });
    }

    // Clear any highlighted tiles
    function clearHighlights() {
      $(".highlight").removeClass("highlight");
    }

    // Animate piece movement using GSAP (GreenSock Animation)
    function animateMove($from, $to) {
      gsap.fromTo($to, { scale: 0 }, { scale: 1, duration: 0.3 }); // Animate the scale of the piece
    }

    drawChessBoard(); // Call the function to draw the chessboard when the page loads
  });
});
