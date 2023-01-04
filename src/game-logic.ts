/* App helpers ****************************************************************/


// TS seems to not have built in fn for checking if list contains tuple
export function containsRc(r: number, c: number, tiles: [number, number][]): 
  boolean {
  for (let i in tiles) {
    const [rMove, cMove] = tiles[i];
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


// assert that piece string is always for a piece (2 chars)
export function isPawnPromo(piece: string, r: number): boolean {
  const pawn: boolean = (piece.charAt(0) == "p");
  const shade: string = piece.charAt(1);
  return pawn && ((shade == "l" && r == 0) || (shade == "d" && r == 7));
}


export function allMoves(shade: string, board: string[][],
  lastMove: [string, number, number, number, number]): 
  [{[key: string]: [number, number][]}, {[key: string]: [number, number][]}] {

  console.log("allMoves()");
  console.log(shade);

  const legalMovesDict: {[key: string]: [number, number][]} = {};
  const checkableMovesDict: {[key: string]: [number, number][]} = {};
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (!board[r][c].endsWith(shade)) {
        continue;
      }
      let moves: [number, number][] = [];
      const piece = board[r][c].charAt(0);
      switch (piece) {
        case "k":
          moves = kingMoves(r, c, board, shade);
          break;
        case "p":
          moves = pawnMoves(r, c, board, shade, lastMove);
          break;
        case "r":
          moves = rookMoves(r, c, board, shade);
          break;
        case "b":
          moves = bishopMoves(r, c, board, shade);
          break;
        case "q":
          moves = queenMoves(r, c, board, shade);
          break;
        case "n":
          moves = knightMoves(r, c, board, shade);
          break;
        default:
          moves = [];
      }
      let legalMoves: [number, number][] = [];
      let checkableMoves: [number, number][] = [];
      for (let i in moves) {
        const [rMove, cMove] = moves[i];
        if (checkableMove(r, c, rMove, cMove, board, lastMove)) {
          checkableMoves.push([rMove, cMove]);
        } else {
          legalMoves.push([rMove, cMove]);
        }
      }
      legalMovesDict[`${r}-${c}`] = legalMoves;
      checkableMovesDict[`${r}-${c}`] = checkableMoves;
    }
  }
  return [legalMovesDict, checkableMovesDict];
}


/* File contained helpers *****************************************************/


function checkableMove(r1: number, c1: number, r2: number, c2: number,
  board: string[][], lastMove: [string, number, number, number, number]): 
  boolean {
  const shade: string = (board[r1][c1].endsWith("l")) ? "l" : "d";
  const captureShade: string = (shade == "l") ? "d" : "l";
  const [capture, rcCap]: [boolean, [number, number]] = 
    isCapture(r1, c1, r2, c2, board, lastMove);
  let tryBoard = board.map(item => {return {...item}}); // js deepcopy
  if (capture) {
    const [rCap, cCap] = rcCap;
    tryBoard[rCap][cCap] = "_";
  }
  tryBoard[r2][c2] = board[r1][c1];
  tryBoard[r1][c1] = "_";
  const opponentAccessibleTiles: [number, number][] =
    getAccessibleTiles(captureShade, tryBoard, lastMove);
  const [rKing, cKing] = findKing(shade, tryBoard);
  return containsRc(rKing, cKing, opponentAccessibleTiles);
}


function getAccessibleTiles(shade: string, board: string[][],
  lastMove: [string, number, number, number, number]): [number, number][] {
  let moves: [number, number][] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (!board[r][c].endsWith(shade)) {
        continue;
      }
      const piece = board[r][c].charAt(0);
      switch (piece) {
        case "k":
          moves = moves.concat(kingMoves(r, c, board, shade));
          break;
        case "p":
          moves = moves.concat(pawnMoves(r, c, board, shade, lastMove));
          break;
        case "r":
          moves = moves.concat(rookMoves(r, c, board, shade));
          break;
        case "b":
          moves = moves.concat(bishopMoves(r, c, board, shade));
          break;
        case "q":
          moves = moves.concat(queenMoves(r, c, board, shade));
          break;
        case "n":
          moves = moves.concat(knightMoves(r, c, board, shade));
          break;
      }
    }
  }
  return moves;
} 


function findKing(shade: string, board: string[][]): [number, number] {
  const king = `k${shade}`;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] == king) {
        return [r, c]
      }
    }
  }
  return [-1, -1];
}


// assert knight of shade at board[r][c]
function kingMoves(r: number, c: number, board: string[][], shade: string): 
  [number, number][] {
  let moves: [number, number][] = [];
  let candidateMoves = [
    [r - 1, c], [r, c + 1], [r + 1, c], [r, c - 1],
    [r - 1, c - 1], [r - 1, c + 1], [r + 1, c + 1], [r + 1, c - 1]];
  for (let i in candidateMoves) {
    const [rCan, cCan] = candidateMoves[i];
    if (onBoard(rCan, cCan) && !board[rCan][cCan].endsWith(shade)) {
      moves.push([rCan, cCan]);
    }
  }
  // castling
  // left 2 king right 3 rook when: 
  // left rook and king never moved, (TBD ..., do check logic first)

  return moves;
}


function onBoard(r: number, c: number): boolean {
  return 0 <= r && r < 8 && 0 <= c && c < 8;
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


// assert pawn of shade at board[r][c]
function pawnMoves(r: number, c: number, board: string[][], shade: string,
  lastMove: [string, number, number, number, number]): [number, number][] {
  let moves: [number, number][] = [];
  const captureShade: string = (shade == "l") ? "d" : "l";
  // forward 
  const rF1 = (shade == "l") ? r - 1 : r + 1;
  if (onBoard(rF1, c) && board[rF1][c] == "_") {
    moves.push([rF1, c]);
  }
  const rF2 = (shade == "l") ? r - 2: r + 2;
  if (onBoard(rF2, c) && board[rF1][c] == "_" && board[rF2][c] == "_" &&
    ((shade == "l" && r == 6) || (shade == "d" && r == 1))) {
    moves.push([rF2, c]);
  }
  // conventional diagonal captures
  const [cL, cR] = [c - 1, c + 1];
  if (onBoard(rF1, cL) && board[rF1][cL].length > 1 &&
    board[rF1][cL].charAt(1) == captureShade) {
    moves.push([rF1, cL]);
  }
  if (onBoard(rF1, cR) && board[rF1][cR].length > 1 &&
    board[rF1][cR].charAt(1) == captureShade) {
    moves.push([rF1, cR]);
  }
  // en passant captures
  if (onBoard(rF1, cL) && isEnPassant(rF1, cL, board, captureShade, lastMove)) {
    moves.push([rF1, cL]);
  }
  if (onBoard(rF1, cR) && isEnPassant(rF1, cR, board, captureShade, lastMove)) {
    moves.push([rF1, cR]);
  }
  return moves;
}


// generalizes for rook, bishop, and queen!
function fanOutMoves(r: number, c: number, board: string[][], shade: string,
  moveBy: [number, number][]): [number, number][] {
  let moves: [number, number][] = [];
  let candidateMoves = Array(moveBy.length).fill([r, c]);
  let validDir = Array(moveBy.length).fill(true);
  while (validDir.includes(true)) {
    for (let i = 0; i < candidateMoves.length; i++) {
      let [rCan, cCan] = candidateMoves[i];
      let [rMov, cMov] = moveBy[i];
      candidateMoves[i] = [rCan, cCan] = [rCan + rMov, cCan + cMov];
      if (validDir[i] && onBoard(rCan, cCan) && 
        !board[rCan][cCan].endsWith(shade)) {
        moves.push([rCan, cCan]);
      } 
      if (!onBoard(rCan, cCan) || board[rCan][cCan] != "_") {
        validDir[i] = false;
      }
    }
  }
  return moves;
}

// assert rook of shade at board[r][c]
function rookMoves(r: number, c: number, board: string[][], shade: string): 
  [number, number][] {
  const moveBy: [number, number][] = [[-1, 0], [0, 1], [1, 0], [0, -1]];
  return fanOutMoves(r, c, board, shade, moveBy);
}


// assert bishop of shade at board[r][c]
function bishopMoves(r: number, c: number, board: string[][], shade: string): 
  [number, number][] {
  const moveBy: [number, number][] = [[-1, -1], [-1, 1], [1, 1], [1, -1]];
  return fanOutMoves(r, c, board, shade, moveBy);
}


// assert queen of shade at board[r][c]
function queenMoves(r: number, c: number, board: string[][], shade: string): 
  [number, number][] {
  const moveBy: [number, number][] = 
    [[-1, 0], [0, 1], [1, 0], [0, -1], [-1, -1], [-1, 1], [1, 1], [1, -1]];
  return fanOutMoves(r, c, board, shade, moveBy);
}


// assert knight of shade at board[r][c]
function knightMoves(r: number, c: number, board: string[][], shade: string): 
  [number, number][] {
  let moves: [number, number][] = [];
  let candidateMoves = [
    [r - 1, c - 2], [r - 2, c - 1], [r - 2, c + 1], [r - 1, c + 2],
    [r + 1, c - 2], [r + 2, c - 1], [r + 2, c + 1], [r + 1, c + 2]];
  for (let i in candidateMoves) {
    const [rCan, cCan] = candidateMoves[i];
    if (onBoard(rCan, cCan) && !board[rCan][cCan].endsWith(shade)) {
      moves.push([rCan, cCan]);
    }
  }
  return moves;
}

