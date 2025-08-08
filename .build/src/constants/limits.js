"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="1e7763c9-3906-5ddf-932a-02f4857f5e6a")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    free: {
        panels: {
            amount: 10,
            embeds: 3,
        },
        applications: {
            amount: 10,
            questions: {
                amount: 5,
            },
        },
        ticketTriggers: {
            amount: 50,
        },
        groups: {
            amount: 50,
        },
        autoResponders: {
            amount: 10,
            extraChannels: 10,
        },
        tags: {
            amount: 25,
        },
        permissions: {
            amount: 10,
        },
        roles: {
            admin: {
                amount: 10,
            },
            staff: {
                amount: 10,
            },
            blocked: {
                amount: 10,
            },
        },
        channels: {
            movableCategories: 10,
        },
        messages: {
            amount: 250,
            feedback: {
                length: 200,
            },
            content: {
                length: 1500,
            },
            embed: {
                title: {
                    length: 100,
                },
                description: {
                    length: 1500,
                },
                author: {
                    length: 100,
                },
                footer: {
                    length: 50,
                },
                field: {
                    name: {
                        length: 100,
                    },
                    value: {
                        length: 1000,
                    },
                },
            },
        },
    },
};
//# sourceMappingURL=/src/constants/limits.js.map
//# debugId=1e7763c9-3906-5ddf-932a-02f4857f5e6a
