import path from 'path';
import fs from 'fs';

const getApiKeyFileName = userId => path.join(__dirname, '..', 'users', userId);

export const getApiKey = userId =>
    new Promise((resolve, reject) =>
        fs.readFile(getApiKeyFileName(userId), (err, apiKey) =>
            err ? reject(err) : resolve(apiKey.toString())
        )
    )

export const setApiKey = userId =>
    fs.writeFile(getApiKeyFileName(userId), apiKey)

export const markdownTable = (head, body) => {
    return head.join(' | ')+'\n'+head.map(x => '---').join(' | ')+'\n'+body.map(row => row.join(' | ')).join('\n');
}
