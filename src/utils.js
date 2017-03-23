export const markdownTable = (head, body) => {
    return head.join(' | ')+'\n'+head.map(x => '---').join(' | ')+'\n'+body.map(row => row.join(' | ')).join('\n');
}
