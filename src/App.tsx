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
  i: number;
  clickTile: Function; 
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
    ["a", "b", "c", "*"],
    ["d", "e", "f", "king-black"]
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
