import React, { FC, useState, useRef, useEffect } from 'react';
import "./index.css";
import { allMoves, containsRc, isCapture, isPawnPromo } from './oldgame-logic';


interface TileProps {
  piece: string;
  r: number;
  c: number;
  dim: number | undefined;
  clickTile: Function;
}

const Tile: FC<TileProps> = (props) => {
  function handleClick() {
    props.clickTile(props.r, props.c);
  }

  const tileColor = ((props.r + props.c) % 2 == 0) ? "white" : "lavender";

  return (
    <div className="board-tile" onClick={() => handleClick()}
    style={{"backgroundColor": tileColor}}>
      <img className="piece-img" src={require(`./images/${props.piece}.png`)} />
    </div>
  );
}


interface BoardProps {
  curBoard: string[][];
  tileDim: number;
  newDims: Function;
  clickTile: Function;
}

const Board: FC<BoardProps> = (props) => {
  const boardRef = useRef<HTMLDivElement>(null);

  // Tell parent component about updated HTML dims
  const onResize = () => {
    props.newDims(boardRef.current?.offsetTop, boardRef.current?.offsetLeft,
      boardRef.current?.offsetWidth);
  }

  useEffect(() => {
    onResize(); // Init parent knowledge of board dims
    window.addEventListener("resize", onResize);
  }, []);

  return (
    <div ref={boardRef} className="board">
      {props.curBoard.map((row, r) =>
        <div key={r.toString()} className="board-row">
          {props.curBoard[r].map((pieceId, c) => 
            <Tile key={c.toString()} piece={props.curBoard[r][c]} r={r} c={c} 
            dim={props.tileDim} clickTile={props.clickTile}/>
          )}
        </div>
      )}
    </div>
  );
}


interface SVGLayerProps {
  dims: [number, number, number]; // top, left, width
  curSelect: [number, number];
  curMoves: [number, number][];
  lastMove: [string, number, number, number, number]; // prev r and c, new r and c
  pawnPromo: boolean;
  clickPromo: Function;
}

const SVGLayer: FC<SVGLayerProps> = (props) => {                      // TBD rename SVGLayer, now it isn't just SVG
  const [top, left, width] = props.dims;
  const [selR, selC] = props.curSelect;
  const [piece, oldR, oldC, newR, newC] = props.lastMove;
  const [tileDim, halfTileDim] = [width / 8, width / 16];

  // pawn promotion box
  const shade = piece.charAt(1);
  const promos: string[] = 
    (shade == "l") ? ["ql", "rl", "bl", "nl"] : ["nd", "bd", "rd", "qd"];
  let promosStyle = (shade == "l") ? {"top": "0px", "left": (tileDim * newC)} : 
    {"bottom": "0px", "left": (tileDim * newC)}; 

  function handleClick(piece: string) {
    props.clickPromo(piece);
  }

  // coords for selected piece circle
  const [cx, cy] = [halfTileDim + selC * tileDim, halfTileDim + selR * tileDim];

  // coords for line showing latest move
  const [x1, x2] = [halfTileDim + oldC * tileDim, halfTileDim + newC * tileDim];
  const [y1, y2] = [halfTileDim + oldR * tileDim, halfTileDim + newR * tileDim];

  return (
    <div className="svg-layer" 
    style={{"top": `${top}px`, "left": `${left}px`}}>
      {props.pawnPromo &&
        <div className="pawn-promotion" style={promosStyle}>
          {promos.map((piece, i) =>
            <img key={i} className="promo-img" 
            onClick={() => handleClick(piece)}
            src={require(`./images/${piece}.png`)} />
          )}
        </div>
      }
      <svg className="svg-box">
        {oldR != -1 &&
          <line className="svg-drawing" x1={x1} y1={y1} x2={x2} y2={y2} 
          stroke="lightskyblue" strokeWidth="4" strokeLinecap="round"></line>
        }
        {selR != -1 &&
          <circle className="svg-drawing" cx={cx} cy={cy} 
          r={halfTileDim * (9 / 10)} stroke="dodgerblue" fill="none"
          strokeWidth="3" />
        }
        {props.curMoves.map((rc, i) => 
          <circle key={i} className="svg-drawing" 
          cx={halfTileDim + rc[1] * tileDim} cy={halfTileDim + rc[0] * tileDim} 
          r={tileDim / 7} fill="dodgerblue" />
        )}
      </svg>
    </div>
  );
}


interface GraveyardProps {
  pieces: string[];
}

const Graveyard: FC<GraveyardProps> = (props) => {
  return (
    <div className="graveyard">
      {props.pieces.map((pieceId, i) => 
        <img key={i} className="graveyard-piece-img" 
        src={require(`./images/${pieceId}.png`)} />
      )}
    </div>
  );
}


interface MoveHistoryProps {
  history: [string, number, number, number, number][];
}

const MoveHistory: FC<MoveHistoryProps> = (props) => {
  return (
    <div>
      <h1>Move History</h1>
      {props.history.map((move, i) =>
        <p key={i}>
          {`${move[0]} (${move.slice(1, 3)}) -> (${move.slice(3, 5)})`}
        </p>
      )}
    </div>
  );
}


function App() {
  // State for game logic
  let startBoard: string[][] = [
    ["rd", "nd", "bd", "qd", "kd", "bd", "nd", "rd"],
    ["pd", "pd", "pd", "pd", "pd", "pd", "pd", "pd"],
    ["_", "_", "_", "_", "_", "_", "_", "_"],    // even empty square has its own image, to avoid alignment issue when elements in a row are diff sizes
    ["_", "_", "_", "_", "_", "_", "_", "_"],
    ["_", "_", "_", "_", "_", "_", "_", "_"],
    ["_", "_", "_", "_", "_", "_", "_", "_"],
    ["pl", "pl", "pl", "pl", "pl", "pl", "pl", "pl"],
    ["rl", "nl", "bl", "ql", "kl", "bl", "nl", "rl"]
  ];
  let graveyard: string[] = [];

  const [curMoves, setCurMoves] = useState<[number, number][]>([]);
  const [curBoard, setCurBoard] = useState<string[][]>(startBoard);
  const [darkGraveyard, setDarkGraveyard] = useState<string[]>(graveyard);
  const [lightGraveyard, setLightGraveyard] = useState<string[]>(graveyard);
  const [curSelect, setCurSelect] = useState<[number, number]>([-1, -1]);
  const [moveHistory, setMoveHistory] = 
    useState<[string, number, number, number, number][]>([]);
  const [pawnPromo, setPawnPromo] = useState<boolean>(false);
  // castleRef true means no move yet from: 
  // [rd (0, 0), kd (0, 4), rd (0, 7), rl (7, 0), kl, (7, 4), rl, (7, 7)]
  const [castleRef, setCastleRef] = useState<boolean[]>(
    [true, true, true, true, true, true]);
  const [turn, setTurn] = useState<string>("l");
  const [legalMoves, checkableMoves]: 
    [{[key: string]: [number, number][]}, {[key: string]: [number, number][]}]
    = allMoves("l", startBoard, ["*l", -1, -1, -1, -1], castleRef);
  const [curLegalMoves, setCurLegalMoves] =
    useState<{[key: string]: [number, number][]}>(legalMoves);  
  const [curCheckableMoves, setCurCheckableMoves] =
    useState<{[key: string]: [number, number][]}>(checkableMoves);

  // Where UI and game logic meet
  function clickTile(r: number, c: number): number {
    if (pawnPromo) {
      return 0;
    }

    // Make a move
    if (containsRc(r, c, curMoves)) {
      const [rSel, cSel] = curSelect;

      let newBoard = curBoard.slice();
      const [capture, rcCap]: [boolean, [number, number]] = 
        isCapture(rSel, cSel, r, c, curBoard, 
          moveHistory[moveHistory.length - 1]);
      let newMoveHistory = moveHistory.slice();

      // redraw board
      if (capture) {
        let newGraveyard = 
          (turn == "l") ? darkGraveyard.slice() : lightGraveyard.slice();
        const [rCap, cCap] = rcCap;
        newGraveyard.push(curBoard[rCap][cCap]);
        (turn == "l") ? 
          setDarkGraveyard(newGraveyard) : setLightGraveyard(newGraveyard);
        newBoard[rCap][cCap] = "_";
      }
      newBoard[r][c] = newBoard[rSel][cSel];
      newBoard[rSel][cSel] = "_";
      newBoard = castleRook(r, c, Math.abs(cSel - c), newBoard); // TBD special castling log
      setCurBoard(newBoard);

      let newMove: [string, number, number, number, number] = 
        [curBoard[r][c], rSel, cSel, r, c];
      newMoveHistory.push(newMove);
      setMoveHistory(newMoveHistory);

      setCurSelect([-1, -1]);
      setCurMoves([]);

      // Mark first move made to invalidate castling 
      invalidateCastle(rSel, cSel);

      // PAWN PROMOTION logic here!
      if (isPawnPromo(curBoard[r][c], r)) {
        setPawnPromo(true);
        return 0;
      }

      changeTurn(newMove);
      return 0;
    }

    // Select a piece
    let tileKey: string = `${r}-${c}`;
    if (curBoard[r][c].endsWith(turn)) {
      setCurSelect([r, c]);
      setCurMoves(curLegalMoves[tileKey]);
    }
    return 0;
  }

  // move the rook after the king castles
  function castleRook(rKing: number, cKing: number, movedBy: number,
    newBoard: string[][]) {
    const king: boolean = (newBoard[rKing][cKing].charAt(0) == "k");
    if (king && (movedBy == 2)) {
      switch(`${rKing}-${cKing}`) {
        case("7-2"):
          newBoard[7][0] = "_";
          newBoard[7][3] = "rl";
          break;
        case("7-6"):
          newBoard[7][7] = "_";
          newBoard[7][5] = "rl";
          break;
        case("0-2"):
          newBoard[0][0] = "_";
          newBoard[0][3] = "rd";
          break;
        case("0-6"):
          newBoard[0][7] = "_";
          newBoard[0][5] = "rd";
          break;
      }
    }
    return newBoard;
  }

  function invalidateCastle(r: number, c: number) {
    let newCastleRef = castleRef.slice();
    switch(`${r}-${c}`) {
      case "0-0":
        newCastleRef[0] = false;
        break;
      case "0-4":
        newCastleRef[1] = false;
        break;
      case "0-7":
        newCastleRef[2] = false;
        break;
      case "7-0":
        newCastleRef[3] = false;
        break;
      case "7-4":
        newCastleRef[4] = false;
        break;
      case "7-7":
        newCastleRef[5] = false;
        break;
    }
    setCastleRef(newCastleRef);
  }

  // assert only called when last move was a pawn reaching other end
  function clickPromo(promoPiece: string) {
    const [pawn, r1, c1, r2, c2]: [string, number, number, number, number] = 
      moveHistory[moveHistory.length-1];
    
    let newBoard = curBoard.slice();
    newBoard[r2][c2] = promoPiece;
    setCurBoard(newBoard);

    // TBD -- once log format decided, log the promo
    changeTurn([pawn, r1, c1, r2, c2]);
    setPawnPromo(false);
    return 0;
  }

  function changeTurn(lastMove: [string, number, number, number, number]) {
    const newTurn = (turn == "l") ? "d" : "l";
    setTurn(newTurn);
    const [legalMoves, checkableMoves]: 
      [{[key: string]: [number, number][]}, {[key: string]: [number, number][]}]
      = allMoves(newTurn, curBoard, lastMove, castleRef);
    setCurLegalMoves(legalMoves);
    setCurCheckableMoves(checkableMoves);
  }

  // State for SVG drawing logic
  const [dims, setDims] = 
    useState<[number, number, number]>([-1, -1, -1]);

  const newDims = (newTop: number, newLeft: number, newWidth: number) => {
   setDims([newTop, newLeft, newWidth]);
  };

  //
  return (
    <div className="flex-container">
      <div>
        <Graveyard pieces={lightGraveyard} />
        <Board curBoard={curBoard} tileDim={dims[2] / 8} newDims={newDims} 
        clickTile={clickTile} />
        <SVGLayer dims={dims} curSelect={curSelect} curMoves={curMoves} 
        lastMove={(moveHistory.length > 0) ? 
          moveHistory[moveHistory.length - 1] : ["*l", -1, -1, -1, -1]} 
        pawnPromo={pawnPromo} clickPromo={clickPromo}/>
        <Graveyard pieces={darkGraveyard} />
        
      </div>
      <MoveHistory history={moveHistory} />
    </div>
  );
}

export default App;
