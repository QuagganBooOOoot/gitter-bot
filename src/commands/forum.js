const REGEX_DISCUSSION = /^(https:\/\/en-forum\.guildwars2\.com\/discussion\/[0-9]+)/;
const REGEX_COMMENT = /^(https:\/\/en-forum\.guildwars2\.com\/discussion\/comment\/([0-9]+))/

export function forum(room, message) {
    const discussions = message.urls
        .map(url => url.url.match(REGEX_DISCUSSION))
        .filter(url => url !== null)
        .map(url => fetch(url[1] + '.json').then(r => r.json()));

    const comments = message.urls
        .map(url => url.url.match(REGEX_COMMENT))
        .filter(url => url !== null)
        .map(url => fetch(url[1] + '.json').then(r => r.json()).then(data => ({
            id: parseInt(url[2]),
            data
        })));

    Promise.all(discussions).then(data => handleDiscussion(room, data));
    Promise.all(comments).then(data => handleComments(room, data));
}

function handleDiscussion(room, discussions) {
    discussions.forEach(discussion => {
        const response = 
            `> **[${discussion.Discussion.Name}](${discussion.Discussion.Url})**  \n` + 
            `> by *${arenanet(discussion.Discussion.Roles)}${discussion.Discussion.InsertName}* in [${discussion.Category.Name}](${discussion.Category.Url})\n` + 
            '>\n>\n' + 
            discussion.Discussion.Body.trim()
                .split('\n')
                .splice(0, 10)
                .map(line => '> ' + preventAtMentions(line))
                .join('\n');

        room.send(response);
    });
}

function handleComments(room, comments) {
    comments.forEach(({data, id}) => {
        const comment = data.Comments.filter(c => c.CommentID == id)[0];

        const response = 
            `> **[Comment](https://en-forum.guildwars2.com/discussion/comment/${id}#Comment_${id})** to [${data.Discussion.Name}](${data.Discussion.Url})  \n` + 
            `> by *${arenanet(comment.Roles)}${comment.InsertName}* in [${data.Category.Name}](${data.Category.Url})\n` + 
            '>\n>\n' + 
            comment.Body.trim()
                .split('\n')
                .splice(0, 10)
                .map(line => '> ' + preventAtMentions(line))
                .join('\n');

        room.send(response);
    });
}

function preventAtMentions(text) {
    return text.replace(/(^|\s)@/g, '$1');
}

function arenanet(roles) {
    return (roles && roles[36]) ? '![(ArenaNet)](https://quagganboooooot.github.io/gitter-bot/ArenaNet.svg) ' : ''
}
