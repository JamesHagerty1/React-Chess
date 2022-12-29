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
                  boardRef.current?.offsetWidth);
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
  dims: [number, number, number]; // top, left, width
  lastMove: [number, number, number, number]; // prev r and c, new r and c
}

const SVGLayer: FC<SVGLayerProps> = (props) => {
  const [top, left, width] = props.dims;
  const [oldR, oldC, newR, newC] = props.lastMove;

  // coords for line showing latest move
  const [tileDim, halfTileDim] = [width / 8, width / 16];
  const [x1, x2] = [halfTileDim + oldC * tileDim, halfTileDim + newC * tileDim];
  const [y1, y2] = [halfTileDim + oldR * tileDim, halfTileDim + newR * tileDim];

  return (
    <div className="svg-layer" 
    style={{"top": `${top}px`, "left": `${left}px`}}>
      <svg className="svg-box">
        <line className="svg-line" x1={x1} y1={y1} x2={x2} y2={y2} 
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
  const [dims, setDims] = 
    useState<[number, number, number]>([-1, -1, -1]);

  const newDims = (newTop: number, newLeft: number, newWidth: number) => {
   setDims([newTop, newLeft, newWidth]);
  };

  const [lastMove, setLastMove] = 
    useState<[number, number, number, number]>([0, 0, 6, 4]); // temp vals


  //
  return (
    <div className="flex-container">
      <Board curBoard={curBoard} newDims={newDims} clickTile={clickTile} />
      <SVGLayer dims={dims} lastMove={lastMove} />
      <div className="move-history">
        <h1>Move History</h1>
      </div>
    </div>
  );
}

export default App;
