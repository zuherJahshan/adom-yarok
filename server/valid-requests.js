import e from "express";

const ValidRequests = new Map();

// The map will be filled with an object that consists {httpMethod, path, method} as a key and an object specifying
//-- the fields of the data object as a value.
ValidRequests.set(JSON.stringify({httpMethod: 'POST', path: '/games', method: 'joinGame'}),
{
    playerName: true
});

ValidRequests.set(JSON.stringify({httpMethod: 'POST', path: '/games', method: 'revealColor'}),
{
    playerName: true
});

ValidRequests.set(JSON.stringify({httpMethod: 'POST', path: '/games', method: 'accuse'}),
{
    playerName: true,
    accusedPlayerName: true
});

ValidRequests.set(JSON.stringify({httpMethod: 'POST', path: '/games', method: 'clearAccusition'}),
{
    playerName: true
});

//-- httpMethod is a string
//-- path is a string
//-- method is a string
//-- data is an object

ValidRequests.set(JSON.stringify({httpMethod: 'POST', path: '/games', method: 'getState'}),
{
    playerName: true
});

const isValidRequest = (httpMethod, path, method, data) => {
    //-- check if the object {httpMethod, path, method} exists in the map, if,
    //-- check if the value of this key ({httpMethod, path, method}) has the same fields as the data object
    //-- if yes, return true
    //-- if no, return false
    const key = {httpMethod, path, method};
    const value = ValidRequests.get(JSON.stringify(key));
    if (value) {

        return Object.keys(data).every(key => value[key]);
    }
}

export default isValidRequest;