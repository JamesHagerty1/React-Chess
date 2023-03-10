import React, {FC, useState, useRef, useEffect} from "react";
import "./index.css";
import {getMoves, makeMove, getCapture, updateCastleRef, parseMove, canMove, 
  canCheck, botMovesReady, botMove, botPromoId} from "./game-logic";


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

  // General references
  const [pieceId, r1, c1, r2, c2, captureId, rCap, cCap, promoId]:
    [string, number, number, number, number, string, number, number, string] = 
    parseMove(props.lastMove);

  // Reference for a pawn promotion box
  const promos: string[] = 
    (pieceId.endsWith("l")) ? 
    ["ql", "rl", "bl", "nl"] : ["nd", "bd", "rd", "qd"];
  let promoStyle = (pieceId.endsWith("l")) ? 
    {"top": "0px", "left": ((width / 8) * c2)} : 
    {"bottom": "0px", "left": ((width / 8) * c2)}; 

  // References for move history line
  const [x1, y1, x2, y2] = [
    ((width / 16) + c1 * (width / 8)),
    ((width / 16) + r1 * (width / 8)),
    ((width / 16) + c2 * (width / 8)),
    ((width / 16) + r2 * (width / 8)),
  ];

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
          {(pieceId !== "*l") &&
            <line className="svg-drawing" x1={x1} y1={y1} x2={x2} y2={y2} 
            stroke="plum" strokeWidth="4" strokeLinecap="round"></line>
          }
          {(props.selected[0] != -1) &&
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
          {["8", "7", "6", "5", "4", "3", "2", "1"].map((tileAnn, i) => 
            <text x="0" y={(width / 50) + i * (width / 8)} 
            fontSize={width / 50} key={i} fontFamily={"arial"}>
              {tileAnn}
            </text>
          )}
          {["a", "b", "c", "d", "e", "f", "g", "h"].map((tileAnn, i) =>
            <text x={(width / 1000) + (width / 8) * i} 
            y={width - (width / 200)} fontSize={width / 45} 
            fontFamily={"arial"} key={i}>
              {tileAnn}
            </text>
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
        <img className="capture-img" src={require(`./images/${pieceId}.png`)} 
        key={i}/>
      )}
    </div>
  );
}



interface MoveInfoProps {
  move: string;
  num: number;
}
const MoveInfo: FC<MoveInfoProps> = (props) => {
  const [pieceId, r1, c1, r2, c2, captureId, rCap, cCap, promoId] = 
    parseMove(props.move);
  const ref = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const castled = pieceId.charAt(0) == "k" && Math.abs(c1 - c2) == 2;
  const moveInfoStyle = pieceId.endsWith("l") ? 
    {"backgroundColor": "whitesmoke"} : {"backgroundColor": "white"};

  return (
    <div style={moveInfoStyle}>
      <div className="move-info">
        <img src={require(`./images/${pieceId}.png`)}/>
        <p>{`${ref[c1]}${8 - r1} ??? ${ref[c2]}${8 - r2}`}</p>
        {captureId != "*d" &&
          <img src={require(`./images/${captureId}.png`)}/>
        }
        {captureId != "*d" &&
          <p>captured</p>
        }
        {promoId != "*l" &&
          <img src={require(`./images/${promoId}.png`)}/>
        }
        {promoId != "*l" &&
          <p>promotion</p>
        }
        {castled &&
          <img src={require(`./images/r${pieceId.charAt(1)}.png`)}/>
        }
        {castled &&
          <p>
            {(c1 < c2) ? `${8 - r1}h ??? ${8 - r1}f` : `${8 - r1}a ??? ${8 - r1}d`}
          </p>
        }
      </div>
    </div>
  );
}



interface GameDescriptionProps {
  moveHistory: string[];
  gameStatus: string;
}
const GameDescription : FC<GameDescriptionProps> = (props) => {
  const moveHistoryRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom as move history updates
  useEffect(() => {
    moveHistoryRef.current?.scrollTo(0, moveHistoryRef.current?.scrollHeight);
  })

  return (
    <div className="game-description">
      <div className="move-history" ref={moveHistoryRef}>
        {props.moveHistory.map((move, i) => 
          <MoveInfo move={move} num={i + 1} key={i}/>
        )}
        <p className="move-history-status">{props.gameStatus}</p>
      </div>
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
  const [gameStatus, setGameStatus] = useState<string>("Ongoing game");
  // sound effect
  const audio0 = new Audio(require("./audio/place-piece.mp3"));
  // Toggle me! (turn BOT false while testing)
  const BOT = true;

  function sleep(ms: number) {
    var s = new Date().getTime();
    while(new Date().getTime() < s + ms){}
  }

  // useEffect [moves] used for BOT player exclusively
  useEffect(() => {
    // Ensure bot only makes a move when enabled AND necessary state up to date
    if (!BOT || !botMovesReady(board, moves) || gameOver()) {
      return;
    }
    const [r1, c1, r2, c2]: [number, number, number, number] = botMove(moves);
    // Bot sleeps before selecting and moving to make it feel like a player
    setTimeout(() => {
      setSelected([r1, c1]); // annotation sake only
      setSelectedMoves(moves[`${r1}${c1}`]); // annotation sake only
    }, 200);
    setTimeout(() => {
      moveMain(r1, c1, r2, c2);
    }, 600);
  }, [moves])


  function clickTile(r: number, c: number) {
    if ((BOT && turn === "d") || pawnPromo || gameOver()) {
      return;
    }
    // Select a piece
    if (board[r][c].endsWith(turn)) { 
      setSelected([r, c]);
      setSelectedMoves(moves[`${r}${c}`]);
    // Make a move
    } else if (selectedMoves.includes(`${r}${c}`)) { 
      const [rSel, cSel] = [selected[0], selected[1]];
      moveMain(rSel, cSel, r, c);
    }
  }


  // can be used by player AND bot
  function moveMain(r1: number, c1: number, r2: number, c2: number){ 
    setSelected([-1, -1]);
    const pieceId = board[r1][c1];
    let newBoard: string[][] = board.slice();
    const [rCap, cCap]: [number, number] = 
      getCapture(r1, c1, r2, c2, board, turn);
    // capture
    let captureId = "*d";
    if (rCap != -1) {
      let captures = (turn == "l") ? dCaptures.slice() : lCaptures.slice();
      captures.push(board[rCap][cCap]);
      captureId = board[rCap][cCap]
      let _ = (turn == "l") ? setDCaptures(captures) : setLCaptures(captures);
      newBoard[rCap][cCap] = "_";
    }       
    newBoard = makeMove(r1, c1, r2, c2, newBoard);
    const newCastleRef = castleRef.slice();
    // move rook when king castles
    if (newBoard[r2][c2].charAt(0) == "k" && Math.abs(c2 - c1) == 2) { 
      const [c1Rook, c2Rook] = (c2 < c1) ? [0, 3] : [7, 5];
      newBoard[r2][c2Rook] = newBoard[r2][c1Rook];
      newBoard[r2][c1Rook] = "_";
    }
    setBoard(newBoard);
    let newMoveHistory = moveHistory.slice();
    newMoveHistory.push(
      `${pieceId},${r1},${c1},${r2},${c2},${captureId},${rCap},${cCap},*l`);
    setMoveHistory(newMoveHistory);
    setCastleRef(updateCastleRef(
      castleRef.slice(), newBoard[r2][c2].charAt(0), turn, c1));
    setSelectedMoves([]);
    audio0.play();

    // Lock piece selection and moves for pawn promotion OR change turn
    // (though bot can complete pawn promotion here)
    const reachedEnd = (turn == "l") ? (r2 == 0) : (r2 == 7); 
    if (newBoard[r2][c2].charAt(0) == "p" && reachedEnd) {
      setPawnPromo(true) // Lock player from clickTile until pawn promotion
      if (BOT && turn == "d") {
        clickPromo(botPromoId(), r2, c2); // Bot pawn promotion
      }
      return;
    }
    const newTurn = (turn == "l") ? "d" : "l";
    setTurn(newTurn);
    setMoves(getMoves(newBoard, newTurn, 
      newMoveHistory[newMoveHistory.length - 1], newCastleRef));
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
    if (noMoves && !check) {
      setGameStatus("Stalemate!");
    }
    if (noMoves && check) {
      setGameStatus("Checkmate!");
    }
    return noMoves;
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
      <GameDescription moveHistory={moveHistory.slice(1, moveHistory.length)} 
      gameStatus={gameStatus}/>
    </div>
  );
}

export default App;