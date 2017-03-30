import { getApiKey, gw2 } from '../gw2'
import pMap from 'p-map';

// shows achievement progress
export function achievement(room, message) {
    const achievementId = message.text.split(' ', 3)[1];

    const users = [{ id: message.fromUser.id, name: message.fromUser.username }];
    message.mentions.forEach(user => users.push({ id: user.userId, name: user.screenName }));

    gw2.achievements().get(achievementId).then(achievement => {
        pMap(users, user =>
            getApiKey(user.id)
                .then(apiKey => 
                    gw2.authenticate(apiKey).account().achievements().get(achievementId)
                    .then(progress => ({ user, progress }))
                    .catch(error => ({ user, error }))
                ).catch(error => ({ user, error: 'Missing API key (use `!auth <API-KEY>` to set)' }))
        ).then(users => {
            room.send(
                `**${achievement.name}**  \n${achievement.description}\n\n`
                + users.map(user =>
                    user.progress
                        ? `@${user.user.name}'s progress: ${user.progress.current}/${user.progress.max}`
                        : `@${user.user.name}'s progress: ${user.error}.`
                ).join('\n  '));
        });
    }).catch(error => room.send(`Oah! Quaggan couldn't connect to the GW2 Api (${error}).`));
}
