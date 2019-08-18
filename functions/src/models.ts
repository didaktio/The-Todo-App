export interface EditTodoFormData {
    title: string;
    notes: string;
    dateDue?: DateDue;
    highPriority: boolean;
    reminders: any;
};

export interface TodoItem {
    title: string;
    notes: string;
    dateAdded: string;
    dateDue?: DateDue;
    highPriority?: boolean;
    lastEdited?: string;
    history: (TodoItem & { changeMade: string; })[];
    complete?: boolean;
    id?: string;
    reminders: {
        title: string;
        date: string;
    }[];
};

export interface DateDue {
    date: string;
    withTime?: boolean;
}

export interface TodoUser {
    todos: {
        pending: TodoItem[];
        completed: TodoItem[];
    };
    trash: TodoItem[];
    general: {
        uid: string;
        email: string;
        name: string;
        preferences: {
            reminders: {
                emails: boolean;
                notifications: boolean;
            };
        };
    };
    settings: {
        theme: any;
        css: string;
    };
    createdAt: any;
    reminders: string[];
    deviceToken: string;
}

export interface Reminder {
    todo: TodoItem;
    user: TodoUser['general'];
    completeBy:{
        formattedDate: string;
        minutesToExpiry: number;
    };
}