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
    props.clickTile(props.r, props.c);
  }

  return (
    <button className="tile" onClick={() => handleClick()}>
      {props.piece}
    </button>
  )
}

const Board: FC = () => {
  let startBoard = [
    ["rookB", "knightB", "bishopB", "queenB", "kingB", "knightB", "bishopB", "rookB"],
    ["pawnB", "pawnB", "pawnB", "pawnB", "pawnB", "pawnB", "pawnB", "pawnB"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
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
    <div>
      <h1>Chess</h1>
      <div>
        {curBoard.map((row, r) =>
          <div key={r.toString()} className="board-row">
            {curBoard[r].map((pieceId, c) => <Tile key={c.toString()} piece={curBoard[r][c]} r={r} c={c} clickTile={clickTile}/>)}
          </div>
        )}
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
