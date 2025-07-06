# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Running Locally

To run this application on your own computer, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or later)
- [npm](https://www.npmjs.com/) or another package manager like yarn or pnpm
- [Firebase CLI](https://firebase.google.com/docs/cli#install_the_cli)

### 1. Get the Code

Download or clone your project files to your local machine.

### 2. Install Dependencies

Navigate to your project's root directory in your terminal and run the following command to install the necessary packages:

```bash
npm install
```

### 3. Set Up Environment Variables

This project uses Firebase for its database. You'll need to connect it to your own Firebase project.

1.  Open the `.env` file in the root of your project.
2.  Follow the instructions in the file to add your Firebase project's configuration keys. You can find these in your Firebase project settings:
    - Go to your Firebase project.
    - Click the gear icon > **Project settings**.
    - In the **General** tab, scroll down to **Your apps**.
    - Select your web app and find the `firebaseConfig` object.
    - Copy the values into the corresponding variables in your `.env` file.

### 4. Run the Development Server

When you want to work on the code, you should use the development server. This command starts the application with features like Fast Refresh that make development easier.

```bash
npm run dev
```

This will start the application, and you can view it in your browser at `http://localhost:9002`.

### 5. Installing as a Desktop App (PWA)

This application can be installed on your desktop for a more app-like experience, with its own icon and window. This feature is known as a Progressive Web App (PWA).

To install the app:

1.  Open the application in a modern browser like Google Chrome or Microsoft Edge.
2.  Look for an "Install" icon in the address bar (usually on the right side). It might look like a computer screen with a downward arrow.
3.  Click the icon and follow the on-screen prompts to install the application.

Once installed, you can launch it from your desktop or start menu just like any other application.

## Troubleshooting

### FirebaseError: Failed to get document because the client is offline.

This is a common error with several possible causes. Follow these steps in order to resolve it:

**1. Verify Firestore Database is Created**

The most common cause is that the Firestore database hasn't been created in your Firebase project yet.
- Go to the [Firebase Console](https://console.firebase.google.com/).
- Select your project.
- Click **Build > Firestore Database** in the left menu.
- Click **Create database** and follow the prompts, choosing **Start in test mode**.

**2. Check Your `.env` File**

The configuration keys in your `.env` file must exactly match the ones in your Firebase project settings.
- Open your browser's Developer Console (usually with the F12 key) and look for a log titled "Firebase Config Check".
- **Carefully compare** every value in that log (like `projectId`, `apiKey`, etc.) with the values in your Firebase Console under **Project settings > General > Your apps > Web app**.
- Even a small typo will cause the connection to fail. Copy and paste them again to be sure.

**3. Enable the Firestore API**

Firebase depends on Google Cloud services. The Firestore API must be enabled for your project.
- Go to the [Google Cloud Console API Library for Firestore](https://console.cloud.google.com/apis/library/firestore.googleapis.com).
- Make sure your project (e.g., `profitvision-xxvpj`) is selected at the top of the page.
- If the API is not enabled, click the **Enable** button. It can take a few minutes for the change to take effect.

By checking these three things, you should be able to resolve the connection error.


## Deploying to Firebase

To deploy your application, you'll need to run a few commands from your computer's terminal after you've downloaded the project files.

This project is ready to be deployed to Firebase Hosting, which will make it a live website accessible from anywhere.

**Is Firebase Hosting Free?**

Yes, Firebase Hosting has a generous free tier (the Spark Plan) that is perfect for most applications. It includes 10 GB of storage and a significant amount of data transfer per month at no cost. For this application, the free tier is more than enough.

### Step 1: Install the Firebase CLI

If you haven't already, install the Firebase Command Line Interface on your computer by running this command in your terminal:

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

Next, run this command and follow the prompts to log in to your Google account:
```bash
firebase login
```

### Step 3: Deploy Your App

Finally, from your project's root directory, run the deploy command:

```bash
firebase deploy
```

**What to Expect:**

- The first time you run this, you'll be asked to select a Firebase project. You can either choose an existing one or create a new one right from the command line.
- The Firebase CLI will automatically build your project and deploy it.
- Once finished, it will give you a **Hosting URL**. You can visit this URL in your browser to use your live application!
