/* App helpers ****************************************************************/

export function selectPiece (r: number, c: number, board: string[][], 
                             lightTurn: boolean): number[][] {
 let shade: string = (lightTurn) ? "l" : "d";
 if (shade == board[r][c].charAt(1)) { 
  return legalMoves(r, c, board);
 } 
 return [];
} // return legal moves when applicable

/* Contained helpers **********************************************************/

function legalMoves(r: number, c: number, board: string[][]): number[][] {
  let moves: number[][] = [];
  console.log("hi");
  return moves;
}