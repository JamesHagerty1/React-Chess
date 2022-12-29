import React, { FC, useState, useRef, useEffect } from 'react';
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
  }

  return (
    <div className="board-tile" onClick={() => handleClick()}>
      {props.piece}
    </div>
  )
}


interface BoardProps {
  curBoard: string[][];
  newDims: Function;
  clickTile: Function;
}

const Board: FC<BoardProps> = (props) => {
  const boardRef = useRef<HTMLDivElement>(null);

  // Tell parent component about updated HTML dims
  const onResize = () => {
    props.newDims(boardRef.current?.offsetTop,
                  boardRef.current?.offsetLeft,
                  boardRef.current?.offsetWidth,
                  boardRef.current?.offsetHeight);
  }

  useEffect(() => {
    onResize(); // Init parent knowledge of board dims
    window.addEventListener("resize", onResize);
  }, []);

  return (
    <div ref={boardRef} className="board">
      {props.curBoard.map((row, r) =>
        <div key={r.toString()} className="board-row">
          {props.curBoard[r].map((pieceId, c) => 
            <Tile key={c.toString()} piece={props.curBoard[r][c]} r={r} c={c} 
            clickTile={props.clickTile}/>
          )}
        </div>
      )}
    </div>
  );
}


interface SVGLayerProps {
 top: number;
 left: number;
}

const SVGLayer: FC<SVGLayerProps> = (props) => {
  return (
    <div className="svg-layer" style={{"top": `${props.top}px`, "left": `${props.left}px`}}>
      <svg className="svg-box">
        <line className="svg-line" x1="10" y1="10" x2="400" y2="400" 
        stroke="Coral" strokeWidth="4" strokeLinecap="round"></line>
      </svg>
  </div>
  );
}


function App() {
  // State for game logic
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

  const [curBoard, setCurBoard] = useState<string[][]>(startBoard);

  function clickTile(i: number, j: number): number {
    console.log(i + "-" + j);
    let newBoard = curBoard.slice();
    newBoard[i][j] = "X";
    newBoard[0][0] = "X";
    setCurBoard(newBoard);
    return -1;
  }

  // State for SVG drawing logic
  const [top, setTop] = useState<number>(0);
  const [left, setLeft] = useState<number>(0);

  const newDims = (newTop: number, newLeft: number, newWidth: number, 
                   newHeight: number) => {
    setTop(newTop);
    setLeft(newLeft);
  };

  //
  return (
    <div className="flex-container">
      <Board curBoard={curBoard} newDims={newDims} clickTile={clickTile} />
      <SVGLayer top={top} left={left} />
      <div className="move-history">
        <h1>Move History</h1>
      </div>
    </div>
  );
}

export default App;
