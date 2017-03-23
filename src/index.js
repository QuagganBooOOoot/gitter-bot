"use strict";

import Gitter from 'node-gitter';
import GitterBot from './bot';
import gw2client from 'gw2api-client';
import config from '../config.json';
import { getApiKey, setApiKey, markdownTable } from './utils';

const gitter = new Gitter(config.token);
const bot = new GitterBot(gitter);
const gw2 = gw2client();

config.rooms.forEach(room => bot.join(room));

bot.onMessageCreated((room, message) => {
    if (message.text === 'hi' || message.text === '!test') {
        test(room, message);
    } else if (message.text === '!help') {
        help(room, message);
    } else if (message.text === '!auth') {
        authGet(room, message);
    } else if (message.text.indexOf('!auth ') === 0) {
        authSet(room, message);
    } else if (message.text === '!rank') {
        rank(room, message);
    }
});

// gets account name
function authGet(room, message) {
    getApiKey(message.fromUser.id)
        .then(apiKey => gw2.authenticate(apiKey).account().get()
            .then(account => room.send(`Hooo, @${message.fromUser.username}. Quaggan knows you as *${account.name}*.`))
            .catch(error => room.send(`Oah! Quaggan couldn't connect to the GW2 Api (${error}).`))
        )
        .catch(apiKey => room.send(`Noooo @${message.fromUser.username}! Quaggan doesn't have your API key yet. Use \`!auth <API-Key>\` to link your API key.`));
}

// sets api key
function authSet(room, message) {
    const apiKey = message.text.split(' ')[1];
    gw2.authenticate(apiKey).account().get()
        .then(account => {
            room.send(`Coo @${message.fromUser.username}! Quaggan knows you are *${account.name}* now. It's so exciting!`);
            setApiKey(message.fromUser.id, apiKey);
        })
        .catch(error => room.send(`Oah! Quaggan couldn't verify you API key (${error}).`))
}

// shows the users wvw rank
function rank(room, message) {
    getApiKey(message.fromUser.id)
        .then(apiKey => gw2.authenticate(apiKey).account().get()
            .then(account => room.send(account.wvw_rank
                ? `Oooo, @${message.fromUser.username}. Your WvW rank is ${findRank(account.wvw_rank)}.`
                : `Foo! @${message.fromUser.username}! The API key doesn't have the required permissions.`
            ))
            .catch(error => room.send(`Oah! Quaggan couldn't connect to the GW2 Api (${error}).`))
        )
        .catch(apiKey => room.send(`Noooo @${message.fromUser.username}! Quaggan doesn't have your API key yet. Use \`!auth <API-Key>\` to link your API key.`))
}

// TODO: use API (wvw ranks wasn't released yet when I wrote this)
var wvwRanks = require('./wvw_ranks.json');
function findRank(rank) {
    return !wvwRanks ? rank : (wvwRanks.reduce((a,b) => b.min_rank < rank ? b : a).title + ` (${rank})`);
}

// shows a list of available commands
function help(room, message) {
    room.send(markdownTable(['Command', 'Description'], [
        ['`!auth`', 'Returns your account name.'],
        ['`!auth <API-KEY>`', 'Sets your API key.'],
        ['`!rank`', 'Returns your WvW rank.'],
    ])+'\n\nRequest more features in [Quaggans repository](https://github.com/QuagganBooOOoot/gitter-bot/issues).');
}

// sends a random test message
function test(room, message) {
    const responses = [
        'HellooOOoo.', 'Hoo!', 'How dooo you doo?', 'Oho! Nice teeth.', 'Stay. Eat. Be well.'
    ];

    const response = responses[Math.floor(Math.random()*responses.length)];

    room.send(response);
}
