import React, { FC, useState } from 'react';
import "./index.css";


interface TileProps {
  piece: string;
  r: number;
  c: number;
  clickTile: Function;
}

const Tile: FC<TileProps> = (props) => {
  function handleClick() {
    console.log("Tile handleClick");
    props.clickTile(props.r, props.c);

    // NOW! get coords of me

  }

  return (
    <div className="board-tile" onClick={() => handleClick()}>
      {props.piece}
    </div>
  )
}

const Board: FC = () => {
  let startBoard = [
    ["rookB", "knightB", "bishopB", "queenB", "kingB", "knightB", "bishopB", "rookB"],
    ["pawnB", "pawnB", "pawnB", "pawnB", "pawnB", "pawnB", "pawnB", "pawnB"],
    ["_", "_", "_", "_", "_", "_", "_", "_"],
    ["_", "_", "_", "_", "_", "_", "_", "_"],
    ["_", "_", "_", "_", "_", "_", "_", "_"],
    ["_", "_", "_", "_", "_", "_", "_", "_"],
    ["pawnW", "pawnW", "pawnW", "pawnW", "pawnW", "pawnW", "pawnW", "pawnW"],
    ["rookW", "knightW", "bishopW", "queenW", "kingW", "knightW", "bishopW", "rookW"]
  ];
  const [curBoard, setCurBoard] = useState(startBoard);

  function clickTile(i: number, j: number): number {
    console.log(i + "-" + j);
    let newBoard = curBoard.slice();
    newBoard[i][j] = "X";
    newBoard[0][0] = "X";
    setCurBoard(newBoard);
    return -1;
  }

  return (
    <div className="flex-container">
      <div className="board">
        {curBoard.map((row, r) =>
          <div key={r.toString()} className="board-row">
            {curBoard[r].map((pieceId, c) => <Tile key={c.toString()} piece={curBoard[r][c]} r={r} c={c} clickTile={clickTile}/>)}
          </div>
        )}
      </div>
      <div className="svg-layer">
        <svg className="svg-box">
          <line className="svg-line" x1="10" y1="10" x2="400" y2="400" stroke="Coral" strokeWidth="4" strokeLinecap="round"></line>
        </svg>
      </div>
      <div className="move-history">
        <h1>Move History</h1>
      </div>
    </div>
  );
}


function App() {
  return (
    <div>
      <Board />
    </div>
  );
}

export default App;
