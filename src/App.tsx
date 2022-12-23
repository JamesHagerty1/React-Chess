import React, { FC, useState } from 'react';
import "./index.css";


interface TileProps {
  pieceId: string;
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
}

const Row: FC<RowProps> = (props) => {
  return (
    <div className="board-row">
      <tr>
        {props.row.map(pieceId => <Tile pieceId={pieceId}/> )}
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
        {curBoard.map(row => <Row row={row}/> )}
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
