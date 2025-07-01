# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Running Locally

To run this application on your own computer, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or later)
- [npm](https://www.npmjs.com/) or another package manager like yarn or pnpm

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

Once your dependencies are installed and your environment variables are set, you can start the development server:

```bash
npm run dev
```

This will start the application, and you can view it in your browser at `http://localhost:9002`.

### 5. Running Genkit for AI Features (Optional)

If you want to use the AI-powered features (like report anomaly detection), you'll also need to run the Genkit development server in a separate terminal:

```bash
npm run genkit:dev
```
