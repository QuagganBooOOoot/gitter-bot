import { getApiKey, gw2 } from '../gw2'

// shows achievement progress
export function achievement(room, message) {
    const achievementId = message.text.split(' ', 2)[1];

    gw2.achievements().get(achievementId).then(achievement => {
        getApiKey(message.fromUser.id).then(apiKey => {
            gw2.authenticate(apiKey).account().achievements().get(achievementId).then(progress => {
                room.send(`**${achievement.name}**  \n${achievement.description}\n\nYour Progress: ${progress.current} / ${progress.max}`);
            }).catch(error => {
                room.send(`**${achievement.name}**  \n${achievement.description}\n\n*No progress on your account (${error})*`)
            })
        }).catch(error => {
            room.send(`**${achievement.name}**  \n${achievement.description}`)
        });
    }).catch(error => room.send(`Oah! Quaggan couldn't connect to the GW2 Api (${error}).`));
}
