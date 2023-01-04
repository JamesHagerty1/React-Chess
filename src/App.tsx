import React, {FC, useState, useRef, useEffect} from "react";
import "./index.css";
import {getMoves} from "./game-logic";


interface BoardProps {
  board: string[][];
  selected: [number, number];
  clickTile: Function;
}
const Board: FC<BoardProps> = (props) => {
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

  return (
    <div>
      <div className="board" ref={boardRef}>
        {props.board.map((row, r) =>
          <div className="board-row" key={r}>
            {row.map((pieceId, c) =>
              <div className="board-row-tile" 
              onClick={() => props.clickTile(r, c)} key={c}>
                <img className="board-row-tile-img" 
                src={require(`./images/${pieceId}.png`)}/>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="board-annotations" 
      style={{"top": `${topOffset}px`, "left": `${leftOffset}px`}}>
        <svg className="svg-container">
        {props.selected[0] != -1 &&
          <circle className="svg-drawing" 
          cx={props.selected[1] * (width / 8) + (width / 16)} 
          cy={props.selected[0] * (width / 8) + (width / 16)} 
          r={width / 16} stroke="dodgerblue" fill="none"
          strokeWidth="3" />
        }
        </svg>
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
  const [moves, setMoves] = useState<{[key: string]: string[]}>(
    getMoves(board, turn));
  const [selected, setSelected] = useState<[number, number]>([-1, -1]);

  function clickTile(r: number, c: number) {
    console.log(r, c);
    // if valid select, select piece -> list possible moves
    // else if selected valid move -> make move
    // else do nothing

    // Select a piece
    if (board[r][c].endsWith(turn)) {
      setSelected([r, c]);
    }
  }

  return (
    <div className="flex-container">
      <Board board={board} selected={selected} clickTile={clickTile}/>
    </div>
  );
}

export default App;