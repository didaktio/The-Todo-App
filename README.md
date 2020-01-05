# The Todo App
Because Why Not?

## Before Getting Started
The Todo App is a real-world project. It is live right now at thetodoapp.com. And, at least for the time being, this is the main repo. What this means is that the code is in a *constant* state of evolution, and therefore may be different to what is covered in the course. 

The tutorials in the course were intended to be followed along, and to shed light on how ideas move from birth to something tangible and real. Cloning this repo may still useful, and indeed, comparing the course code (as a result of you following along) with how things look today might indeed be a very fruitful learning experience. 

Following the tutorial exactly will still work and get you to the stage reached in the last video. The concetps learned are also not going away. But most likely, the way you want to use this repo is as a reference. With every update, new feature, and bug fix, the code will look less and less like the code in the tutorial. This is not something that can be helped; it's the nature of development.

## Getting Started
1) Clone or download the repo into a fresh folder on your machine.
2) Run `npm install` from the project root.
3) Run `npm install` from the functions directory root.
4) Add your own Firebase project keys to the `firebaseConfig` object in `environments.ts` and `environments.prod.ts`. (This is covered in the course videos.)
5) Go!

## Ideas
Whether you've followed the course videos and have your own code base or have cloned this repo, what follows is some things you can try implementing on your own. This will allow you not just to advance your skill but put your own stamp on the project.
* A subscription service that enables more fine-grained notifications, personalisation, categorisation, more detailed logging, and so on.
* Offer Freemium and Premium, or trial-based subscriptions. The way to do this is with Stripe (wayyy more features; steeper learning curve; incredible team) or PayPal (less going on; easier to add).
* Integrate some AI API, like Alexa or Cortana.
* Improve the signup experience.
* Personalised notifications.
* 10x the design.
* Use Ionic's brilliant Capacitor to convert the code base to native applications for Desktop, Android and iOS.
* Personalised themes.
* Integrate commonly used calendars like Google Calendar or the native iOS Calendar.

## Troubleshooting
* A white screen on first run might mean you haven't added Firebase keys to the `firebaseConfig` of the `environments` file(s). You can find these in the *Add App* feature in the Firebase Console.
* If you've updated dependencies and are running into problems, delete `node_modules` and replace your local `package-lock.json` with the one included in the repo. Then run `npm install` and try again.
