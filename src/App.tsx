import React, { FC, useState } from 'react';
import "./index.css";


interface TileProps {
  pieceId: string;
  i: number;
  j: number;
}

const Tile: FC<TileProps> = (props) => {
  return (
    <button className="tile">
      {props.pieceId}
    </button>
  )
}

interface RowProps {
  row: string[];
  i: number;
}

const Row: FC<RowProps> = (props) => {
  return (
    <div className="board-row">
      <tr>
        {props.row.map((pieceId, j) => <Tile pieceId={pieceId} i={props.i} j={j}/> )}
      </tr>
    </div>
  )
}

const Board: FC = () => {
  let startBoard = [
    ["a", "b", "c", "*"],
    ["d", "e", "f", "*"]
  ];
  const [curBoard, setCurBoard] = React.useState(startBoard);

  return (
    <div>
      <h1>Chess</h1>
      <div>
        {curBoard.map((row, i) => <Row row={row} i={i}/> )}
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
