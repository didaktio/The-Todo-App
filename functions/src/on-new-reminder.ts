import { functions, regions, admin } from './config';
import { Reminder, UserDocument } from 'utils';


import * as nodemailer from 'nodemailer';


// Create transporter instance: secure SMTP connection with provider, authenticate credentials; then we're all set to send!
const transporter = nodemailer.createTransport({
    host: 'smtp.ionos.co.uk',
    auth: functions.config().email
});

/**
 * Runs when a new reminder object is added to any user's `reminders` subcollection. It will send an email and/or a notification
 * to the user.
 */
export const onNewReminder = functions.region(regions.default).firestore.document('users/{userId}/reminders/{reminderId}')
    .onCreate(async (data, context) => {

        const { todo, user, deadline, pushNotification: notification } = data.data() as Reminder,
            { preferences, deviceTokens } = (await admin.firestore().doc(`users/${user.uid}`).get()).data() as UserDocument,
            promises: any[] = [];

        if (preferences.reminders.emails) promises.push(
            transporter.sendMail({
                messageId: context.params.reminderId,
                from: 'The Todo App <reminders@thetodoapp.com>',
                subject: `Reminder: ${todo.title}`,
                to: user.email,
                priority: todo.highPriority ? 'high' : 'normal',
                text: `Hi ${user.name || user.email}, \n
                 You wanted the following task completed by ${deadline.formattedDate}:\n
                 ${todo.title} \n \n
                 Notes: \n
                 ${todo.notes} \n \n
                 Need more time? Jump into the app to complete or edit this task.`,
                html: `
                <p>Hi ${user.name || user.email},</p>

                <p> You wanted the following task completed by <strong>${deadline.formattedDate}</strong>.</p>

                <div style="text-align:center">
                    <div style="width:fit-content;margin:24pxauto;padding:0px 8px;border:1px solid lightgray;">
                    <h3>${todo.highPriority ? '<div style="color:red;font-size:0.7em;font-weight:normal;"> (High Priority)</div>' : ''}${todo.title}</h3>
                    <div>${todo.notes}</div>
                </div>

                </div>
                <p>Need <em>more</em> time? You can edit this task in the <a href="https://thetodoapp.com/;todo=${todo.id}" target="blank" rel="noopener">app</a>.</p>
                `
            })
        );


        if (preferences.reminders.notifications) promises.push(
            admin.messaging().sendMulticast(
                {
                    tokens: deviceTokens,
                    notification,

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
                    }
                }
            )
        )
    })