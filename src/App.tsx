import React, { FC, useState } from 'react';
import "./index.css";


interface TileProps {
  board: string[][];
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
      {props.board[props.r][props.c]}
    </button>
  )
}

const Board: FC = () => {
  let board = [
    ["rookB", "knightB", "bishopB", "queenB", "kingB", "knightB", "bishopB", "rookB"],
    ["pawnB", "pawnB", "pawnB", "pawnB", "pawnB", "pawnB", "pawnB", "pawnB"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["pawnW", "pawnW", "pawnW", "pawnW", "pawnW", "pawnW", "pawnW", "pawnW"],
    ["rookW", "knightW", "bishopW", "queenW", "kingW", "knightW", "bishopW", "rookW"]
  ];
  const [curBoard, setCurBoard] = useState(board);
  const [val, setVal] = useState("start");
  console.log("Hi!");

  function clickTile(i: number, j: number): number {
    console.log(i + "-" + j);
    let newBoard = curBoard.slice();
    newBoard[i][j] = "X"
    setCurBoard(newBoard);
    return -1;
  }

  // let row = curBoard[0].map((pieceId, i) => <Tile key={i.toString()} pieceId={pieceId} r={0} c={i} clickTile={clickTile}/> );

  return (
    <div>
      <h1>Chess</h1>
      <div>
        <Tile board={curBoard} r={0} c={0} clickTile={clickTile} />
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
