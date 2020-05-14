import { UserDocument } from 'utils';

export const USER_TEMPLATE = {
    object: 'user',
    name: '',
    email: '',
    uid: '',
    path: '',
    id: '',
    preferences: {
        reminders: {
            emails: true,
            notifications: true
        }
    },
    todos: {
        pending: [],
        completed: []
    },
    trash: [],
    settings: {
        theme: null,
        css: null,
    },
    created: new Date().toISOString(),
    reminders: [],
    deviceTokens: []
} as UserDocument;