import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin';
admin.initializeApp();

export { admin };
export { functions };


import * as nodemailer from 'nodemailer';
// Retrieve email address (user) and password (pass) from function config object.
const { user, pass } = functions.config().email,

// Create transporter instance: secure SMTP connection with provider, authenticate credentials; then we're all set to send!
    transporter = nodemailer.createTransport({
        host: 'smtp.ionos.co.uk',
        auth: { user, pass }
    });
export { transporter };


export const regions = {
    default: 'europe-west2'
} as const;