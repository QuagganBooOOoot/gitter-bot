import Gitter from 'node-gitter';
import GitterBot from './bot';
import config from '../config.json';
import { authGet, authSet, chatlinks, help, rank, shrug, test } from './commands';

// create gitter bot
const gitter = new Gitter(config.token);
const bot = new GitterBot(gitter);

// join all rooms configured in the config
config.rooms.forEach(room => bot.join(room));

// handle new messages
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
    } else if (message.text === '!shrug' || message.text === '/shrug') {
        shrug(room, message);
    } else {
        chatlinks(room, message);
    }
});
