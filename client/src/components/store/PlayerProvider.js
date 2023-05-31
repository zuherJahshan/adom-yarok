import React, { useState } from "react";
import { PlayerNameContext } from "./store.js";

const PlayerProvider = ({ children }) => {
  const [playerName, setPlayerName] = useState("");

  return (
    <PlayerNameContext.Provider value={{playerName, setPlayerName }}>
      {children}
    </PlayerNameContext.Provider>
  );
};

export default PlayerProvider;
