import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
function Square(props) {
  return (
    <button
      className={props.hightLight === true ? "square-hightLight" : "square"}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        hightLight={
          i === this.props.poses[this.props.poses.length - 1] ||
          this.props.winner.includes(i)
        }
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  renderRow(rowIndex, items) {
    var row = [];
    for (var i = 0; i < items; i++) {
      let cell = this.renderSquare(rowIndex * items + i);
      row.push(cell);
    }
    return <div className="board-row">{row}</div>;
  }

  renderBoard(row, col) {
    var board = [];
    for (var i = 0; i < row; i++) {
      let row = this.renderRow(i, col);
      board.push(row);
    }
    return board;
  }

  render() {
    return <div>{this.renderBoard(this.props.size, this.props.size)}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);

    /// Set state here - component properties
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          poses: [],
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      tableSize: 5,
      revertMoveList: false,
      highLightArray: [],
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const poses = current.poses.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";

    poses.push(i);
    this.setState({
      history: history.concat([
        {
          squares: squares,
          poses: poses,
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  increaseTablesize() {
    this.newGame();
    this.setState({
      tableSize: this.state.tableSize + 1,
    });
  }

  decreaseTablesize() {
    if (this.state.tableSize > 5) {
      this.newGame();
      this.setState({
        tableSize: this.state.tableSize - 1,
      });
    }
  }

  newGame() {
    this.setState({
      history: [
        {
          squares: Array(9).fill(null),
          poses: [],
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      highLightArray: [],
    });
  }

  revertMoveList() {
    this.setState({
      revertMoveList: !this.state.revertMoveList,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  render() {
    const history = this.state.history;
    const size = this.state.tableSize;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(
      current.squares,
      size,
      current.poses[current.poses.length - 1]
    );
    const revert = this.state.revertMoveList;
    const moves = history.map((step, move) => {
      const i = step.poses[move - 1];
      const x = Math.floor(i / size).toString();
      const y = (i - size * Math.floor(i / size)).toString();
      const desc = move
        ? "Go to move #" + move + " - (" + x + " - " + y + ")"
        : "Go to game start";
      return (
        <li key={move}>
          <button
            className={
              this.state.stepNumber === move ? "li-active" : "li-inactive"
            }
            onClick={() => this.jumpTo(move)}
          >
            {desc}
          </button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = "Winner: " + (this.state.xIsNext ? "O" : "X");
    } else {
      if (current.poses.length === size * size) {
        status = "No one win, DRAW!";
      } else {
        status = "Next player: " + (this.state.xIsNext ? "X" : "O");
      }
    }

    return (
      <div className="game-board">
        <div className="game-setting">
          <p>Change table size:</p>

          {/*Change tablesize  */}
          <div className="game-button">
            <button
              className="game-button-item"
              onClick={() => this.decreaseTablesize()}
            >
              -1
            </button>
            <strong className="game-button-item">{this.state.tableSize}</strong>
            <button
              className="game-button-item"
              onClick={() => this.increaseTablesize()}
            >
              +1
            </button>
          </div>
          <div className="game-button">
            <button
              className="game-button-newgame"
              onClick={() => this.newGame()}
            >
              New game
            </button>
            <button
              className="game-button-newgame"
              onClick={() => this.revertMoveList()}
            >
              Revert Move List
            </button>
          </div>

          {/*List of moves*/}
          <div className="game-info">
            <div>{status}</div>
            <ol>{revert ? moves.reverse() : moves}</ol>
          </div>
        </div>

        {/* Game table */}
        <div className="game-board">
          <Board
            squares={current.squares}
            poses={current.squares}
            winner={winner ? winner : []}
            size={this.state.tableSize}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares, size, current) {
  var currentPlayer = squares[current];

  // ngang trái
  var score = 0;
  var min = current;
  var max = current;
  var step = 0;
  for (let i = 0; i < 5 && i - 1 < current % size; i++) {
    if (squares[current - i] === currentPlayer) {
      score += 1;
      min = current - i;
    } else {
      break;
    }
  }

  // ngang phải
  for (let i = 1; i < 5 && i - 1 < size - (current % size); i++) {
    if (squares[current + i] === currentPlayer) {
      score += 1;
      max = current + i;
    } else {
      break;
    }
  }

  if (score >= 5) {
    return [min, max, step];
  }

  score = 0;
  var highLight = [];
  // dọc trên
  for (let i = 0; current - i * size > 0; i++) {
    if (squares[current - i * size] === currentPlayer) {
      score += 1;
      highLight.push(current - i * size);
    } else {
      break;
    }
  }

  // dọc dưới
  for (let i = 1; current + i * size < size * size; i++) {
    if (squares[current + i * size] === currentPlayer) {
      score += 1;
      highLight.push(current + i * size);
    } else {
      break;
    }
  }

  if (score >= 5) {
    return highLight;
  }

  score = 0;
  highLight = [];
  // chéo trái trên
  for (let i = 0; current - i * (size + 1) > 0; i++) {
    const pos = current - i * (size + 1);
    if (squares[pos] === currentPlayer) {
      score += 1;
      highLight.push(pos);
      if (pos % size === size - 1 || pos % size === 0) {
        break;
      }
    } else {
      break;
    }
  }

  // chéo phải dưới
  for (let i = 1; current + i * (size + 1) < size * size; i++) {
    const pos = current + i * (size + 1);
    if (squares[pos] === currentPlayer) {
      score += 1;
      highLight.push(pos);
      if (pos % size === size - 1 || pos % size === 0) {
        break;
      }
    } else {
      break;
    }
  }
  if (score >= 5) {
    return highLight;
  }

  score = 0;
  highLight = [];
  // chéo phải trên
  for (let i = 0; current - i * (size - 1) > 0; i++) {
    const pos = current - i * (size - 1);
    if (squares[pos] === currentPlayer) {
      score += 1;
      highLight.push(pos);
      if (pos % size === size - 1 || pos % size === 0) {
        break;
      }
    } else {
      break;
    }
  }

  // chéo trái dưới
  for (let i = 1; current + i * (size - 1) < size * size; i++) {
    const pos = current + i * (size - 1);
    if (squares[pos] === currentPlayer) {
      score += 1;
      highLight.push(pos);
      if (pos % size === size - 1 || pos % size === 0) {
        break;
      }
    } else {
      break;
    }
  }
  if (score >= 5) {
    return highLight;
  }

  return null;
}
