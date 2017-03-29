import { getApiKey, gw2 } from '../gw2'

// shows achievement progress
export function achievement(room, message) {
    const achievementId = message.text.split(' ', 3)[1];
    const userId = message.mentions[0] ? message.mentions[0].userId : message.fromUser.id;
    const userName = message.mentions[0] ? message.mentions[0].screenName : message.fromUser.username;

    gw2.achievements().get(achievementId).then(achievement => {
        getApiKey(userId).then(apiKey => {
            gw2.authenticate(apiKey).account().achievements().get(achievementId).then(progress => {
                room.send(`**${achievement.name}**  \n${achievement.description}\n\n@${userName}'s progress: ${progress.current}/${progress.max}`);
            }).catch(error => {
                room.send(`**${achievement.name}**  \n${achievement.description}\n\n*No progress for @${userName} (${error})*`)
            })
        }).catch(error => {
            room.send(`**${achievement.name}**  \n${achievement.description}`)
        });
    }).catch(error => room.send(`Oah! Quaggan couldn't connect to the GW2 Api (${error}).`));
}
