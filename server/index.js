import express from 'express'
import cors from 'cors'
import {
	ReasonPhrases,
	StatusCodes,
} from 'http-status-codes';
import isValidRequest from './valid-requests.js';

import Game from './game/game.js'
import { GameStatus } from './api/api.js';

const app = express();
const port = 3004;

app.use(express.json());
app.use(cors());

const game = new Game(3);

const GameMethods = {
  joinGame: "joinGame",
  revealColor: "revealColor",
  accuse: "accuse",
  clearAccusition: "clearAccusition",
  getState: "getState"
}

const executeGameMethod = (game, method, data) => {
  switch (method) {
    case GameMethods.joinGame:
      return game.joinGame(data.playerName);
    case GameMethods.revealColor:
      return game.revealColor(data.playerName);
    case GameMethods.accuse:
      return game.accuse(data.playerName, data.accusedPlayerName);
    case GameMethods.clearAccusition:
      return game.clearAccusition(data.playerName);
    case GameMethods.getState:
      return game.getGameState(data.playerName);
    default:
      // throw an error
      throw new Error("Invalid method");  
  }
}

const handlePostRequest = (req, res) => {
  const { method, data } = req.body;
  console.log("meow", data);
  if (!isValidRequest('POST', '/games', method, data)) {
    console.log("Invalid request");
    res.status(StatusCodes.BAD_REQUEST).json({errorMessage: ReasonPhrases.BAD_REQUEST});
    return;
  }
  try {
    const [status, gameStateOrErrorMessage] = executeGameMethod(game, method, data);
    console.log("status:", status);
    if (status === GameStatus.success) {
      res.status(StatusCodes.OK).json({status: GameStatus.success, gameState: gameStateOrErrorMessage});
    } else {
      res.status(StatusCodes.OK).json({status: GameStatus.failure, errorMessage: gameStateOrErrorMessage});
    }
  } catch (error) {
    console.log("Error:", error);
    res.status(StatusCodes.BAD_REQUEST).json({errorMessage: ReasonPhrases.BAD_REQUEST});
  }
}

app.post('/games', handlePostRequest);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});