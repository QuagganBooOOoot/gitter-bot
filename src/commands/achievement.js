import { getApiKey, gw2 } from '../gw2'

// shows achievement progress
export function achievement(room, message) {
    const achievementId = message.text.split(' ', 3)[1];

    const users = [{ id: message.fromUser.id, name: message.fromUser.username }];
    message.mentions.forEach(user => users.push({ id: user.userId, name: user.screenName }));

    gw2.achievements().get(achievementId).then(achievement => {
        Promise.all(
            users.map(user => getApiKey(user.id)
                .then(apiKey => gw2.authenticate(apiKey).account().achievements().get(achievementId))
                .then(progress => ({ user, progress }))
                .catch(error => ({ user })))
        ).then(users => {
            room.send(
                `**${achievement.name}**  \n${achievement.description}\n\n`
                + users.map(user =>
                    user.progress
                        ? `@${user.user.name}'s progress: ${user.progress.current}/${user.progress.max}`
                        : `@${user.user.name}'s progress: Missing API key or wrong permissions.`
                ).join('\n  '));
        });
    }).catch(error => room.send(`Oah! Quaggan couldn't connect to the GW2 Api (${error}).`));
}
