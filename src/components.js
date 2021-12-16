import React from "react";
import "./components.css";

// declaring these here for readability + easier balance changes
const baseWordScore = 200;
const bonusLetterMultiplier = 1.5;
const minimumWordLength = 3;
const startingTileCount = 10;
const startingRoundLength = 120;

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      word: "",
      wordList: "",
      wordsPlayed: 0,
      time: startingRoundLength,
      score: 0,
      wordDisplay: [],
      availableTiles: Array(startingTileCount).fill(1),
      letterTray: [],
    };
    this.addLetter = this.addLetter.bind(this);
    this.removeLetter = this.removeLetter.bind(this);
    // this.calculateWordScore = this.calculateWordScore(this);
    this.clearWord = this.clearWord.bind(this);
    this.submitWord = this.submitWord.bind(this);
    this.initialize = this.initialize.bind(this);
  }

  initialize() {
    let tray = [];
    for (let i = 0; i < startingTileCount; i++) {
      tray[i] = (
        <Letter
          letter={alphabet.charAt(Math.floor(Math.random() * 26))}
          trayPosition={i}
          wordPosition={-1}
          handleClick={(letter, trayPosition) =>
            this.addLetter(letter, trayPosition)
          }
        />
      );
    }

    this.setState({
      word: "",
      wordList: "",
      wordsPlayed: 0,
      time: startingRoundLength,
      score: 0,
      wordDisplay: [],
      availableTiles: Array(startingTileCount).fill(1),
      letterTray: tray,
    });
  }

  addLetter(letter, trayPosition) {
    if (this.state.availableTiles[trayPosition] === 1) {
      this.setState({
        word: this.state.word + letter,
        wordDisplay: this.state.wordDisplay.concat([
          <Letter
            letter={letter}
            trayPosition={trayPosition}
            wordPosition={this.state.wordDisplay.length}
            handleClick={(trayPosition, wordPosition) =>
              this.removeLetter(trayPosition, wordPosition)
            }
          />,
        ]),
        availableTiles: this.state.availableTiles.fill(
          0,
          trayPosition,
          trayPosition + 1
        ),
      });
      console.log(this.state.availableTiles.toString());
    } else {
      console.log("Letter unavailable!");
    }
  }

  removeLetter(trayPosition, wordPosition) {
    // NOTE FOR CHRIS: this is supposed to be recursive, but it only actually executes the last iteration of itself
    if (wordPosition + 1 < this.state.wordDisplay.length) {
      // if this letter isn't at the end of the word
      console.log(
        "The letter " +
          this.state.wordDisplay[wordPosition].props.letter +
          " at position " +
          this.state.wordDisplay[wordPosition].props.wordPosition +
          " isn't at the end of the word. Trying to remove the next character..."
      );
      this.removeLetter(
        this.state.wordDisplay[wordPosition + 1].props.trayPosition,
        this.state.wordDisplay[wordPosition + 1].props.wordPosition
      );
    }

    this.setState({
      wordDisplay: this.state.wordDisplay.slice(
        0,
        this.state.wordDisplay.length - 1
      ),
      availableTiles: this.state.availableTiles.fill(
        // NOTE FOR CHRIS: this doesn't work for some reason, even though it's exactly the same as in addLetter????????
        1,
        trayPosition,
        trayPosition + 1
      ),
    });
    console.log(this.state.availableTiles.toString());
  }

  calculateWordScore(word) {
    return (
      baseWordScore *
      Math.pow(bonusLetterMultiplier, word.length - minimumWordLength)
    );
  }

  clearWord() {
    this.setState({
      word: "",
      wordDisplay: [],
      availableTiles: this.state.availableTiles.fill(1),
    });
  }

  submitWord() {
    /* link to word validation backend here */
    if (this.state.word.length >= 3) {
      // check word length
      this.setState({
        wordList: this.state.wordList + this.state.word + " ",
        wordsPlayed: this.state.wordsPlayed + 1,
        score: this.state.score + this.calculateWordScore(this.state.word),
      });
      this.clearWord();
    } else {
      // update mascot dialogue/error message to say "Sorry, that word's too short!"
    }
  }

  render() {
    return (
      <div className="RowTray" id="GameContainer">
        <div className="SideColumn">
          <Mascot dialogue="Welcome to Dictionary Attack!" />
          <Options />
          <button onClick={this.initialize}>Start Game</button>
        </div>
        <div className="CenterColumn">
          <div>
            <h1>Dictionary Attack!</h1>
            <div className="RowTray">
              <h3>Time: {this.state.time}</h3>
              <h3>Score: {this.state.score}</h3>
            </div>
          </div>
          {/* <WordBox currentWord={this.state.word} /> */}
          <WordLine letters={this.state.wordDisplay} />
          <div className="LetterBox">{this.state.letterTray}</div>
          <div className="RowTray">
            <BigButton content="Submit" handleClick={this.submitWord} />
            <BigButton content="Clear" handleClick={this.clearWord} />
          </div>
        </div>
        <div className="SideColumn">
          <WordList wordlist={this.state.wordList} />
          <HighScores />
        </div>
      </div>
    );
  }
}

const WordBox = (props) => {
  if (props.currentWord === "") {
    return <h2 className="WordBox">Current word: None!</h2>;
  } else {
    return <h2 className="WordBox">Current word: {props.currentWord}</h2>;
  }
};

const WordLine = (props) => {
  return (
    <div>
      <h2>Current word:</h2>
      <div className="WordLine">{props.letters}</div>
    </div>
  );
};

const Letter = (props) => {
  return (
    <div
      className="Letter"
      onClick={() => props.handleClick(props.letter, props.trayPosition)}
    >
      <p>{props.letter}</p>
    </div>
  );
};

const BigButton = (props) => {
  return (
    <div className="BigButtonContainer">
      <div className="BigButton" onClick={() => props.handleClick()}>
        <p>{props.content}</p>
      </div>
    </div>
  );
};

const WordList = (props) => {
  if (props.wordlist === "") {
    return (
      <div id="WordList" className="SidebarBox">
        <h2>Recent Words</h2>
        <p>No words yet!</p>
      </div>
    );
  } else {
    let list = props.wordlist.replaceAll(" ", "\n");
    return (
      <div id="WordList" className="SidebarBox">
        <h2>Recent Words</h2>
        <p>{list}</p>
      </div>
    );
  }
};

const Mascot = (props) => {
  return (
    <div id="MascotBox" className="SidebarBox">
      <img
        src="../mascot.png"
        id="Mascot"
        alt="Thesaurus Rex"
        title="Thesaurus Rex"
      />
      <p>
        <b>Thesaurus Rex says:</b>
        <br />
        {props.dialogue}
      </p>
    </div>
  );
};

const HighScores = (props) => {
  return (
    <div id="HighScores" className="SidebarBox">
      <h2>High Scores</h2>
      <p>No high scores yet!</p>
    </div>
  );
};

const Options = (props) => {
  return (
    <div id="Options" className="SidebarBox">
      <h2>Options</h2>
      <p>No options yet!</p>
    </div>
  );
};

export default Game;
