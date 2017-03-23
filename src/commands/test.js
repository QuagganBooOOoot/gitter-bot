// sends a random test message
export function test(room, message) {
    const responses = [
        'HellooOOoo.', 'Hoo!', 'How dooo you doo?', 'Oho! Nice teeth.', 'Stay. Eat. Be well.'
    ];

    const response = responses[Math.floor(Math.random()*responses.length)];

    room.send(response);
}
