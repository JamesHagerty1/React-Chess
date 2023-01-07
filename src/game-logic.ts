export function getMoves(board: string[][], turn: string,
  lastMove: [string, number, number, number, number]): 
  {[key: string]: string[]} {
    let moves: {[key: string]: string[]} = {};
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c].endsWith(turn)) {
          let tiles: string[] = getReach(r, c, board, turn, lastMove);
          moves[`${r}${c}`] = legalMoves(r, c, board, tiles, turn, lastMove);
        }
      }
    }
    return moves;
}


function getReach(r: number, c: number, board: string[][], turn: string,
  lastMove: [string, number, number, number, number]):
  string[] {
  const piece = board[r][c].charAt(0);
  switch (piece) {
    case "n":
      return knightReach(r, c, board, turn);
      break;
    case "k":
      return kingReach(r, c, board, turn);
      break;
    case "q":
      return queenReach(r, c, board, turn);
      break;
    case "r":
      return rookReach(r, c, board, turn);
      break;
    case "b":
      return bishopReach(r, c, board, turn);
      break;
    case "p":
      return pawnReach(r, c, board, turn, lastMove);
      break;
    default:
      return [];
  }
}


function legalMoves(r: number, c: number, board: string[][], tiles: string[],
  turn: string, lastMove: [string, number, number, number, number]): string[] {
  let moves: string[] = [];
  for (let tileId of tiles) {
    const [rMove, cMove] = [Number(tileId.charAt(0)), Number(tileId.charAt(1))];
    let tryBoard = JSON.parse(JSON.stringify(board)); // js deepcopy
    tryBoard = makeMove(r, c, rMove, cMove, tryBoard);
    if (!canCheck(tryBoard, turn, lastMove)) {
      moves.push(`${rMove}${cMove}`);
    }
  }
  return moves;
}


export function makeMove(r1: number, c1: number, r2: number, c2: number, 
  board: string[][]): string[][] {
  board[r2][c2] = board[r1][c1];
  board[r1][c1] = "_";
  return board;
}


function canCheck(board: string[][], turn: string, 
  lastMove: [string, number, number, number, number]) {
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
  return attackedTile(rKing, cKing, board, opponent, lastMove);
}


function attackedTile(rAtt: number, cAtt: number, board: string[][], 
  opponent: string, lastMove: [string, number, number, number, number]): 
  boolean {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c].endsWith(opponent)) {
        let tiles: string[] = getReach(r, c, board, opponent, lastMove);
        if (tiles.includes(`${rAtt}${cAtt}`)) {
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


function pawnReach(r: number, c: number, board: string[][], turn: string,
  lastMove: [string, number, number, number, number]): string[] {
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
  // en passant diagonal captures
  if (onBoard(rF1, cL) && isEnPassant(rF1, cL, board, opponent, lastMove)) {
    tiles.push(`${rF1}${cL}`);
  }
  if (onBoard(rF1, cR) && isEnPassant(rF1, cR, board, opponent, lastMove)) {
    tiles.push(`${rF1}${cR}`);
  }
  return tiles;
}


function isEnPassant(rDest: number, cDest: number, board: string[][], 
  captureShade: string, lastMove: [string, number, number, number, number]): 
  boolean {
  const [piece, r1, c1, r2, c2] = lastMove;
  const blankDest: boolean = (board[rDest][cDest].charAt(0) == "_");
  const pawnMovedTwo: boolean = 
    piece.charAt(0) == "p" && Math.abs(r1 - r2) == 2;
  const rBehind: number = (captureShade == "l") ? rDest - 1 : rDest + 1;
  const pawnBehind: boolean = (rBehind == r2 && cDest == c2);
  return blankDest && pawnMovedTwo && pawnBehind;
}


// assert sees board before (potentially capturing) piece makes move
export function getCapture(r1: number, c1: number, r2: number, c2: number,
  board: string[][], turn: string): [number, number] {
  const opponent: string = (turn == "l") ? "d" : "l";
  if (board[r2][c2].endsWith(opponent)) { // on top of piece capture
    return [r2, c2];
  }
  if (board[r1][c1].charAt(0) == "p" && c1 != c2) { // pawn en passant capture
    return (turn == "l") ? [r2 + 1, c2] : [r2 - 1, c2];
  }
  return [-1, -1]; // nothing captured
}