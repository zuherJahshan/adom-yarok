import { useContext, useEffect } from "react";
import { GameStateContext } from "../store/store";

function WaitingForPlayersToJoin(props) {
    const { gameStateState } = useContext(GameStateContext);

    useEffect(() => {
        if (gameStateState && gameStateState.hasOwnProperty("allPlayersEnteredTheGame") && gameStateState.allPlayersEnteredTheGame) {
            props.changeAppState();
        }
    }, [gameStateState]);

    return gameStateState && (<div>
        <h1>Waiting for players to join</h1>
        <h2>Players joined: {gameStateState.players.length}</h2>
    </div>);
}

export default WaitingForPlayersToJoin;