import { requireApiKey, gw2 } from '../gw2'

// shows the users wvw rank
export function rank(room, message) {
    return requireApiKey(message.fromUser.id, room, message)
        .then(apiKey => gw2.authenticate(apiKey).account().get()
            .then(account => room.send(account.wvw_rank
                ? `Oooo, @${message.fromUser.username}. Your WvW rank is ${findRank(account.wvw_rank)}.`
                : `Foo! @${message.fromUser.username}! The API key doesn't have the required permissions.`
            ))
            .catch(error => room.send(`Oah! Quaggan couldn't connect to the GW2 Api (${error}).`))
        )
}


// TODO: use API (wvw ranks wasn't released yet when I wrote this)
var wvwRanks = require('./wvw_ranks.json');
function findRank(rank) {
    return !wvwRanks ? rank : (wvwRanks.reduce((a,b) => b.min_rank < rank ? b : a).title + ` (${rank})`);
}
