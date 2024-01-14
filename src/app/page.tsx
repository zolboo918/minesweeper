"use client";

import { useState } from "react";
import Image from "next/image";

type Level = "easy" | "medium" | "hard";

type CellValueType = {
  type: "empty" | "bomb" | "flag" | "opened";
  aroundBombCount: number;
};

const LevelRowColCount = {
  easy: 10,
  medium: 18,
  hard: 28,
};

const LevelBombCount = {
  easy: 10,
  medium: 40,
  hard: 70,
};

let SelectedLevel: Level = "easy";
let clickCount = 0;
let BombCount = 0;

export default function Home() {
  const [started, setStarted] = useState<boolean>(false);
  const [level, setLevel] = useState<Level>("easy");
  const [array, setArray] = useState<CellValueType[][] | [][]>([[], []]);
  const [result, setResult] = useState<string | null>();

  const cellSize =
    level === "easy"
      ? "h-[30px] w-[30px]"
      : level === "medium"
      ? "h-[25px] w-[25px]"
      : "h-[20px] w-[20px]";

  const chooseLevel = (selectedLevel: Level) => {
    setLevel(selectedLevel);
    SelectedLevel = selectedLevel;
    setArray(generateArray(selectedLevel));
    setStarted(true);
  };

  const generateArray = (level: Level) => {
    let newArray: CellValueType[][] = [];
    [...Array(LevelRowColCount[level])].forEach(() => {
      let row: CellValueType[] = [];
      [...Array(LevelRowColCount[level])].forEach(() => {
        row.push({
          aroundBombCount: 0,
          type: "empty",
        });
      });
      newArray.push(row);
    });
    return fillBomb(newArray, level);
  };

  const fillBomb = (array: CellValueType[][], level: Level) => {
    [...Array(LevelBombCount[level])].forEach(() => {
      const row = Math.floor(Math.random() * LevelRowColCount[level]);
      const col = Math.floor(Math.random() * LevelRowColCount[level]);
      if (
        typeof array[row][col] != "undefined" &&
        array[row][col].type === "empty"
      ) {
        array[row][col].type = "bomb";
        BombCount++;
      }
    });
    return array;
  };

  const checkCell = (rowIndex: number, colIndex: number) => {
    return array[rowIndex] && array[rowIndex][colIndex];
  };

  const countAroundBomb = (
    rowIndex: number,
    colIndex: number,
    newArr: CellValueType[][]
  ) => {
    let aroundBombCount = 0;
    // top
    if (
      checkCell(rowIndex - 1, colIndex) &&
      newArr[rowIndex - 1][colIndex].type === "bomb"
    ) {
      aroundBombCount++;
    }
    //bottom
    if (
      checkCell(rowIndex + 1, colIndex) &&
      newArr[rowIndex + 1][colIndex].type === "bomb"
    ) {
      aroundBombCount++;
    }
    //left
    if (
      checkCell(rowIndex, colIndex - 1) &&
      newArr[rowIndex][colIndex - 1].type === "bomb"
    ) {
      aroundBombCount++;
    }
    //right
    if (
      checkCell(rowIndex, colIndex + 1) &&
      newArr[rowIndex][colIndex + 1].type === "bomb"
    ) {
      aroundBombCount++;
    }
    // top left
    if (
      checkCell(rowIndex - 1, colIndex - 1) &&
      newArr[rowIndex - 1][colIndex - 1].type === "bomb"
    ) {
      aroundBombCount++;
    }
    // top right
    if (
      checkCell(rowIndex - 1, colIndex + 1) &&
      newArr[rowIndex - 1][colIndex + 1].type === "bomb"
    ) {
      aroundBombCount++;
    }
    //bottom left
    if (
      checkCell(rowIndex + 1, colIndex - 1) &&
      newArr[rowIndex + 1][colIndex - 1].type === "bomb"
    ) {
      aroundBombCount++;
    }
    //bottom right
    if (
      checkCell(rowIndex + 1, colIndex + 1) &&
      newArr[rowIndex + 1][colIndex + 1].type === "bomb"
    ) {
      aroundBombCount++;
    }
    return aroundBombCount;
  };

  const checkAround = (
    rowIndex: number,
    colIndex: number,
    fromRecursive?: boolean,
    arr?: CellValueType[][]
  ) => {
    let newArr: CellValueType[][] = arr ? arr : [...array];
    if (!fromRecursive && checkWin()) {
      alert("You win! Congrats.");
      reset();
      return;
    }
    if (newArr[rowIndex] && newArr[rowIndex][colIndex] && result != "0") {
      const value = newArr[rowIndex][colIndex];

      if (!fromRecursive) {
        clickCount++;
      }

      if (value.type === "bomb" && !fromRecursive) {
        if (clickCount === 1) {
          chooseLevel(SelectedLevel);
          return;
        } else {
          setResult("0");
          return;
        }
      }

      if (value.type === "flag" || value.type === "opened") {
        return;
      }

      if (value.type === "empty") {
        newArr[rowIndex][colIndex].type = "opened";
        value.aroundBombCount = countAroundBomb(rowIndex, colIndex, newArr);
        if (value.aroundBombCount === 0) {
          // top
          if (checkCell(rowIndex - 1, colIndex)) {
            checkAround(rowIndex - 1, colIndex, true);
          }
          //bottom
          if (checkCell(rowIndex + 1, colIndex)) {
            checkAround(rowIndex + 1, colIndex, true);
          }
          //left
          if (checkCell(rowIndex, colIndex - 1)) {
            checkAround(rowIndex, colIndex - 1, true);
          }
          //right
          if (checkCell(rowIndex, colIndex + 1)) {
            checkAround(rowIndex, colIndex + 1, true);
          }
          // top left
          if (checkCell(rowIndex - 1, colIndex - 1)) {
            checkAround(rowIndex - 1, colIndex - 1, true);
          }
          // top right
          if (checkCell(rowIndex - 1, colIndex + 1)) {
            checkAround(rowIndex - 1, colIndex + 1, true);
          }
          //bottom left
          if (checkCell(rowIndex + 1, colIndex - 1)) {
            checkAround(rowIndex + 1, colIndex - 1, true);
          }
          //bottom right
          if (checkCell(rowIndex + 1, colIndex + 1)) {
            checkAround(rowIndex + 1, colIndex + 1, true);
          }
        }
      }
      setArray([...newArr]);
    }
  };

  const setFlag = (event: MouseEvent, rowIndex: number, colIndex: number) => {
    event.preventDefault();

    if (array[rowIndex][colIndex].type == "flag") {
      array[rowIndex][colIndex].type = "empty";
    } else if (
      array[rowIndex][colIndex].type !== "flag" &&
      array[rowIndex][colIndex].type !== "opened"
    ) {
      array[rowIndex][colIndex].type = "flag";
      if (checkWin(array)) {
        alert("You win! Congrats.");
        reset();
        return;
      }
    }
    setArray([...array]);
  };

  const reset = () => {
    setResult(null);
    setStarted(false);
    clickCount = 0;
    BombCount = 0;
  };

  const checkWin = (newArr?: CellValueType[][]) => {
    let openedCellCount = 0;
    const arr = newArr ? newArr : array;
    arr.forEach((row: CellValueType[]) => {
      row.forEach((col: CellValueType) => {
        if (col.type === "opened") {
          openedCellCount++;
        }
      });
    });
    return openedCellCount === LevelRowColCount[SelectedLevel] ** 2 - BombCount;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12">
      {!started ? (
        <div>
          <div className="flex self-center text-center mb-5">Choose level</div>
          <div>
            <button
              className="rounded-lg bg-green-100 text-gray-600 px-5 py-2 mx-2"
              onClick={() => chooseLevel("easy")}
            >
              Easy
            </button>
            <button
              className="rounded-lg bg-green-100 text-gray-600 px-5 py-2 mx-2"
              onClick={() => chooseLevel("medium")}
            >
              Medium
            </button>
            <button
              className="rounded-lg bg-green-100 text-gray-600 px-5 py-2 mx-2"
              onClick={() => chooseLevel("hard")}
            >
              Hard
            </button>
          </div>
        </div>
      ) : (
        <div>
          <button className="text-2xl mr-10" onClick={reset}>
            &lt;-{" "}
          </button>
          <span>{level.toUpperCase()}</span>
          <div className="mt-5">
            {array.map((row: CellValueType[], rowIndex: number) => {
              return (
                <div className="flex row" key={rowIndex}>
                  {row.map((column: CellValueType, columnIndex: number) => {
                    return (
                      <div
                        key={rowIndex + columnIndex}
                        className={`flex ${
                          column.type === "opened" ? "bg-green-200" : "bg-white"
                        } text-gray-400 justify-center align-middle rounded hover:bg-green-100 text-center text-xl m-[1px] ${cellSize}`}
                        onClick={() => checkAround(rowIndex, columnIndex)}
                        onContextMenu={(event: any) =>
                          setFlag(event, rowIndex, columnIndex)
                        }
                      >
                        {column.aroundBombCount > 0 ? (
                          column.aroundBombCount
                        ) : column.type === "flag" ? (
                          <Image
                            src={
                              "https://cdn-icons-png.flaticon.com/512/395/395841.png"
                            }
                            alt="flag"
                            width={10}
                            height={5}
                            className="h-[70%] w-[70%]"
                          />
                        ) : result === "0" && column.type == "bomb" ? (
                          <Image
                            src={
                              "https://static.vecteezy.com/system/resources/thumbnails/021/125/685/small/bomb-flat-icon-png.png"
                            }
                            alt="bomb"
                            width={10}
                            height={5}
                            className="h-[70%] w-[70%]"
                          />
                        ) : (
                          <></>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {result === "0" && (
            <div className="text-l mt-10 ">
              <div>
                <span>Game over</span>
              </div>
              <button
                className="px-5 py-2 rounded-lg bg-cyan-600 mt-5"
                onClick={reset}
              >
                Play again
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
