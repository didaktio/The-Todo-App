import { TodoUser } from './models';

export const USER_TEMPLATE = {
    todos: {
        pending: [],
        completed: []
    },
    trash: [],
    general: {
        name,
        email: '',
        uid: '',
        preferences: {
            reminders: {
                emails: true,
                notifications: true
            }
        }
    },
    settings: {
        theme: null,
        css: null,
    },
    createdAt: new Date(),
    reminders: [],
    deviceToken: ''
} as TodoUser;