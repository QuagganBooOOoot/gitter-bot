import fs from 'fs';
import path from 'path';
import { handleDiscussion } from './link';
import config from '../../../config.json';

const knownFilePath = path.join(__dirname, '..', '..', '..', 'var', 'forum.json');

// 3 minutes
const TIMEOUT = 1000 * 60 * 3;

export function newForumThread(bot) {
    // load forum threads
    let known = {};

    if(fs.existsSync(knownFilePath)) {
        known = JSON.parse(fs.readFileSync(knownFilePath));
    }

    const waitForInit = Promise.all(
        Object.keys(config.forum).filter(
            (category) => !known.hasOwnProperty(category) 
        ).map(
            (category) => getDiscussions(category).then(
                (discussions) => known[category] = discussions.map(
                    (discussion) => discussion.DiscussionID
                )
            )
        )
    );

    waitForInit.then(
        () => fs.writeFile(knownFilePath, JSON.stringify(known), () => {})
    ).then(
        () => tick(bot, known)
    );
}

function tick(bot, known) {
    Promise.all(
        Object.entries(config.forum).map(
            ([category, rooms]) => getDiscussions(category).then(
                (discussions) => {
                    const newDiscussions = discussions.filter(
                        (discussion) => known[category].indexOf(discussion.DiscussionID) === -1
                    );

                    known[category] = known[category].concat(newDiscussions.map(
                        (discussion) => discussion.DiscussionID
                    ));

                    fs.writeFile(knownFilePath, JSON.stringify(known), () => {});

                    if(newDiscussions.length === 0) {
                        return Promise.resolve();
                    }

                    console.log(`${newDiscussions.length} new discussions in ${category}.`);
                    
                    return Promise.all(
                        newDiscussions.map(
                            (discussion) => fetch(discussion.Url + '.json').then((r) => r.json())
                        )
                    ).then(
                        (discussions) => {
                            rooms.map(
                                (room) => bot.getRoom(room)
                            ).forEach(
                                (room) => {
                                    const cat = discussions[0].Category;
                                    const link = `[${cat.Name}](${cat.Url})`;
                                    const text = discussions.length === 1
                                        ? 'New discussion'
                                        : `${discussions.length} new discussions`
    
                                    room.send(`${text} in ${link}:`).then(
                                        () => handleDiscussion(room, discussions)
                                    );
                                }
                            );
                        }
                    )
                }
            )
        )
    ).then(setTimeout(() => tick(bot, known), TIMEOUT));
}

function getDiscussions(category) {
    return fetch(`https://en-forum.guildwars2.com/categories/${category}.json`).then(
        (r) => r.json()
    ).then(
        ({Announcements, Discussions}) => Announcements.concat(Discussions)
    );
}
