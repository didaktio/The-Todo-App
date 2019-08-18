import { functions, regions, transporter } from './config';
import { Reminder } from './models';


// Triggers when a new reminder object is added to any user's 'reminders' subcollection
export const sendReminderEmail = functions.region(regions.default).firestore.document('users/{userId}/reminders/{reminderId}')
    .onCreate((data, context) => {

        const { todo, user, completeBy } = data.data() as Reminder;

        // Stop here if user has disabled reminder emails
        if(!user.preferences.reminders.emails) return null;

        return transporter.sendMail({
            messageId: context.params.reminderId,
            from: 'The Todo App <reminders@thetodoapp.com>',
            subject: `Reminder: ${todo.title}`,
            to: user.email,
            priority: todo.highPriority ? 'high' : 'normal',
            text: `Hi ${user.name || user.email}, \n
             This is a reminder that you wanted the following task done by ${completeBy.formattedDate}:\n
             ${todo.title} \n \n
             Notes: \n
             ${todo.notes} \n \n
             Jump into the app to complete or edit this task.`,
            html: `
            <p>Hi ${user.name || user.email},<br>
            Just a little reminder that you wanted the following task completed by ${completeBy.formattedDate}:</p>
            <div style="width:fit-content;margin:24px auto;">
                <h3>${todo.title}${todo.highPriority ? '<span style="color:red;font-size:0.7em;font-weight:normal;"> (High Priority)</span>' : ''}</h3>
                <p>${todo.notes}</p>
            </div>
            <span>Jump into the app to complete or edit this task.</span>
            `
        });
    })