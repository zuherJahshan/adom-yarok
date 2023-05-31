import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import "./JoinGame.css";
import serverInfo, { joinGame } from "../utils/server-info";
import { useContext, useEffect, useState } from "react";
import { PlayerNameContext } from "../store/store";
import { GameErrorMessages } from "../../api/api.js";

function JoinGame(props) {
  //-- Get player name from user, and save it to context
  //-- when typed and enter selected, or button activated send to server and move to waiting state

  const { playerName, setPlayerName } = useContext(PlayerNameContext);
  const [alertVisibility, setAlertVisibility] = useState(false);

  const handleButtonClick = async () => {
    try {
      const gameState = await joinGame(playerName);
      props.changeAppState();
    } catch (error) {
      console.log(error.message)
      if (error.message === GameErrorMessages.playerAlreadyExists) {
        console.log(error);
        initiatePleaseTryAgainEvent(); //-- only here changes the state of the game
      }
    }
  };

  const nameChanged = (e) => {
    setPlayerName(e.target.value);
  };

  const initiatePleaseTryAgainEvent = () => {
    setPlayerName("");
    setAlertVisibility(true);
  };

  return (
    <div className="JoinGroup">
      <InputGroup className="mb-3">
        {/*
            Text box that recieves the player name
        */}
        <Form.Control
          placeholder="name"
          aria-label="name"
          aria-describedby="basic-addon2"
          value={playerName}
          onChange={nameChanged}
        />
        {/*
            Button that sends joinGame request to the server with the player name
        */}
        <Button variant="join-game" onClick={handleButtonClick}>
          Join game
        </Button>
      </InputGroup>
      {alertVisibility && <Alert key="light" variant="light">
        Player already exists, please try different name.
      </Alert>}
    </div>
  );
}

export default JoinGame;
