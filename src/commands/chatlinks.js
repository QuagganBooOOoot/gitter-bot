import uniq from 'lodash/uniq';
import groupBy from 'lodash/groupBy';
import map from 'lodash/map';
import keyBy from 'lodash/keyBy';
import { gw2 } from '../gw2'
import { decode } from 'gw2e-chat-codes'
import { markdownTable } from '../utils';

// creates the describing text for a chatlink (icon + name)
function text({raw, data}, details) {
    return (details.icon ? `![icon](${details.icon.replace(/^.*file\/(.*)\.png$/, 'https://darthmaim-cdn.de/gw2treasures/icons/$1-16px.png')}) ` : '')
        + (details.name || '');
}

// creates the external links for a chatlink
function externalLinks({raw, data}, details) {
    return [
        // API link
        `[A](https://api.guildwars2.com/v2/${data.type}s/${data.id})`,
        
        // GW2Treasures
        ['item', 'skill', 'trait', 'skin'].indexOf(data.type) !== -1 && `[T](https://gw2treasures.com/${data.type}/${data.id})`,
        
        // GW2Treasures for recipes (links to the output item with the recipe as scroll anchor)
        data.type === 'recipe' && `[T](https://gw2treasures.com/item/${details.output_item_id}#r${data.id})`,

        // Wiki
        `[W](http://wiki.guildwars2.com/index.php?title=Special:Search&search=${encodeURIComponent(details.name || raw)})`
    ].filter(Boolean).join(' ');
}

// handler
export function chatlinks(room, message) {

    // decode all chatlinks
    const all = uniq(message.text.match(/\[&[a-zA-Z0-9+\/]+=*\](?!`)/ig))
        .map(raw => ({ raw, data: decode(raw) }));

    // bail out of the message didn't contain any chatlinks
    if(all.length === 0) {
        return;
    }

    // load details from the api
    Promise.all(map(groupBy(all, 'data.type'), (links, type) =>
        gw2[type + 's']().many(links.map(link => link.data.id)).then(entries => ({ type, entries }))
    )).then(data => {
        // build lookup table
        data = keyBy(map(data, ({type, entries}) => ({ type, entries: keyBy(entries, 'id') })), 'type');

        // map all chat links to table rows
        const rows = all.map(link => [
            `\`${link.raw}\``,
            link.data.type,
            link.data.id,
            text(link, data[link.data.type].entries[link.data.id]),
            externalLinks(link, data[link.data.type].entries[link.data.id])
        ]);

        // send the table
        room.send(markdownTable(['link', 'type', 'id', 'info', 'links'], rows));
    });
}
