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

### 3a. Initialize Your Firestore Database

The `FirebaseError: Failed to get document because the client is offline.` error usually means that the Firestore database hasn't been created in your Firebase project yet. Follow these steps in the Firebase Console to set it up:

1.  **Go to the Firebase Console:** [console.firebase.google.com](https://console.firebase.google.com/)
2.  **Select Your Project:** Choose your project (e.g., `profitvision-xxvpj`).
3.  **Navigate to Firestore:** On the left-hand menu, click **Build > Firestore Database**.
4.  **Create Database:** Click the **Create database** button.
5.  **Start in Test Mode:** When prompted for security rules, select **Start in test mode**. This will allow your app to read and write data while you're developing. You can change these rules later for production.
6.  **Choose a Location:** Select a location for your database (the one closest to you is usually best) and click **Enable**.

After the database is created, your running application should be able to connect successfully.

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
