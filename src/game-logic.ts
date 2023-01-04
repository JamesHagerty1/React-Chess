const reach: {[key: string]: Function} = {
  "n": knightReach, 
  "k": kingReach,
  "q": queenReach,
  "r": rookReach,
  "b": bishopReach,
  "p": pawnReach
}


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
    console.log(moves);
    return moves;
}


function legalMoves(r: number, c: number, board: string[][], tiles: string[],
  turn: string): string[] {
  let moves: string[] = [];
  for (let tileId of tiles) {
    const [rMove, cMove] = [Number(tileId.charAt(0)), Number(tileId.charAt(1))];
    let tryBoard = JSON.parse(JSON.stringify(board)); // js deepcopy
    tryBoard = makeMove(r, c, rMove, cMove, tryBoard);
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
  function findKing(turn: string) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c] == `k${turn}`) {
          return [r, c];
        }
      }
    }
    return [-1, -1]
  }
  let [rKing, cKing] = findKing(turn);
  const opponent: string = (turn == "l") ? "d" : "l";
  return attackedTile(rKing, cKing, board, opponent);
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


function onBoard(r: number, c: number): boolean {
  return 0 <= r && r < 8 && 0 <= c && c < 8;
}


function knightReach(r: number, c: number, board: string[][], turn: string): 
  string[] {
  let tiles: string[] = [];
  let candidateMoves = [
    [r - 1, c - 2], [r - 2, c - 1], [r - 2, c + 1], [r - 1, c + 2],
    [r + 1, c - 2], [r + 2, c - 1], [r + 2, c + 1], [r + 1, c + 2]];
  for (let tup of candidateMoves) {
    const [rCan, cCan] = tup;
    if (onBoard(rCan, cCan) && !board[rCan][cCan].endsWith(turn)) {
      tiles.push(`${rCan}${cCan}`);
    }
  }
  return tiles;
}


function kingReach(r: number, c: number, board: string[][], turn: string): 
  string[] {
  let tiles: string[] = [];
  let candidateMoves = [
    [r - 1, c], [r, c + 1], [r + 1, c], [r, c - 1],
    [r - 1, c - 1], [r - 1, c + 1], [r + 1, c + 1], [r + 1, c - 1]];
  for (let tup of candidateMoves) {
    const [rCan, cCan] = tup;
    if (onBoard(rCan, cCan) && !board[rCan][cCan].endsWith(turn)) {
      tiles.push(`${rCan}${cCan}`);
    }
  }

  // CASTLING TBD

  return tiles;
}


// generalizes for rook, bishop, and queen!
function fanOutReach(r: number, c: number, board: string[][], turn: string,
  moveBy: [number, number][]): string[] {
  let tiles: string[] = [];
  let candidateMoves = Array(moveBy.length).fill([r, c]);
  let canContinue = Array(moveBy.length).fill(true);
  while (canContinue.includes(true)) {
    for (let i = 0; i < candidateMoves.length; i++) {
      let [rCan, cCan] = candidateMoves[i];
      let [rMov, cMov] = moveBy[i];
      candidateMoves[i] = [rCan, cCan] = [rCan + rMov, cCan + cMov];
      if (canContinue[i] && onBoard(rCan, cCan) && 
        !board[rCan][cCan].endsWith(turn)) {
        tiles.push(`${rCan}${cCan}`);
      } 
      if (!onBoard(rCan, cCan) || board[rCan][cCan] != "_") {
        canContinue[i] = false;
      }
    }
  }
  return tiles;
}


function queenReach(r: number, c: number, board: string[][], turn: string): 
  string[] {
  const moveBy: [number, number][] = 
    [[-1, 0], [0, 1], [1, 0], [0, -1], [-1, -1], [-1, 1], [1, 1], [1, -1]];
  return fanOutReach(r, c, board, turn, moveBy);
}


function rookReach(r: number, c: number, board: string[][], turn: string): 
  string[] {
  const moveBy: [number, number][] = [[-1, 0], [0, 1], [1, 0], [0, -1]];
  return fanOutReach(r, c, board, turn, moveBy);
}


function bishopReach(r: number, c: number, board: string[][], turn: string): 
  string[] {
  const moveBy: [number, number][] = [[-1, -1], [-1, 1], [1, 1], [1, -1]];
  return fanOutReach(r, c, board, turn, moveBy);
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