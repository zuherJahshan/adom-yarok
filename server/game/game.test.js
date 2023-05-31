import Game, { Colors, GameErrorMessages, GameStatus } from './game.js'

const isGameStarted = (game) => {
    const state = game.getState();
    return state.gameStarted;
}

const isGameOver = (game) => {
    const state = game.getState();
    return state.gameOver;
}

const getWinners = (game) => {
    const state = game.getState();
    return state.winners;
}

const getPlayer = (game, playerName) => {
    const state = game.getState(playerName);
    return state.players.find(player => player.playerName === playerName);
}

const getPlayersDevidedByColor = (game) => {
    const state = game.getState();
    var redPlayers = [];
    var greenPlayers = [];
    state.players.forEach(player => {
        if (getPlayerColor(game, player.playerName) === Colors.red) {
            redPlayers.push(player.playerName);   
        }
        else {
            greenPlayers.push(player.playerName);
        }
    });
    return {redPlayers, greenPlayers};
}

const teamAgainstPlayer = (game, team, player) => {
    team.forEach(teamPlayer => {
        if (game.exists(teamPlayer) && game.exists(player)) {
            expect(game.accuse(teamPlayer, player)[0]).toBe(GameStatus.success);
        } else {
            return;
        }

        //-- expect the accuser to be in the accusers list of the accused
        if (game.exists(player)) {
            expect(getAccusers(game, player)).toContain(teamPlayer);
        }
    });
}



const getAccusers = (game, playerName) => {
    if (game.exists(playerName)) {
        return getPlayer(game, playerName).accusers;
    }
    return [];
}

const getPlayerColor = (game, playerName) => {
    return getPlayer(game, playerName).color;
}

const getColorsFromPlayerView = (game, playerName) => {
    const state = game.getState(playerName);
    return state.players.map(player => player.color);
}

const gameColors = [Colors.green, Colors.red];

test('Test joinGame and markReady', () => {
    [3, 5, 22, 473].forEach(numberOfPlayers => {
        var game = new Game(numberOfPlayers, 1); //-- game with one red
        for (let i = 0; i < numberOfPlayers; i++) {
            var playerName = `player${i}`
            expect(game.joinGame(playerName)[0]).toBe(GameStatus.success);
        }
        for (let i = 0; i < numberOfPlayers; i++) {
            var playerName = `player${i}`
            expect(game.joinGame(playerName)[0]).toBe(GameStatus.failure);
            expect(game.joinGame(playerName)[1]).toBe(GameErrorMessages.playerAlreadyExists);
        }

        for (let i = 0; i < numberOfPlayers; i++) {
            var playerName = `player${i}`
            expect(game.revealColor(playerName)[0]).toBe(GameStatus.success);
            expect(gameColors).toContain(getPlayerColor(game, "player" + i));
            if (getPlayerColor(game, playerName) === Colors.red) {
                getColorsFromPlayerView(game, playerName).forEach(color => {
                    expect(gameColors).toContain(color);
                });
            } else {
                var reds = 0;
                var greens = 0;
                var whites = 0;
                getColorsFromPlayerView(game, playerName).forEach(color => {
                    reds += color === Colors.red ? 1 : 0;
                    greens += color === Colors.green ? 1 : 0;
                    whites += color === Colors.white ? 1 : 0;
                });
                expect(reds).toBe(0);
                expect(greens).toBe(1);
                expect(whites).toBe(game.getNumberOfPlayers() - 1);
            }
        }
    });
});

test('Test game started', () => {
    [3, 5, 22, 473].forEach(numberOfPlayers => {
        // create game with one red
        var game = new Game(numberOfPlayers, 1);

        // join game
        for (let i = 0; i < numberOfPlayers; i++) {
            var playerName = `player${i}`
            expect(game.joinGame(playerName)[0]).toBe(GameStatus.success);

            // try revealing color and expect failure
            if (i < numberOfPlayers - 1) {
                expect(game.revealColor(playerName)[0]).toBe(GameStatus.failure);
                expect(game.revealColor(playerName)[1]).toBe(GameErrorMessages.notEnoughPlayersJoined);
            }
        }

        // check that game is not started
        expect(isGameStarted(game)).toBe(false);

        // reveal colors for all players
        for (let i = 0; i < numberOfPlayers; i++) {
            var playerName = `player${i}`
            expect(game.revealColor(playerName)[0]).toBe(GameStatus.success);
        }

        // check that game is started
        expect(isGameStarted(game)).toBe(true);
    });
});

test('Test colors', () => {
    [3, 4, 20, 21].forEach(numberOfPlayers => {
        /* choose three numbers of nominated number of reds: 
            1.reds = zero, 
            2. reds = some random number between 1 and less than half of the number of players
            3.randomly more than half of the players
        */
        var reds = [0, Math.floor(Math.random() * (numberOfPlayers / 2 - 1)) + 1, Math.floor(Math.random() * (numberOfPlayers / 2 - 1)) + Math.floor(numberOfPlayers / 2) + 1];
        reds.forEach(numberOfReds => {
            // construct game with the chosen number of reds
            var game = new Game(numberOfPlayers, numberOfReds);
            const gameColors = [Colors.green, Colors.red];

            // join game
            for (var i = 1; i <= numberOfPlayers; ++i) {
                game.joinGame(`p${i}`);
            }

            // reveal colors
            for (var i = 1; i <= numberOfPlayers; ++i) {
                game.revealColor(`p${i}`);
            }

            // Expect to see the asked number of reds
            for (var i = 1; i <= numberOfPlayers; ++i) {
                var reds = 0;
                var whites = 0;
                var greens = 0;
                for (var i = 1; i <= numberOfPlayers; ++i) {
                    var player = `p${i}`;
                    var playerColor = getPlayerColor(game, player);
                    reds += playerColor === Colors.red ? 1 : 0;
                    greens += playerColor === Colors.green ? 1 : 0;
                    whites += playerColor === Colors.white ? 1 : 0;
                }
                var correctedNumberOfReds = numberOfReds === 0 ? Math.floor(numberOfPlayers / 2) : Math.min(numberOfReds, Math.floor(numberOfPlayers / 2));
                if (numberOfPlayers === 2 * correctedNumberOfReds) {
                    correctedNumberOfReds -= 1;
                }

                expect(whites).toBe(0);
                expect(reds).toBe(correctedNumberOfReds);
                expect(greens).toBe(numberOfPlayers - correctedNumberOfReds);
            }
        });

    });
});

test('Test accuse against single red', () => {
    /// Create game, join players and reveal colors with one red player
    [3, 4, 15, 16].forEach((numberOfPlayers, _1, _2) => {
        var game = new Game(numberOfPlayers, 1);
        var players = [];
        for (var i = 1; i <= numberOfPlayers; ++i) {
            players.push(`p${i}`);
        }
        players.forEach((player, _, __) => {
            game.joinGame(player);
        });
        players.forEach((player, _, __) => {
            game.revealColor(player);
        });

        //-- find the red player
        var redPlayer = "";
        players.forEach(player => {
            if (getPlayerColor(game, player) === Colors.red) {
                redPlayer = player;
            }
        });
        // all players except the red player accuse against the red player
        teamAgainstPlayer(game, players.filter(player => player !== redPlayer), redPlayer);

        //-- expect the game to be over and the greens to win.
        expect(isGameOver(game)).toBe(true);
        expect(getWinners(game)).toBe(Colors.green);
    });
});

test('Test accuse against multiple reds', () => {
    /// Create game, join players and reveal colors with one red player
    [3, 4, 15, 16].forEach((numberOfPlayers, _1, _2) => {
        var game = new Game(numberOfPlayers);
        var players = [];
        for (var i = 1; i <= numberOfPlayers; ++i) {
            players.push(`p${i}`);
        }
        players.forEach((player, _, __) => {
            game.joinGame(player);
        });
        players.forEach((player, _, __) => {
            game.revealColor(player);
        });

        //-- get red and green players
        const {redPlayers, greenPlayers} = getPlayersDevidedByColor(game);

        // all players except the red players accuse against the red player
        redPlayers.forEach(redPlayer => {
            teamAgainstPlayer(game, greenPlayers, redPlayer);
        });

        //-- expect the game to be over and the greens to win.
        expect(isGameOver(game)).toBe(true);
        expect(getWinners(game)).toBe(Colors.green);
    });
});

test('Test accuse against greens', () => {
    [3, 4, 15, 44].forEach(numberOfPlayers => {
        //-- create a list with a numinated number of reds
        var numberOfReds = [];
        var maxNumberOfReds = Math.floor(numberOfPlayers / 2);
        if (numberOfPlayers === 2 * maxNumberOfReds) {
            maxNumberOfReds -= 1;
        }
        for (var i = 1; i <= maxNumberOfReds; ++i) {
            numberOfReds.push(i);
        }
        numberOfReds.forEach(numberOfReds => {
            //-- create game, oin players and reveal colors
            var game = new Game(numberOfPlayers, numberOfReds);
            var players = [];
            for (var i = 1; i <= numberOfPlayers; ++i) {
                players.push(`p${i}`);
            }
            players.forEach((player, _, __) => {
                game.joinGame(player);
            });
            players.forEach((player, _, __) => {
                game.revealColor(player);
            });

            var {redPlayers, greenPlayers} = getPlayersDevidedByColor(game);
            while(redPlayers.length < greenPlayers.length) {
                
                //-- build two teams, one consisting reds and greens and the other only greens s.t. the varied team is bigger   
                var variedTeam = [...redPlayers];
                var sameTeam = [...greenPlayers];
                
                while (variedTeam.length <= sameTeam.length) {
                    variedTeam.push(sameTeam.pop());
                }
                
                //-- same team will vote against variedTeam players
                variedTeam.forEach(player => {
                    teamAgainstPlayer(game, sameTeam, player);
                    
                    //-- expect the player not to be eliminated
                    expect(game.exists(player)).toBe(true);
                });
                
                //-- varied team will vote against sameTeam players
                sameTeam.forEach(player => {
                    teamAgainstPlayer(game, variedTeam, player);
                    
                    //-- expect the player to be eliminated
                    expect(game.exists(player)).toBe(false);
                });
                redPlayers = getPlayersDevidedByColor(game).redPlayers;
                greenPlayers = getPlayersDevidedByColor(game).greenPlayers;
            }
            
            //-- expect game to be over and reds to win
            expect(isGameOver(game)).toBe(true);
            expect(getWinners(game)).toBe(Colors.red);
        });
    });
});

test('Test clearAccusition and change accuse', () => {
    [3, 17 ,244].forEach(numberOfPlayers => {
        //-- create a game, join players and reveal colors
        var game = new Game(numberOfPlayers);
        for (var i = 1; i <= numberOfPlayers; ++i) {
            game.joinGame(`p${i}`);
        }
        for (var i = 1; i <= numberOfPlayers; ++i) {
            var player = `p${i}`;
            game.revealColor(player);
        }

        //-- get red and green players
        const {redPlayers, greenPlayers} = getPlayersDevidedByColor(game);
        
        //-- first red player will accuse to first green player, and expect success
        expect(game.accuse(redPlayers[0], greenPlayers[0])[0]).toBe(GameStatus.success);

        //-- expect the accuser to be in the accusers list of the accused
        expect(getAccusers(game, greenPlayers[0])).toContain(redPlayers[0]);

        //-- first red player will accuse second green player now, and expect success
        expect(game.accuse(redPlayers[0], greenPlayers[1])[0]).toBe(GameStatus.success);

        //-- expect the accuser to be in the accusers list of the accused,
        //-- and the first green player not to be in the accusers list of the accused
        expect(getAccusers(game, greenPlayers[1])).toContain(redPlayers[0]);
        expect(getAccusers(game, greenPlayers[0])).not.toContain(redPlayers[0]);

        //-- clear accusition of first red player against first green player
        expect(game.clearAccusition(redPlayers[0])[0]).toBe(GameStatus.success);

        //-- expect the accuser not to be in the accusers list of the accused
        expect(getAccusers(game, greenPlayers[1])).not.toContain(redPlayers[0]);
    });
});