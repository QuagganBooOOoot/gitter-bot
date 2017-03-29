import { markdownTable } from '../utils';

// shows a list of available commands
export function help(room, message) {
    room.send(markdownTable(['Command', 'Description'], [
        ['`!auth`', 'Returns your account name.'],
        ['`!auth <API-KEY>`', 'Sets your API key.'],
        ['`!achievement <ID>`', 'Shows your achievement progress and compares it with all mentioned users.'],
        ['`!rank`', 'Returns your WvW rank.'],
    ])+'\n\nRequest more features in [Quaggans repository](https://github.com/QuagganBooOOoot/gitter-bot/issues).');
}
