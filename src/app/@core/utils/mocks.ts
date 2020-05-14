import { TodoItem } from 'utils';
import { subDays, addDays, addMinutes } from 'date-fns';

const genID = () => Math.random().toString(36).substring(8);

const today = new Date();
export const TODOS_MOCK: TodoItem[] = [
    {
        title: 'Email Emily',
        notes: 'Inform about nxt weeks appointment, say hi to family',
        created: subDays(today, 1).toISOString(),
        deadline: {
            date: addDays(today, 2).toISOString()
        },
        highPriority: true,
        history: [],
        id: genID(),
        reminders: [
            {
                title: 'Test Title',
                date: addMinutes(today, 30).toISOString()
            }
        ]
    },
    {
        title: 'Purchase party present for Preston ',
        notes: 'He likes dark choc and bordeaux',
        created: subDays(today, 2).toISOString(),
        highPriority: true,
        history: [],
        id: genID(),
        reminders: []
    },
    {
        title: `Send Sean's soccer subs`,
        notes: '£15 per month, £40 for 3 months',
        created: today.toISOString(),
        history: [],
        id: genID(),
        reminders: []
    },
    {
        title: 'Apply for Acting Audition',
        notes: 'Application is £5, auditions are in Greenwood, filming is global!!',
        created: subDays(today, 5).toISOString(),
        deadline: {
            date: addDays(today, 10).toISOString()
        },
        history: [],
        id: genID(),
        reminders: []
    },
];