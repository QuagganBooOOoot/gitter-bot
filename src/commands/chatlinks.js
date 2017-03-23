import uniq from 'lodash/uniq';
import { decode } from 'gw2e-chat-codes'
import { markdownTable } from '../utils';

export function chatlinks(room, message) {
    const rows = [];

    uniq(message.text.match(/\[&[a-zA-Z0-9+\/]+=*\]/ig)).forEach(link => {
        const data = decode(link);

        switch(data.type) {
            case 'item':
            case 'map':
            case 'skill':
            case 'trait':
            case 'recipe':
            case 'skin':
            case 'outfit':
                link = `[${link}](https://api.guildwars2.com/v2/${data.type}s/${data.id})`;
                break;
        }

        rows.push([link, JSON.stringify(data)]);
    });

    if(rows.length > 0) {
        room.send(markdownTable(['Chatlink', 'Data'], rows));
    }
}