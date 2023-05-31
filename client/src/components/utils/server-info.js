import { GameStatus } from "../../api/api.js";

const ServerInfo = {
  url: "http://localhost:3004/",
  resources: {
    games: "games/",
  },
};

async function joinGame(playerName) {
  var gameState = await makeRequest("POST", "joinGame", { playerName });
  return gameState;
}

async function getState(playerName) {
  var gameState = await makeRequest("POST", "getState", { playerName });
  return gameState;
}

async function revealColor(playerName) {
  var gameState = await makeRequest("POST", "revealColor", { playerName });
  return gameState;
}

async function accuse(playerName, accusedPlayerName) {
  var gameState = await makeRequest("POST", "accuse", {
    playerName,
    accusedPlayerName,
  });
  return gameState;
}

async function clearAccusition(playerName) {
  var gameState = await makeRequest("POST", "clearAccusition", { playerName });
  return gameState;
}

/**
 * Makes request to the server and returns its response.
 * In case of success returns the game state. In case it recieves error, it throws an error.
 * This functionality is not full, need to adapt a new functionality in which error will be handled,
 * and the app will not crash.
 */
async function makeRequest(httpMethod, gameMethod, data) {
  let url = new URL(ServerInfo.url + ServerInfo.resources.games);
  var response = await fetch(url, {
    method: httpMethod, // updating an existing game
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: httpMethod ==="POST" ? JSON.stringify({
      method: gameMethod,
      data,
    }) : null,
  });
  if (response.ok) {
    var responseData = await response.json();
    if (responseData.status === GameStatus.success) {
      return responseData.gameState;
    } else {
      console.log("Response data:", responseData.errorMessage);
      throw new Error(responseData.errorMessage);
    }
  } else {
    console.log(
      "Response status:",
      response.status,
      "Response text:",
      await response.text()
    );
    throw new Error("Network response was not ok");
  }
}

export default ServerInfo;
export { getState, joinGame, revealColor, accuse, clearAccusition };
