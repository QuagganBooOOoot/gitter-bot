import Gitter from 'node-gitter';
import mkdirp from 'mkdirp';
import GitterBot from './bot';
import config from '../config.json';
import { achievement, authGet, authSet, chatlinks, forumLink, forumNew, help, rank, shrug, tableflip, fire, heart, test } from './commands';

// create directories
mkdirp('./var/users');

// create gitter bot
const gitter = new Gitter(config.token);
const bot = new GitterBot(gitter);

// join all rooms configured in the config
config.rooms.forEach(room => bot.join(room));

// wait 5s, then check for new forum posts
setTimeout(() => forumNew(bot), 5000) 

// handle new messages
bot.onMessageCreated((room, message) => {
    if (message.text === 'hi' || message.text === '!test') {
        test(room, message);
    } else if (message.text === '!help') {
        help(room, message);
    } else if (message.text.indexOf('!achievement ') === 0) {
        achievement(room, message);
    } else if (message.text === '!auth') {
        authGet(room, message);
    } else if (message.text.indexOf('!auth ') === 0) {
        authSet(room, message);
    } else if (message.text === '!rank') {
        rank(room, message);
    } else if (message.text === '!shrug' || message.text === '/shrug') {
        shrug(room, message);
    } else if (message.text === '!tableflip' || message.text === '/tableflip') {
        tableflip(room, message);
    } else if (message.text.trim() === ':fire:') {
        fire(room, message);
    } else if (message.text.trim() === ':heart:' || message.text.trim() === '<3') {
        heart(room, message);
    } else {
        chatlinks(room, message);
        forumLink(room, message);
    }
});
