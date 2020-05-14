export interface TodoItem {
    title: string;
    notes: string;
    created: string;
    deadline?: Deadline;
    highPriority?: boolean;
    lastEdited?: string;
    history: (TodoItem & {
        changeMade: string;
    })[];
    complete?: boolean;
    id: string;
    reminders: {
        title: string;
        date: string;
    }[];
}

export interface Deadline {
    date: string;
    hasTime?: boolean;
}

export interface UserPreferences {
    reminders: {
        emails: boolean;
        notifications: boolean;
    };
};

export interface Todos {
    pending: TodoItem[];
    completed: TodoItem[];
};

export interface UserDocument {
    object: string;
    path: string;
    id: string;
    uid: string;
    email: string;
    name: string;
    preferences: UserPreferences;
    todos: Todos;
    trash: TodoItem[];
    settings: {
        theme: 'light' | 'dark' | 'grey' | 'sepia';
        css: string;
    };
    created: string;
    lastUpdated?: string;
    reminders: string[];
    deviceTokens: string[];
}
export interface Reminder {
    created: string;
    lastUpdated?: string;
    todo: TodoItem;
    user: { name: string; uid: string; email: string; preferences: UserPreferences; deviceTokens: string[]; };
    deadline: {
        formattedDate: string;
        minutesToExpiry: number;
    };
    pushNotification?: any;
}
