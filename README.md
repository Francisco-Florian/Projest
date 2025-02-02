# Projest - Front-End

## Description

This repository contains the front-end of **Projest**, a project management application. It allows users to create, organize, and track the progress of their projects with an intuitive and interactive interface.

This project is built with **React** and uses **Zustand** for state management, as well as **Vite** for bundling and development.

## Prerequisites

Before you begin, make sure you have the following installed on your machine:

- **Node.js** (version 14 or higher recommended): [Download Node.js](https://nodejs.org/)
- **npm** (or yarn, if you prefer): npm comes with Node.js
- **Git** to clone the repository: [Download Git](https://git-scm.com/)

## Installation

1. Clone this repository to your local machine:  
`git clone https://github.com/Francisco-Florian/Projest.git`

2. Navigate to the project directory:  
`cd Projest`

3. Install the necessary dependencies:  
`npm install`

## Running the Project

To run the project in development mode, execute the following command:  
`npm run dev`

This will start the application locally at: `http://localhost:5173`

## Key Features

- **Authentication**: Uses Zustand to manage authentication information.
- **Project Management**: Users can create, view, and organize their projects with a dynamic dashboard.
- **Modular Interface**: The application is divided into several reusable components.
- **Task Management**: Inspired by Trello’s task management system, with user-customizable columns.

## Technologies Used

- **React**: JavaScript library for building user interfaces.
- **Zustand**: Lightweight state management for React.
- **Vite**: Fast and efficient development tool.
- **SASS**: CSS preprocessor to manage styles.
- **LocalStorage**: Stores authentication data and user preferences.

## Deployment

To deploy the application, you can compile the files for production with the following command:  
`npm run build`

The compiled files will be placed in the `dist` folder, ready to be deployed on a server.

## Contributing

Contributions are welcome! If you would like to improve the project, please follow these steps:

1. Fork this repository.
2. Create a branch for your feature: `git checkout -b feature/my-new-feature`
3. Make your changes and commit them: `git commit -m 'Add a new feature'`
4. Push the branch: `git push origin feature/my-new-feature`
5. Open a pull request.
