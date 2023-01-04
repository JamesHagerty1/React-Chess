export function getMoves(board: string[][], turn: string):
  {[key: string]: string[]} {
    let moves: {[key: string]: string[]} = {};
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c].endsWith(turn)) {
          const pieceId = board[r][c];
          let tiles: string[] = reach[pieceId.charAt(0)](r, c, board, turn);
          moves[`${r}${c}`] = legalMoves(r, c, board, tiles, turn);
        }
      }
    }
    return moves;
}


function legalMoves(r: number, c: number, board: string[][], tiles: string[],
  turn: string): string[] {
  let moves: string[] = [];
  for (let tileId of tiles) {
    const [rMove, cMove] = [Number(tileId.charAt(0)), Number(tileId.charAt(1))];
    let tryBoard = board.map(pieceId => {return {...pieceId}}); // js deepcopy
    tryBoard = makeMove(r, c, rMove, cMove, board);
    if (!canCheck(tryBoard, turn)) {
      moves.push(`${rMove}${cMove}`);
    }
  }
  return moves;
}


function makeMove(r1: number, c1: number, r2: number, c2: number, 
  board: string[][]): string[][] {
  board[r2][c2] = board[r1][c1];
  board[r1][c1] = "_";
  return board;
}


function canCheck(board: string[][], turn: string) {
  const opponent: string = (turn == "l") ? "d" : "l";

  return false; // TEMP
}


function attackedTile(r: number, c: number, board: string[][], 
  opponent: string): boolean {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c].endsWith(opponent)) {
        const pieceId = board[r][c];
        let tiles: string[] = reach[pieceId.charAt(0)](r, c, board, opponent);
        if (tiles.includes(`${r}${c}`)) {
          return true;
        }
      }
    }
  }
  return false;
}


const reach: {[key: string]: Function} = {
  "n": knightReach, 
  "k": kingReach,
  "q": queenReach,
  "r": rookReach,
  "b": bishopReach,
  "p": pawnReach
}


function onBoard(r: number, c: number): boolean {
  return 0 <= r && r < 8 && 0 <= c && c < 8;
}


function knightReach(r: number, c: number, board: string[][], turn: string): 
  string[] {
  let tiles: string[] = [];
  return tiles;
}


function kingReach(r: number, c: number, board: string[][], turn: string): 
  string[] {
  let tiles: string[] = [];
  
  return tiles;
}


function queenReach(r: number, c: number, board: string[][], turn: string): 
  string[] {
  let tiles: string[] = [];
  return tiles;
}


function rookReach(r: number, c: number, board: string[][], turn: string): 
  string[] {
  let tiles: string[] = [];
  return tiles;
}


function bishopReach(r: number, c: number, board: string[][], turn: string): 
  string[] {
  let tiles: string[] = [];
  return tiles;
}


function pawnReach(r: number, c: number, board: string[][], turn: string): 
  string[] {
  let tiles: string[] = [];

  const opponent: string = (turn == "l") ? "d" : "l";
  // forward 
  const rF1 = (turn == "l") ? r - 1 : r + 1;
  if (onBoard(rF1, c) && board[rF1][c] == "_") {
    tiles.push(`${rF1}${c}`);
  }
  const rF2 = (turn == "l") ? r - 2: r + 2;
  if (onBoard(rF2, c) && board[rF1][c] == "_" && board[rF2][c] == "_" &&
    ((turn == "l" && r == 6) || (turn == "d" && r == 1))) {
    tiles.push(`${rF2}${c}`);
  }
  // conventional diagonal captures
  const [cL, cR] = [c - 1, c + 1];
  if (onBoard(rF1, cL) && board[rF1][cL].length > 1 &&
    board[rF1][cL].charAt(1) == opponent) {
    tiles.push(`${rF1}${cL}`);
  }
  if (onBoard(rF1, cR) && board[rF1][cR].length > 1 &&
    board[rF1][cR].charAt(1) == opponent) {
    tiles.push(`${rF1}${cR}`);
  }

  // TBD
  // en passant captures
  // if (onBoard(rF1, cL) && isEnPassant(rF1, cL, captureShade)) {
  //   moves.push([rF1, cL]);
  // }
  // if (onBoard(rF1, cR) && isEnPassant(rF1, cR, captureShade)) {
  //   moves.push([rF1, cR]);
  // }
  // return moves;

  return tiles;
}