/* App helpers ****************************************************************/


// need to know lastMove for en passant pawn legal move check
export function selectPiece (r: number, c: number, board: string[][], 
  lightTurn: boolean, lastMove: [string, number, number, number, number]): 
  [boolean, [number, number][]] {
 let shade: string = (lightTurn) ? "l" : "d";
 if (shade == board[r][c].charAt(1)) { 
  return [true, legalMoves(r, c, board, lastMove)];
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
  cDest: number, board: string[][], 
  lastMove: [string, number, number, number, number]): 
  [boolean, [number, number]] {
  const shade: string = board[rSel][cSel].charAt(1);
  const captureShade: string = (shade == "l") ? "d" : "l";
  // conventional capture
  if (board[rDest][cDest].length == 2 && 
    board[rDest][cDest].charAt(1) == captureShade) {
    return [true, [rDest, cDest]];
  }
  // pawn en passant capture
  if (isEnPassant(rDest, cDest, board, captureShade, lastMove)) {
    return [true, [lastMove[3], lastMove[4]]];
  }
  return [false, [-1, -1]];
}


/* File contained helpers *****************************************************/


function legalMoves(r: number, c: number, board: string[][],
  lastMove: [string, number, number, number, number]): [number, number][] {
  const [piece, shade]: [string, string] = 
    [board[r][c].charAt(0), board[r][c].charAt(1)];

  switch (piece) {
    case "p":
      return pawnMoves(r, c, board, shade, lastMove);
    default:
      console.log("TBD");
      return [];
  }
}


function isEnPassant(rDest: number, cDest: number, board: string[][], 
  captureShade: string, 
  lastMove: [string, number, number, number, number]): boolean {
  if (lastMove == undefined) {
    return false;
  }
  const [piece, r1, c1, r2, c2] = lastMove;
  const blankDest: boolean = (board[rDest][cDest].charAt(0) == "_");
  const pawnMovedTwo: boolean = 
    piece.charAt(0) == "p" && Math.abs(r1 - r2) == 2;
  const rBehind: number = (captureShade == "l") ? rDest - 1 : rDest + 1;
  const pawnBehind: boolean = (rBehind == r2 && cDest == c2);

  return blankDest && pawnMovedTwo && pawnBehind;
}


// assert pawn at board[r][c]
function pawnMoves(r: number, c: number, board: string[][], shade: string,
  lastMove: [string, number, number, number, number]): [number, number][] {
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
  if (0 <= cL && cL < 8 && 0 <= rF1 && rF1 < 8 && board[rF1][cL].length > 1 &&
    board[rF1][cL].charAt(1) == captureShade) {
    moves.push([rF1, cL]);
  }
  if (0 <= cR && cR < 8 && 0 <= rF1 && rF1 < 8 && board[rF1][cR].length > 1 &&
    board[rF1][cR].charAt(1) == captureShade) {
    moves.push([rF1, cR]);
  }
  // en passant captures
  if (0 <= cL && cL < 8 && 0 <= rF1 && rF1 < 8 && 
    isEnPassant(rF1, cL, board, captureShade, lastMove)) {
    moves.push([rF1, cL]);
  }
  if (0 <= cR && cR < 8 && 0 <= rF1 && rF1 < 8 &&
    isEnPassant(rF1, cR, board, captureShade, lastMove)) {
    moves.push([rF1, cR]);
  }

  return moves;
}


