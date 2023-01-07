import React, {FC, useState, useRef, useEffect} from "react";
import "./index.css";
import {getMoves, makeMove, getCapture, updateCastleRef, parseMove, canMove, 
  canCheck, isDeadPosition} from "./game-logic";


interface BoardProps {
  board: string[][];
  selected: [number, number];
  selectedMoves: string[];
  clickTile: Function;
  pawnPromo: boolean;
  lastMove: string;
  clickPromo: Function;
}
const Board: FC<BoardProps> = (props) => {
  // Board dimension tracking, useful reference for board annotations
  const [leftOffset, setLeftOffset] = useState<number>(-1);
  const [topOffset, setTopOffset] = useState<number>(-1);
  const [width, setWidth] = useState<number>(-1);
  const boardRef = useRef<HTMLDivElement>(null);
  const onResize = () => {
    setLeftOffset((boardRef.current?.offsetLeft != undefined) ? 
      boardRef.current?.offsetLeft : -1);
    setTopOffset((boardRef.current?.offsetTop != undefined) ? 
      boardRef.current?.offsetTop : -1);
    setWidth((boardRef.current?.offsetWidth != undefined) ? 
      boardRef.current?.offsetWidth : -1);
  }
  useEffect(() => {
    onResize(); 
    window.addEventListener("resize", onResize);
  }, []);

  // Reference for a pawn promotion box
  const [pieceId, r1, c1, r2, c2, captureId, rCap, cCap, promoId]:
    [string, number, number, number, number, string, number, number, string] = 
    parseMove(props.lastMove);
  const promos: string[] = 
    (pieceId.endsWith("l")) ? 
    ["ql", "rl", "bl", "nl"] : ["nd", "bd", "rd", "qd"];
  let promoStyle = (pieceId.endsWith("l")) ? 
    {"top": "0px", "left": ((width / 8) * c2)} : 
    {"bottom": "0px", "left": ((width / 8) * c2)}; 

  return (
    <div>
      <div className="board" ref={boardRef}>
        {props.board.map((row, r) =>
          <div className="board-row" key={r}>
            {row.map((pieceId, c) =>
              <div className="board-row-tile" 
              onClick={() => props.clickTile(r, c)} key={c}
              style={((r + c) % 2 == 0) ? 
              {"backgroundColor" : "white"} : {"backgroundColor" : "lavender"}}>
                <img className="board-row-tile-img" 
                src={require(`./images/${pieceId}.png`)}/>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="board-annotations" 
      style={{"top": `${topOffset}px`, "left": `${leftOffset}px`}}>
        {props.pawnPromo &&
          <div className="pawn-promotion" style={promoStyle}>
            {promos.map((pieceId, i) =>
              <img className="pawn-promotion-img" 
              onClick={() => props.clickPromo(pieceId, r2, c2)}
              src={require(`./images/${pieceId}.png`)} key={i}/>)}
          </div>
        }
        <svg className="svg-container">
          {props.selected[0] != -1 &&
            <circle className="svg-drawing" 
            cx={props.selected[1] * (width / 8) + (width / 16)} 
            cy={props.selected[0] * (width / 8) + (width / 16)} 
            r={width / 16} stroke="dodgerblue" fill="none"
            strokeWidth="3" />
          }
          {props.selectedMoves.map((tileId, i) =>
            <circle key={i} className="svg-drawing" 
            cx={Number(tileId.charAt(1)) * (width / 8) + (width / 16)} 
            cy={Number(tileId.charAt(0)) * (width / 8) + (width / 16)} 
            r={width / 64} fill="dodgerblue" />
          )}
        </svg>
      </div>
    </div>
  );
}


interface CapturesProps {
  pieceIds: string[];
}
const Captures: FC<CapturesProps> = (props) => {
  return (
    <div className="captures">
      {props.pieceIds.map((pieceId, i) => 
        <img className="capture-img" 
        src={require(`./images/${pieceId}.png`)} key={i}/>
      )}
    </div>
  );
}


function App() {
  const [board, setBoard] = useState<string[][]>([
    ["rd", "nd", "bd", "qd", "kd", "bd", "nd", "rd"],
    ["pd", "pd", "pd", "pd", "pd", "pd", "pd", "pd"],
    ["_", "_", "_", "_", "_", "_", "_", "_"],    
    ["_", "_", "_", "_", "_", "_", "_", "_"],
    ["_", "_", "_", "_", "_", "_", "_", "_"],
    ["_", "_", "_", "_", "_", "_", "_", "_"],
    ["pl", "pl", "pl", "pl", "pl", "pl", "pl", "pl"],
    ["rl", "nl", "bl", "ql", "kl", "bl", "nl", "rl"]]);
  const [turn, setTurn] = useState<string>("l");
  // "move pieceId, r1, c1, r2, c2, captured pieceId, rCap, cCap, promo pieceId"
  const [moveHistory, setMoveHistory] = 
    useState<string[]>(["*l,-1,-1,-1,-1,*d,-1,-1,*l"]);
  // can castle for: [rl, rl, rd, rd] (set to 0 once invalid to castle)
  const [castleRef, setCastleRef] = useState<number[]>([1, 1, 1, 1]);  
  const [moves, setMoves] = useState<{[key: string]: string[]}>(
    getMoves(board, turn, moveHistory[moveHistory.length - 1], castleRef));
  const [selected, setSelected] = useState<[number, number]>([-1, -1]);
  const [selectedMoves, setSelectedMoves] = useState<string[]>([]);
  const [dCaptures, setDCaptures] = useState<string[]>([]);
  const [lCaptures, setLCaptures] = useState<string[]>([]);
  const [pawnPromo, setPawnPromo] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("Ongoing game");
  
  function clickTile(r: number, c: number) {
    if (pawnPromo || gameOver()) {
      return;
    }

    // Select a piece
    if (board[r][c].endsWith(turn)) { 
      setSelected([r, c]);
      setSelectedMoves(moves[`${r}${c}`]);

    // Make a move
    } else if (selectedMoves.includes(`${r}${c}`)) { 
      const [rSel, cSel] = [selected[0], selected[1]];
      const pieceId = board[rSel][cSel];
      let captureId = "*d";
      let newBoard: string[][] = board.slice();
      const [rCap, cCap]: [number, number] = 
        getCapture(rSel, cSel, r, c, board, turn);
      // capture
      if (rCap != -1) {
        let captures = (turn == "l") ? dCaptures.slice() : lCaptures.slice();
        captures.push(board[rCap][cCap]);
        captureId = board[rCap][cCap]
        let _ = (turn == "l") ? setDCaptures(captures) : setLCaptures(captures);
        newBoard[rCap][cCap] = "_";
      }       
      newBoard = makeMove(rSel, cSel, r, c, newBoard);
      const newCastleRef = castleRef.slice();
      // move rook when king castles
      if (newBoard[r][c].charAt(0) == "k" && Math.abs(c - cSel) == 2) { 
        const [c1Rook, c2Rook] = (c < cSel) ? [0, 3] : [7, 5];
        newBoard[r][c2Rook] = newBoard[r][c1Rook];
        newBoard[r][c1Rook] = "_";
      }
      setBoard(newBoard);
      let newMoveHistory = moveHistory.slice();
      newMoveHistory.push(
        `${pieceId},${rSel},${cSel},${r},${c},${captureId},${rCap},${cCap},*d`);
      setMoveHistory(newMoveHistory);
      setCastleRef(updateCastleRef(
        castleRef.slice(), newBoard[r][c].charAt(0), turn, cSel));
      setSelected([-1, -1]);
      setSelectedMoves([]);
      
      // Lock piece selection and moves for pawn promotion
      const reachedEnd = (turn == "l") ? (r == 0) : (r == 7); 
      if (newBoard[r][c].charAt(0) == "p" && reachedEnd) {
        setPawnPromo(true);
        return;
      }
      // OR transition to next turn
      const newTurn = (turn == "l") ? "d" : "l";
      setTurn(newTurn);
      setMoves(getMoves(newBoard, newTurn, 
        newMoveHistory[newMoveHistory.length - 1], newCastleRef));
    }
  }

  function clickPromo(promoId: string, r: number, c: number) {
    let newBoard = board.slice();
    newBoard[r][c] = promoId;
    setPawnPromo(false);
    const newTurn = (turn == "l") ? "d" : "l";
    setTurn(newTurn);
    // Update last move to mention the promotion
    let lastMoveArr: string[] = moveHistory[moveHistory.length - 1].split(",");
    lastMoveArr[lastMoveArr.length - 1] = promoId;
    let lastMove = lastMoveArr.toString();
    let newMoveHistory = moveHistory.slice();
    newMoveHistory[newMoveHistory.length - 1] = lastMove;
    setMoveHistory(newMoveHistory);
    setMoves(getMoves(newBoard, newTurn, lastMove, castleRef));
  }

  function gameOver(): boolean {
    let noMoves = !canMove(moves);
    let check = 
      canCheck(board, turn, moveHistory[moveHistory.length - 1], castleRef);
    let deadPosition = isDeadPosition(board);
    if (noMoves && !check) {
      setStatus("Stalemate!");
    }
    if (noMoves && check) {
      setStatus("Checkmate!");
    }
    if (deadPosition) {
      setStatus("Draw! Dead position.");
    }
    return noMoves || deadPosition;
  }

  return (
    <div className="flex-container">
      <div>
        <Captures pieceIds={lCaptures}/>
        <Board board={board} selected={selected} selectedMoves={selectedMoves} 
        clickTile={clickTile} pawnPromo={pawnPromo} 
        lastMove={moveHistory[moveHistory.length - 1]} clickPromo={clickPromo}/>
        <Captures pieceIds={dCaptures}/>
      </div>
      <div>
        {moveHistory.map((move, i) => <div key={i}>{move}</div>)}
        <p>{status}</p>
      </div>
    </div>
  );
}

export default App;