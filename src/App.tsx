import React, {FC, useState, useRef} from "react";
import "./index.css";
import {getMoves} from "./game-logic";


interface BoardProps {
  board: string[][];
  clickTile: Function;
}
const Board: FC<BoardProps> = (props) => {
  return (
    <div className="board">
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

  function clickTile(r: number, c: number) {
    console.log(r, c);
    // if valid select, select piece -> list possible moves
    // else if selected valid move -> make move
    // else do nothing
  }

  return (
    <div className="flex-container">
      <Board board={board} clickTile={clickTile}/>
    </div>
  );
}

export default App;