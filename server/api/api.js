const Colors = {
    green: 0,
    red: 1,
    white: 2,
}

const GameErrorMessages = {
    playerAlreadyExists: "playerAlreadyExists",
    playerDoesNotExist: "playerDoesNotExist",
    gameIsFull: "gameIsFull",
    notEnoughPlayersJoined: "notEnoughPlayersJoined",
};

const GameStatus = {
    success: true,
    failure: false
}

export {GameErrorMessages, Colors, GameStatus};