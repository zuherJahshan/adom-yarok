import { Colors, GameErrorMessages, GameStatus } from '../api/api.js';


function sample(array, k) {
    var indexes = Array.from({ length: array.length }, (_, i) => i);
    function pickRandomElementAndRemove(arr) {
        const randomIndex = Math.floor(Math.random() * arr.length);
        const [randomElement] = arr.splice(randomIndex, 1);
        return randomElement;
    }
    var picks = [];
    for (var i = 0; i < k; i++) {
        picks.push(array[pickRandomElementAndRemove(indexes)])
    }
    return picks;
}

class Player {
    #playerName;
    #accusers;
    #accusing;
    #alive;
    #ready;
    #color;

    constructor(playerName) {
        this.#playerName = playerName;
        this.#accusers = [];
        this.#accusing = null;
        this.#alive    = true;
        this.#ready    = false;
        this.#color    = Colors.white;
    }

    toJSON(fullKnowledge = false) {
        return {
            playerName: this.#playerName,
            accusers: this.#accusers,
            accusing: this.#accusing,
            alive: this.#alive,
            ready: this.#ready,
            color: fullKnowledge || !this.#alive ? this.#color : Colors.white,
        }
    }

    isNameEqual(playerName) {
        return this.#playerName === playerName;
    }

    getName() {
        return this.#playerName;
    }

    setColor(color) {
        this.#color = color;
    }

    getColor() {
        return this.#color;
    }

    getAccusition() {
        return this.#accusing;
    }

    getNumberOfAccusers() {
        return this.#accusers.length;
    }

    makeReady() {
        this.#ready = true;
    }

    accuse(playerName) {
        this.#accusing = playerName;
    }

    clearAccusition() {
        this.#accusing = null;
    }

    accusedBy(playerName) {
        this.#accusers.push(playerName);
    }

    removeAccusitionBy(playerName) {
        this.#accusers = this.#accusers.filter(accuser => {accuser === playerName});
    }

    kill() {
        this.#alive = false;
    }
}

class Players {
    #numberOfPlayers;
    #playersMap;
    #playersArray;

    #numberOfReadyPlayers;

    #numberOfReds;

    constructor(numberOfPlayers) {
        this.#numberOfPlayers = numberOfPlayers;
        this.#playersMap = new Map();
        this.#playersArray = [];
        this.#numberOfReadyPlayers = 0;
        this.#numberOfReds = 0;
    }

    /**
     * 
     * @param {*} showColorsOf: a set of player names, or the string "*" (meaning all players). 
     * @returns if the playerViewing is a red player, it means he has full knowledge of the game,
     * so we send him the full information of the players (the players colors are not hidden).
     * Else, we send him the players array with all the colors hidden (the color field will equal Colors.white).
     */
    toJSON(playerViewing, showColors = false) {
        return this.#playersArray.map(player => player.toJSON(showColors || playerViewing === player.getName()));
    }

    addPlayer(playerName) {
        if (this.size() < this.capacity() && !this.has(playerName)) {
            var player = new Player(playerName);
            this.#playersMap.set(playerName, player);
            this.#playersArray.push(player);
            return true;
        }
        return false;
    }

    killPlayer(playerName) {
        if (this.has(playerName)) {
            this.#playersMap.get(playerName).kill();
            if (this.#playersMap.get(playerName).getColor() === Colors.red) {
                this.#numberOfReds -= 1;
            }
            return true;
        } else return false;
    }

    removePlayer(playerName) {
        const playerToBeRemoved = this.#playersMap.get(playerName);
        if (playerToBeRemoved) {
            //-- clean its accusitions
            this.clearAccusition(playerName);

            //-- remove it from the list of any other player that accused him
            this.#playersArray.forEach(player => {
                if (player.getAccusition() === playerName) {
                    player.clearAccusition();
                }
            });

            //-- remove it from the list of players
            this.#playersMap.delete(playerName);
            this.#removePlayerFromArray(playerName);
            return true;
        }
        return false;
    }

    getAccusition(playerName) {
        const player = this.#playersMap.get(playerName);
        if (player) {
            return player.getAccusition();
        }
        return null;
    }

    accuse(accuserName, accusedName) {
        const accuser = this.#playersMap.get(accuserName);
        const accused = this.#playersMap.get(accusedName);
        if (accuser && accused) {
            accuser.accuse(accusedName);
            accused.accusedBy(accuserName);
            return true;
        }
        return false;
    }

    clearAccusition(playerName) {
        const player = this.#playersMap.get(playerName);
        const previoulyAccused = this.#playersMap.get(player.getAccusition());
        if (player && previoulyAccused) {
            player.clearAccusition();
            previoulyAccused.removeAccusitionBy(playerName);
            return true;
        }
        return false;
    }

    clearAllAccusitions() {
        this.#playersArray.forEach(player => {
            this.clearAccusition(player.getName());
        });
    }

    getPlayer(playerName) {
        return this.#playersMap.get(playerName);
    }

    has(playerName) {
        return this.#playersMap.has(playerName);
    }

    size() {
        return this.#playersArray.length;
    }

    capacity() {
        return this.#numberOfPlayers;
    }

    full() {
        return this.size() === this.capacity();
    }

    setPlayersAsRedsAndGreensRandomly(numberOfReds) {
        //-- Change all players to green
        this.#numberOfReds = numberOfReds;
        this.#playersArray.forEach((player, _1, _2) => {
            player.setColor(Colors.green);
        });

        //-- Now pick reds, and change their colors
        var reds = sample(this.#playersArray, numberOfReds);
        reds.forEach((red, _1, _2) => {
            red.setColor(Colors.red);
        });
    }

    getNumberOfReadyPlayers() {
        return this.#numberOfReadyPlayers;
    }

    makeReady(playerName) {
        const player = this.#playersMap.get(playerName);
        if (player) {
            player.makeReady();
            this.#numberOfReadyPlayers += 1;
            return true;
        }
        return false;
    }

    /**
     * 
     * @param {*} playerName 
     * @returns if the playerName exists, it will return its color, else it will return the hidden state Colors.white.
     */
    getColor(playerName) {
        if (this.#playersMap.has(playerName)) {
            return this.#playersMap.get(playerName).getColor();
        } else return Colors.white;
    }

    getPlayersSortedByVotes() {
        var playersArrayCopy = [...this.#playersArray];
        playersArrayCopy.sort((player1, player2) => {
            return player2.getNumberOfAccusers() - player1.getNumberOfAccusers();
        });
        return playersArrayCopy;
    }

    getNumberOfReds() {
        return this.#numberOfReds;
    }

    /**
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * ~~~~ Private functions ~~~~~~~
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     */
    #removePlayerFromArray(playerName) {
        this.#playersArray = this.#playersArray.filter(player => !player.isNameEqual(playerName));
    }
}

class Game {
    #numberOfPlayerWithNoAccusition; //-- updated only in case of player's removal, accusition, or accusition removal.
    #players;
    #nominatedNumberOfReds; //-- never updates after game creation.
    #allPlayersEnteredTheGame; //-- updated only in case of all players entered the game.
    #gameStarted; //-- updated only in case of all players colors are revealed.
    #gameOver; //-- updated only in case of game over
    #winners; //-- updated only in case of game over

    constructor(numberOfPlayers, nominatedNumberOfReds = 0) {
        this.#numberOfPlayerWithNoAccusition = numberOfPlayers;
        
        this.#players = new Players(numberOfPlayers);
        
        nominatedNumberOfReds = (nominatedNumberOfReds) ? nominatedNumberOfReds : numberOfPlayers; //-- no zero is allowed.
        var maximalNumberOfReds = (Math.floor( numberOfPlayers / 2 ) * 2 === numberOfPlayers) ? 
            Math.floor( numberOfPlayers / 2 ) - 1 :
            Math.floor( numberOfPlayers / 2 );
        this.#nominatedNumberOfReds = Math.min(maximalNumberOfReds, nominatedNumberOfReds);
        this.#nominatedNumberOfReds = Math.max(1, this.#nominatedNumberOfReds);
        
        this.#allPlayersEnteredTheGame = false;
        this.#gameStarted = false;
        this.#gameOver = false;
        this.#winners = Colors.white;
    }

    //-- Every public function of the class shoud return a pair of (status, state), if the status is false,
    //-- then the state is an error message.

    /**
     * @param {*} playerName: string
     * @returns [status: GameStatus, state: string | object]
     * If the status is failure, then the state is an error message.
     * If the status is success, then the state is the game state.
     * The status will be failure if the player name already exists, or the game is full.
     */
    joinGame(playerName) {
        if (!this.#players.has(playerName) && this.#players.size() < this.#players.capacity()) {
            this.#players.addPlayer(playerName);
        }
        else if (this.#players.has(playerName)) {
            return [GameStatus.failure, GameErrorMessages.playerAlreadyExists];
        }
        else {
            return [GameStatus.failure, GameErrorMessages.gameIsFull];
        }
        if (this.#players.size() === this.#players.capacity()) {
            this.#allPlayersEnteredTheGame = true;
            this.#players.setPlayersAsRedsAndGreensRandomly(this.#nominatedNumberOfReds);
        }
        return [GameStatus.success, this.getState(playerName)];
    }

    /**
     * 
     * @param {*} playerName: string
     * @returns [status: GameStatus, state: string | object]
     * The color will be revealed only if the amount of players joined the game,
     * is equal to the number of players specified by the user when creating the game.
     * In case the color is revealed, the return value will be [success, gameState],
     * Else, the return value will be [failure, "notEnoughPlayersJoined"]
     */
    revealColor(playerName) {
        if (this.#players.has(playerName) && this.#players.capacity() === this.#players.size()) {
            this.#players.makeReady(playerName);
            if (this.#players.getNumberOfReadyPlayers() === this.#players.capacity()) {
                //-- if all players revealed their colors, then the game can start.
                this.#gameStarted = true;
            }
            return [GameStatus.success, this.getState(playerName)];
        }
        return [GameStatus.failure, GameErrorMessages.notEnoughPlayersJoined];
    }

    /**
     * @param {*} playerName: string 
     * @returns the state of the game.
     */
    getState(playerName) {
        return {
            players: this.#players.toJSON(
                playerName,
                this.#players.getColor(playerName) === Colors.red
            ),
            gameStarted: this.#gameStarted,
            allPlayersEnteredTheGame: this.#allPlayersEnteredTheGame,
            gameOver: this.#gameOver,
            winners: this.#winners,
        }
    }

    getGameState(playerName) {
        if (this.#players.has(playerName)) {
            return [GameStatus.success, this.getState(playerName)];
        }
        return [GameStatus.failure, GameErrorMessages.playerDoesNotExist]
    }

    accuse(accuserName, victimName) {
        if (this.exists(accuserName) && this.exists(victimName)) {
            var oldAccustion = this.#players.getAccusition(accuserName);
            
            //-- check if already accused someone and if not, then decrease the number of players with no accusition.
            if (!oldAccustion) {
                this.#numberOfPlayerWithNoAccusition -= 1;
            }

            //-- check if the victim is not equal to his old accusition, and if so, accuse him.
            if (oldAccustion !== victimName) {
                //-- if the old accusition exists, you should undo it first.
                if (oldAccustion) {
                    this.#players.clearAccusition(accuserName);
                }
                // accuse and expect it to return true, if false throw an error.
                if (!this.#players.accuse(accuserName, victimName)) {
                    throw new Error("Failed to accuse.");
                }
            }

            //-- check if a player should be dumped.
            this.#checkDeposition();

            //-- return the statte of the game.
            return [GameStatus.success, this.getState(accuserName)];
        }
        return [GameStatus.failure, GameErrorMessages.playerDoesNotExist];
    }

    clearAccusition(playerName) {
        if (this.#players.has(playerName)) {
            this.#players.clearAccusition(playerName);
            return [GameStatus.success, this.getState(playerName)];
        }
        return [GameStatus.failure, GameErrorMessages.playerDoesNotExist];
    }

    exists(player) {
        return this.#players.has(player);
    }

    getNumberOfPlayers() {
        return this.#players.size();
    }

    getNumberOfReds() {
        return this.#players.getNumberOfReds();
    }

    /**
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * ~~~~ Private functions ~~~~~~~
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     */

    /**
     * 
     * @returns true if a player was desposed, else false.
     * Checks if the player with the maximal number of accusitions has more votes than
     */
    #checkDeposition() {
        var playersSortedByVotes = this.#players.getPlayersSortedByVotes();
        var maximalAccusitions = playersSortedByVotes[0].getNumberOfAccusers();
        var secondMaximalAccusitions = playersSortedByVotes[1].getNumberOfAccusers();
        if (maximalAccusitions > secondMaximalAccusitions + this.#numberOfPlayerWithNoAccusition) {
            var playerNameToRemove = playersSortedByVotes[0].getName();
            this.#players.killPlayer(playerNameToRemove);
            this.#players.removePlayer(playerNameToRemove);
            this.#startNewRound();
            return true;
        }
        return false;
    }

    /**
     * 
     * @returns true always.
     * Starts a new round, updates the properties of the class accordingly.
     */
    #startNewRound() {
        this.#players.clearAllAccusitions();
        
        //-- Update properties of the class.
        this.#numberOfPlayerWithNoAccusition = this.#players.size();

        //-- Check if the game has ended
        this.#checkIfGameIsOver();

        return true;
    }

    #checkIfGameIsOver() {
        var reds = this.#players.getNumberOfReds();
        var greens = this.#players.size() - reds;
        if (reds >= greens) {
            this.#gameOver = true;
            this.#winners = Colors.red;
            return true;
        }
        else if (reds === 0) {
            this.#gameOver = true;
            this.#winners = Colors.green;
            return true;
        }
        return false;
    }
}

export default Game;
export {Colors, GameStatus, GameErrorMessages};