import { functions, regions, admin } from './config';
import { TodoUser } from 'todo-utils';

import { differenceInMinutes, format } from 'date-fns';


// Runs every minute
export const pushReminder = functions.region(regions.default).pubsub.schedule('every 1 minutes')
    .onRun(async context => {

        const nowAsDate = new Date();
        nowAsDate.setSeconds(0);
        nowAsDate.setMilliseconds(0);
        const nowAsISO = nowAsDate.toISOString();

        // Find user documents where the reminders array contains the current UTC time as an ISO string.
        const matches = (await admin.firestore().collection('users')
            .where('reminders', 'array-contains', nowAsISO)
            .get()).docs.map(doc => ({ ...doc.data(), ref: doc.ref })) as (TodoUser & { ref: FirebaseFirestore.DocumentReference })[];

        const promises = [] as any[];

        for (const user of matches) {
            const todo = user.todos.pending.filter(t => t.dateDue && t.reminders.map(r => r.date).includes(nowAsISO)).pop();
            if (!todo || !todo.dateDue) break;

            const minutesToExpiry = Math.abs(differenceInMinutes(new Date(todo.dateDue.date), nowAsDate));
            const formattedDate = format(new Date(todo.dateDue.date), 'E do MMM yy, h:mma');

            const notification = {
                title: todo.title,
                body: minutesToExpiry < 60 ? `Due Time is in ${minutesToExpiry} minutes!` : `Expires: ${formattedDate} )}`,
            };

            promises.push(

                // Push message to device
                ...(user.general.preferences.reminders.notifications) ? [admin.messaging().send({
                    notification: {
                        title: todo.title,
                        body: minutesToExpiry < 60 ? `Due Time is in ${minutesToExpiry} minutes!` : `Expires: ${formattedDate} )}`,
                    },

                    // Android-specific config
                    android: {
                        notification,
                        priority: todo.highPriority ? 'high' : 'normal'
                    },

                    // Apple-specific config
                    apns: {
                        payload: {
                            aps: {
                                alert: {
                                    ...notification
                                }
                            }
                        }
                    },

                    // Web-specific config
                    webpush: {
                        fcmOptions: { link: `https://thetodoapp.com/;todo=${todo.id}` },
                        notification: {
                            requireInteraction: true,
                            actions: [
                                {
                                    action: 'markAsCompleted',
                                    title: 'Mark As Done'
                                }
                            ],
                            vibrate: [1000, 3000, 1000],
                            icon: 'https://firebasestorage.googleapis.com/v0/b/todo-e6261.appspot.com/o/logo%2FLogo.png?alt=media&token=c243bf44-68b4-49a8-8708-625b026266f2',
                            badge: 'https://firebasestorage.googleapis.com/v0/b/todo-e6261.appspot.com/o/logo%2FLogo.png?alt=media&token=c243bf44-68b4-49a8-8708-625b026266f2',
                        },
                    },
                    token: user.deviceToken,
                })] : [],

                // Remove obsolete reminder date
                user.ref.set({
                    reminders: admin.firestore.FieldValue.arrayRemove(nowAsISO)
                }, { merge: true }),

                // Add reminder object to 'reminders' subcollection
                user.ref.collection('reminders').add({
                    todo,
                    user: { ...user.general },
                    completeBy: { minutesToExpiry, formattedDate }
                })
            );
        }
        return Promise.all(promises);
    });