import { gw2, setApiKey, requireApiKey } from '../gw2';

// gets account name
export function authGet(room, message) {
    return requireApiKey(message.fromUser.id, room, message)
        .then(apiKey => gw2.authenticate(apiKey).account().get()
            .then(account => room.send(`Hooo, @${message.fromUser.username}. Quaggan knows you as *${account.name}*.`))
            .catch(error => room.send(`Oah! Quaggan couldn't connect to the GW2 Api (${error}).`))
        )
}

// sets api key
export function authSet(room, message) {
    const apiKey = message.text.split(' ')[1];
    return gw2.authenticate(apiKey).account().get()
        .then(account => {
            room.send(`Coo @${message.fromUser.username}! Quaggan knows you are *${account.name}* now. It's so exciting!`);
            setApiKey(message.fromUser.id, apiKey);
        })
        .catch(error => room.send(`Oah! Quaggan couldn't verify you API key (${error}).`))
}
