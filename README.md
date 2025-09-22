# Cryptographic Analysis and Digital Signature Application

This is a web application built with **React** that demonstrates two main features:

* A tool to analyze the performance of symmetric encryption algorithms (**AES, Blowfish**).
* A chat simulation with digital signatures to illustrate key generation, message signing, and verification.

---

## How to Run the Project Locally

Follow the steps below to install and run the application on your machine.

### Prerequisites

Before starting, make sure you have **Node.js** (which includes npm) installed on your computer. Version **16 or higher** is recommended.

---

### File Structure

```
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ChatPanel.js
│   │   ├── CryptoPerformance.js
│   │   └── DigitalSignature.js
│   ├── App.js
│   ├── index.css
│   └── index.js
├── package.json
├── tailwind.config.js
└── README.md
```

---

### Install Dependencies

Open your terminal (or command prompt).

Navigate to the root folder of the project:

```bash
cd crypto-app
```

Run the following command to install all the required libraries and packages defined in `package.json`:

```bash
npm install
```

This command will create a `node_modules` folder with all the project dependencies.

---

### Run the Application

While still in the project root folder, run the command:

```bash
npm start
```

This will start the React development server.

A new tab should automatically open in your default browser with the application running, usually at:

```
http://localhost:3000
```

---

## Done!

The application will now be running on your machine, and you can interact with the two tabs.
Any changes you make to the project files will be automatically reflected in the browser.
