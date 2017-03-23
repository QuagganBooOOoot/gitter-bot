"use strict";

const OPERATION_CREATE = 'create';
const OPERATION_UPDATE = 'update';
const OPERATION_DELETE = 'delete';
const OPERATION_PATCH = 'patch';

export default class GitterBot {
    constructor(gitter) {
        this.gitter = gitter;
        this.user = undefined;
        this.activeRooms = [];

        this.handlers = {
            message: {
                created: [],
                updated: [],
                deleted: []
            }
        }

        this.init();
    }

    init() {
        this.gitter.currentUser().then(user => {
            console.log(`Running as ${user.username} (${user.id})`);
            this.user = user;

            user.rooms().then(rooms => {
                //console.log('rooms:', rooms.map(room => room.name).join(', '));

                // join all private conversations
                rooms.filter(room => room.oneToOne)
                    .forEach(room => this.join(room.url.substr(1)));
            });

            // check for new 1to1 conversations every 10 seconds
            setInterval(() => {
                user.rooms().then(rooms => {
                    rooms.filter(room => room.oneToOne && this.activeRooms.indexOf(room.id) === -1)
                        .forEach(room => this.join(room.url.substr(1)));
                });
            }, 10000);
        });
    }

    join(room) {
        this.gitter.rooms.join(room)
            .then(room => this.handleRoomJoined(room))
            .catch(error => console.error(`Could not join room ${room}:`, error))
    }

    handleRoomJoined(room) {
        console.log(`Joined room ${room.name}.`);
        this.activeRooms.push(room.id);

        const handlers = this.handlers.message;
        const stream = room.streaming().chatMessages();

        stream.on('chatMessages', message => {
            const ignore = message.model.fromUser && message.model.fromUser.id === this.user.id;

            switch(message.operation) {
                case OPERATION_CREATE:
                    console.log(`[${room.name}] ${message.model.fromUser.username}: ${message.model.text}`);
                    return ignore || this.callHandlers(handlers.created, room, message.model);
                case OPERATION_UPDATE:
                    return ignore || this.callHandlers(handlers.updated, room, message.model);
                case OPERATION_DELETE:
                    return ignore || this.callHandlers(handlers.deleted, room, message.model);
            }
        });
    }

    callHandlers(handlers, room, message) {
        handlers.forEach(handler => handler(room, message));
    }

    onMessageCreated(handler) {
        this.handlers.message.created.push(handler);
    }
}
