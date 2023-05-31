import { useContext, useReducer, useEffect } from "react";
import { getState } from "../utils/server-info.js";
import { GameStateContext, PlayerNameContext } from "./store.js"

const reducer = (state, action) => {
  switch (action.type) {
    case "changed":
      return action.gameState;
    default:
      return state;
  }
};

const GameStateProvider = ({ children }) => {
  const [gameStateState, dispatch] = useReducer(reducer, null);
  const {playerName} = useContext(PlayerNameContext);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const gameState = await getState(playerName);
        dispatch({ type: "changed", gameState });

      } catch (error) {
        console.log(error);
        // throw new Error(error);
      }
    }, 2000); // Every 2 seconds
    return () => clearInterval(interval);
  }, [playerName]);

  return (
    <GameStateContext.Provider value={{ gameStateState, dispatch }}>
      {children}
    </GameStateContext.Provider>
  );
};

export default GameStateProvider;
