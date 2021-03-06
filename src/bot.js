"use strict";

const OPERATION_CREATE = 'create';
const OPERATION_UPDATE = 'update';
const OPERATION_DELETE = 'delete';
const OPERATION_PATCH = 'patch';

export default class GitterBot {
    constructor(gitter) {
        this.gitter = gitter;
        this.user = undefined;
        this.activeRooms = {};

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
                    rooms.filter(room => room.oneToOne && !this.activeRooms.hasOwnProperty(room.url.substr(1)))
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

    getRoom(id) {
        return this.activeRooms[id];
    }

    handleRoomJoined(room) {
        const slug = room.url.substr(1);
        console.log(`Joined room ${room.name} (${slug}).`);
        this.activeRooms[slug] = room;

        const handlers = this.handlers.message;
        const stream = room.streaming().chatMessages();

        stream.on('chatMessages', message => {
            const ignore = message.model.fromUser && message.model.fromUser.id === this.user.id;

            switch(message.operation) {
                case OPERATION_CREATE:
                    console.log(`[${slug}] ${message.model.fromUser.username}: ${message.model.text}`);
                    this.user.markAsRead(room.id, [message.model.id]);
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
