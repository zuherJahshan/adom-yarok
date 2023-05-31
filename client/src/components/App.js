import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import "./App.css";
import JoinGame from "./JoinGame/JoinGame";
import PlayerProvider from "./store/PlayerProvider";
import GameStateProvider from "./store/GameStateProvider";
import WaitingIndicator from "./WaitingIndicator/WaitingIndicator";
import WaitingForPlayersToJoin from "./JoinGame/WaitingForPlayersToJoin";

const GameState = {
  needToJoin: "needToJoin",
  waitingForPlayersToJoin: "waitingForPlayersToJoin",
  revealColor: "revealColor",
  waitingForPlayersToRevealColor: "waitingForPlayersToRevealColor",
  gameInProgress: "gameInProgress",
  gameOver: "gameOver",
};

function App() {
  const [gameState, setGameState] = useState(GameState.needToJoin);

  const changeAppState = () => {
    switch (gameState) {
      case GameState.needToJoin:
        setGameState(GameState.waitingForPlayersToJoin);
        break;
      case GameState.waitingForPlayersToJoin:
        console.log("changed to state reveal color");
        setGameState(GameState.revealColor);
        break;
      case GameState.revealColor:
        setGameState(GameState.waitingForPlayersToRevealColor);
        break;
      case GameState.waitingForPlayersToRevealColor:
        setGameState(GameState.gameInProgress);
        break;
      case GameState.gameInProgress:
        setGameState(GameState.gameOver);
        break;
      default:
        setGameState(GameState.needToJoin);
    }
    return 0;
  };

  function renderSwitch(gameState) {
    switch (gameState) {
      case GameState.needToJoin:
        return <JoinGame changeAppState={changeAppState}></JoinGame>;
      case GameState.waitingForPlayersToJoin:
        return <WaitingIndicator><WaitingForPlayersToJoin changeAppState={changeAppState}></WaitingForPlayersToJoin></WaitingIndicator>
      case GameState.revealColor:
        return <h1>reveal color</h1>;
      case GameState.waitingForPlayersToRevealColor:
        return <h1>waiting for players to reveal color</h1>;
      case GameState.gameInProgress:
        return <h1>game in progress</h1>;
      case GameState.gameOver:
        return <h1>game over</h1>;
      default:
        return <h1>error!</h1>;
    }
  }

  return (
    <PlayerProvider>
      <GameStateProvider>
        <div className="App">
          <header className="App-header">
            <h1 className="welcome-title">
              <span className="red-txt">adom </span>
              <span className="green-txt">yarok</span>
            </h1>
            <div className="render-switch-container">
              {renderSwitch(gameState)}
            </div>
          </header>
        </div>
      </GameStateProvider>
    </PlayerProvider>
  );
}

export default App;
