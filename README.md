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

## Deploying to Firebase (Recommended for Business Use)

For your business, the best approach is to deploy the application to Firebase Hosting. This will make it a live website accessible from anywhere, without needing to run commands on your computer.

### 1. Login to Firebase

In your terminal, run this command and follow the prompts to log in to your Google account:
```bash
firebase login
```

### 2. Deploy the Application

In your project's root directory, run the following command:
```bash
firebase deploy
```

The Firebase CLI will build your project and deploy it. Once it's finished, it will give you a **Hosting URL**. You can visit this URL in your browser to use your live application!
