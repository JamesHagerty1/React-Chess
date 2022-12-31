/* App helpers ****************************************************************/

export function selectPiece (r: number, c: number, board: string[][], 
  lightTurn: boolean): [boolean, [number, number][]] {
 let shade: string = (lightTurn) ? "l" : "d";
 if (shade == board[r][c].charAt(1)) { 
  return [true, legalMoves(r, c, board)];
 } 
 return [false, []];
} // return legal moves when applicable

// TS seems to not have built in fn for checking if list contains tuple
export function isMove(r: number, c: number, curMoves: [number, number][]): 
  boolean {
  for (let i in curMoves) {
    const [rMove, cMove] = curMoves[i];
    if (r == rMove && c == cMove) {
      return true;
    }
  }
  return false;
}

// assert piece is at board[rSel][cSel] and all (r, c) in bounds
export function isCapture(rSel: number, cSel: number, rDest: number, 
  cDest: number, board: string[][]): [boolean, [number, number]] {
  const shade: string = board[rSel][cSel].charAt(1);
  const captureShade: string = (shade == "l") ? "d" : "l";
  // conventional capture
  if (board[rDest][cDest].length == 2 && 
    board[rDest][cDest].charAt(1) == captureShade) {
    return [true, [rDest, cDest]];
  }
  // pawn en passant capture

  return [false, [-1, -1]];
}

/* Contained helpers **********************************************************/

function legalMoves(r: number, c: number, board: string[][]): 
  [number, number][] {
  const [piece, shade]: [string, string] = 
    [board[r][c].charAt(0), board[r][c].charAt(1)];

  switch (piece) {
    case "p":
      return pawnMoves(r, c, board, shade);
    default:
      console.log("TBD");
      return [];
  }
}

// assert pawn at board[r][c]
function pawnMoves(r: number, c: number, board: string[][], shade: string):
  [number, number][] {
  let moves: [number, number][] = [];
  const captureShade: string = (shade == "l") ? "d" : "l";

  // forward 1
  const rF1 = (shade == "l") ? r - 1 : r + 1;
  if (0 <= rF1 && rF1 < 8 && board[rF1][c] == "_") {
    moves.push([rF1, c]);
  }
  // forward 2
  const rF2 = (shade == "l") ? r - 2: r + 2;
  if (0 <= rF2 && rF2 < 8 && board[rF1][c] == "_" && board[rF2][c] == "_" &&
    ((shade == "l" && r == 6) || (shade == "d" && r == 1))) {
    moves.push([rF2, c]);
  }
  // conventional diagonal captures
  const [cL, cR] = [c - 1, c + 1];
  if (0 <= cL && cL < 8 && 0 <= rF1 && rF1 < 8 && 
    board[rF1][cL].charAt(1) == captureShade) {
    moves.push([rF1, cL]);
  }
  if (0 <= cR && cR < 8 && 0 <= rF1 && rF1 < 8 && 
    board[rF1][cR].charAt(1) == captureShade) {
    moves.push([rF1, cR]);
  }
  // en passant diagonal captures

  // TBD capture moves / special moves

  return moves;
}


