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

  // forward 1
  const f1R = (shade == "l") ? r - 1: r + 1;
  if (0 <= f1R && f1R < 8 && board[f1R][c] == "_") {
    moves.push([f1R, c]);
  }
  // forward 2
  const f2R = (shade == "l") ? r - 2: r + 2;
  if (0 <= f2R && f2R < 8 && board[f2R][c] == "_" && 
    ((shade == "l" && r == 6) || (shade == "d" && r == 1))) {
    moves.push([f2R, c]);
  }

  // TBD capture moves / special moves

  return moves;
}


