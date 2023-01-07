export function getMoves(board: string[][], turn: string, lastMove: string, 
  castleRef: number[]): {[key: string]: string[]} {
    let moves: {[key: string]: string[]} = {};
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c].endsWith(turn)) {
          let tiles: string[] = 
            getReach(r, c, board, turn, lastMove, castleRef, true);
          moves[`${r}${c}`] = 
            legalMoves(r, c, board, tiles, turn, lastMove, castleRef);
        }
      }
    }
    return moves;
}


function getReach(r: number, c: number, board: string[][], turn: string,
  lastMove: string, castleRef: number[],
  considerCastle: boolean): string[] {
  const piece = board[r][c].charAt(0);
  switch (piece) {
    case "n":
      return knightReach(r, c, board, turn);
      break;
    case "k":
      return kingReach(r, c, board, turn, lastMove, castleRef, considerCastle);
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
  turn: string, lastMove: string, castleRef: number[]): string[] {
  let moves: string[] = [];
  for (let tileId of tiles) {
    const [rMove, cMove] = [Number(tileId.charAt(0)), Number(tileId.charAt(1))];
    let tryBoard = JSON.parse(JSON.stringify(board)); // js deepcopy
    tryBoard = makeMove(r, c, rMove, cMove, tryBoard);
    if (!canCheck(tryBoard, turn, lastMove, castleRef)) {
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


export function updateCastleRef(castleRef: number[], piece: string, 
  turn: string, c: number): number[] {
  const [i1, i2] = (turn == "l") ? [0, 1] : [2, 3];
  if (piece == "k") {
    castleRef[i1] = 0;
    castleRef[i2] = 0;
  }
  if (piece == "r" && c == 0) {
    castleRef[i1] = 0;
  }
  if (piece == "r" && c == 7) {
    castleRef[i2] = 0;
  }
  return castleRef;
}


export function parseMove(move: string):
  [string, number, number, number, number, string, number, number, string] {
  const [pieceId, r1, c1, r2, c2, captureId, rCap, cCap, promoId] = 
    move.split(",");
  return [pieceId, Number(r1), Number(c1), Number(r2), Number(c2),
    captureId, Number(rCap), Number(cCap), promoId]
}


function canCheck(board: string[][], turn: string, lastMove: string, 
  castleRef: number[]): boolean {
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
  return attackedTile(
    rKing, cKing, board, opponent, lastMove, castleRef);
}


function attackedTile(rAtt: number, cAtt: number, board: string[][], 
  opponent: string, lastMove: string, castleRef: number[]): boolean {
  let tiles: string[] = []                  
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c].endsWith(opponent)) {
        // considerCastle==false to prevent stack overflow from recursion from
        // opponents looking at each other's potential moves;
        // an opponent king's castling will never attack cur turn's tile
        tiles = 
          getReach(r, c, board, opponent, lastMove, castleRef, false); 
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


function kingReach(r: number, c: number, board: string[][], turn: string, 
  lastMove: string, castleRef: number[],
  considerCastle: boolean): string[] {
  let tiles: string[] = [];
  // Ordinary one-square-away moves
  let candidateMoves = [
    [r - 1, c], [r, c + 1], [r + 1, c], [r, c - 1],
    [r - 1, c - 1], [r - 1, c + 1], [r + 1, c + 1], [r + 1, c - 1]];
  for (let tup of candidateMoves) {
    const [rCan, cCan] = tup;
    if (onBoard(rCan, cCan) && !board[rCan][cCan].endsWith(turn)) {
      tiles.push(`${rCan}${cCan}`);
    }
  }
  // Castling moves
  if (considerCastle) {
    const [canLeft, canRight] = 
      (turn == "l") ? castleRef.slice(0, 2) : castleRef.slice(2, 4);
    const opponent: string = (turn == "l") ? "d" : "l";
    const kingSafe = 
      !attackedTile(r, c, board, opponent, lastMove, castleRef);
    const [leftGap, rightGap] = [
      board[r][1] == "_" && board[r][2] == "_" && board[r][3] == "_",
      board[r][5] == "_" && board[r][6] == "_"];
    const [leftSafe, rightSafe] = [
      (!attackedTile(r, 1, board, opponent, lastMove, castleRef) &&
      !attackedTile(r, 2, board, opponent, lastMove, castleRef) &&
      !attackedTile(r, 3, board, opponent, lastMove, castleRef)), 
      (!attackedTile(r, 5, board, opponent, lastMove, castleRef) &&
      !attackedTile(r, 6, board, opponent, lastMove, castleRef))];
    if (canLeft && kingSafe && leftGap && leftSafe) {
      tiles.push(`${r}${c - 2}`);
    }
    if (canRight && kingSafe && rightGap && rightSafe) {
      tiles.push(`${r}${c + 2}`);
    }
  }
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
  lastMove: string): string[] {
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
  captureShade: string, lastMove: string): 
  boolean {
  const [pieceId, r1, c1, r2, c2, captureId, rCap, cCap, promoId]:
    [string, number, number, number, number, string, number, number, string] = 
    parseMove(lastMove);
  const blankDest: boolean = (board[rDest][cDest].charAt(0) == "_");
  const pawnMovedTwo: boolean = 
    pieceId.charAt(0) == "p" && Math.abs(r1 - r2) == 2;
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