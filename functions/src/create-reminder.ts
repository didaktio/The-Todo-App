import { functions, regions, admin, DocumentReference } from './config';
import { UserDocument, Reminder } from 'utils';

import { differenceInMinutes, format } from 'date-fns';

// Runs every minute
export const createReminder = functions.region(regions.default).pubsub.schedule('every 1 minutes')
    .onRun(async context => {

        const nowAsDate = new Date();
        nowAsDate.setSeconds(0);
        nowAsDate.setMilliseconds(0);
        const nowAsISO = nowAsDate.toISOString();

        // Find user documents where the reminders array contains the current UTC time as an ISO string.
        const matches = (await admin.firestore().collection('users')
            .where('reminders', 'array-contains', nowAsISO)
            .get()).docs.map(doc => {
                const d = doc.data() as UserDocument & { ref: DocumentReference };
                d.ref = doc.ref;
                return d;
            }),
            promises = [] as any[];

        for (const user of matches.filter(u => u.preferences.reminders.notifications || u.preferences.reminders.emails)) {
            const todo = user.todos.pending.filter(t => t.deadline && t.reminders.map(r => r.date).includes(nowAsISO)).pop();
            if (!todo) continue;

            const minutesToExpiry = Math.abs(differenceInMinutes(new Date(todo.deadline!.date), nowAsDate)),
                formattedDate = format(new Date(todo.deadline!.date), 'E do MMM yy, h:mma');

            promises.push(
                user.ref.set({
                    reminders: admin.firestore.FieldValue.arrayRemove(nowAsISO)
                }, { merge: true })
            );

            const reminder = {
                created: nowAsISO,
                todo,
                user: { name: user.name, email: user.email, uid: user.uid, preferences: user.preferences, deviceTokens: user.deviceTokens },
                deadline: { minutesToExpiry, formattedDate },
                pushNotification: {
                    title: todo.title,
                    body: minutesToExpiry < 60 ? `Due Time is in ${minutesToExpiry} minutes!` : `Expires: ${formattedDate} )}`,
                }
            } as Reminder;

            promises.push(user.ref.collection('reminders').add(reminder));
        }
return Promise.all(promises);
    });