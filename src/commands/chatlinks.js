import uniq from 'lodash/uniq';
import { decode } from 'gw2e-chat-codes'
import { markdownTable } from '../utils';

export function chatlinks(room, message) {
    const rows = [];

    uniq(message.text.match(/\[&[a-zA-Z0-9+\/]+=*\]/ig)).forEach(link => {
        rows.push([link, JSON.stringify(decode(link))]);
    });

    if(rows.length > 0) {
        room.send(markdownTable(['Chatlink', 'Data'], rows));
    }
}