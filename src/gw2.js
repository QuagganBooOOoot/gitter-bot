import gw2client from 'gw2api-client';
import path from 'path';
import fs from 'fs';

export const gw2 = gw2client();

const getApiKeyFileName = userId => path.join(__dirname, '..', 'users', userId);

export const getApiKey = userId =>
    new Promise((resolve, reject) =>
        fs.readFile(getApiKeyFileName(userId), (err, apiKey) =>
            err ? reject(err) : resolve(apiKey.toString())
        )
    )

export const setApiKey = (userId, apiKey) =>
    fs.writeFile(getApiKeyFileName(userId), apiKey)

export function requireApiKey(userId, room, message) {
    return getApiKey(userId)
        .catch(err => room.send(`Noooo @${message.fromUser.username}! Quaggan doesn't have your API key yet. Use \`!auth <API-Key>\` to link your API key.`))
}