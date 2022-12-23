import React, { FC, useState } from 'react';
import "./index.css";
import { isPropertySignature } from 'typescript';
import { setUncaughtExceptionCaptureCallback } from 'process';

interface TileProps {
  pieceId: string;
  i: number;
  j: number;
  clickTile: Function;
}

const Tile: FC<TileProps> = (props) => {
  const [pieceId, setPieceId] = useState(props.pieceId);

  function handleClick() {
    console.log("handleClick()");
    let res: number = props.clickTile(props.i, props.j);
    console.log(res);

    setPieceId("ZZZ");
  }

  return (
    <button className="tile" onClick={() => handleClick()}>
      {pieceId}
    </button>
  )
}

interface RowProps {
  row: string[];
  i: number; // pass down only
  clickTile: Function; // pass down only
}

const Row: FC<RowProps> = (props) => {
  return (
    <div className="board-row">
      {props.row.map((pieceId, j) => <Tile pieceId={pieceId} i={props.i} j={j} clickTile={props.clickTile}/> )}
    </div>
  )
}

const Board: FC = () => {
  const board = [
    ["rookB", "knightB", "bishopB", "queenB", "kingB", "knightB", "bishopB", "rookB"],
    ["pawnB", "pawnB", "pawnB", "pawnB", "pawnB", "pawnB", "pawnB", "pawnB"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["pawnW", "pawnW", "pawnW", "pawnW", "pawnW", "pawnW", "pawnW", "pawnW"],
    ["rookW", "knightW", "bishopW", "queenW", "kingW", "knightW", "bishopW", "rookW"]
  ];

  function clickTile(i: number, j: number): number {
    console.log(i + "-" + j);
    return 42;
  }

  return (
    <div>
      <h1>Chess</h1>
      <div>
        {board.map((row, i) => <Row row={row} i={i} clickTile={clickTile}/> )}
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
