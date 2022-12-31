/* App helpers ****************************************************************/

export function selectPiece (r: number, c: number, board: string[][], 
  lightTurn: boolean): [boolean, [number, number][]] {
 let shade: string = (lightTurn) ? "l" : "d";
 if (shade == board[r][c].charAt(1)) { 
  return [true, legalMoves(r, c, board)];
 } 
 return [false, []];
} // return legal moves when applicable

/* Contained helpers **********************************************************/

function legalMoves(r: number, c: number, board: string[][]): 
  [number, number][] {
  const [piece, shade]: [string, string] = 
    [board[r][c].charAt(0), board[r][c].charAt(1)];
  console.log(piece, shade);

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
  console.log("pawn moves");
  let moves: [number, number][] = [];

  // forward 1
  const f1R = (shade == "l") ? r - 1: r + 1;
  if (0 <= f1R && f1R < 8 && board[f1R][c] == "_") {
    moves.push([f1R, c]);
  }

  return moves;
}


