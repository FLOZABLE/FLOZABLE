# FLOZABLE

This document provides an overview of the FLOZABLE project, a web application with a backend written in TypeScript.

## Project Overview

FLOZABLE is a web application that provides various features such as user authentication, chat, groups, friends, notifications, plans, and rankings. It uses a modern tech stack with a focus on performance and scalability.

### Tech Stack

-   **Backend:** Node.js, Express.js, TypeScript
-   **Database:** MySQL
-   **ORM:** Prisma
-   **Real-time Communication:** Socket.IO
-   **Caching:** Redis
-   **Validation:** Joi
-   **Authentication:** JWT (inferred from the presence of `cookie-parser` and auth routes)

## How to Run the Project

### Prerequisites

-   Node.js (v16 or higher)
-   npm
-   MySQL
-   Redis

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/FLOZABLE/FLOZABLE.git
    ```

2.  Install the dependencies:

    ```bash
    npm install
    ```

3.  Set up the environment variables:

    -   Create a `.env` file in the root directory of the project.
    -   Add the following environment variables to the `.env` file:

    ```
    DATABASE_URL="mysql://<user>:<password>@<host>:<port>/<database>"
    REDIS_HOST="<redis_host>"
    REDIS_PORT="<redis_port>"
    ```

4.  Generate the Prisma client:

    ```bash
    npm run prisma:generate
    ```

### Running the Application

-   **Development:**

    ```bash
    npm run dev
    ```

-   **Production:**

    ```bash
    npm run build
    npm run start
    ```

## Project Structure

The project follows a standard structure for a Node.js application.

-   `src/`: Contains the source code of the application.
    -   `config/`: Contains the configuration files.
    -   `controllers/`: Contains the controllers for handling incoming requests.
    -   `generated/`: Contains the generated Prisma client.
    -   `libs/`: Contains the libraries and utility functions.
    -   `middlewares/`: Contains the custom middlewares.
    -   `models/`: Contains the database models.
    -   `prisma/`: Contains the Prisma schema file.
    -   `public/`: Contains the public assets.
    -   `queries/`: Contains the database queries.
    -   `routes/`: Contains the API routes.
    -   `schedulers/`: Contains the schedulers for running background tasks.
    -   `schemas/`: Contains the validation schemas.
    -   `services/`: Contains the business logic of the application.
    -   `sockets/`: Contains the Socket.IO related code.
    -   `types/`: Contains the TypeScript types and interfaces.
-   `dist/`: Contains the compiled JavaScript code.

## Database Schema

The database schema is defined in the `src/prisma/schema.prisma` file. It consists of the following models:

-   `users`: Stores user information.
-   `chatroom_members`: Stores the members of a chatroom.
-   `chatroom_messages`: Stores the messages of a chatroom.
-   `chatrooms`: Stores the chatrooms.
-   `devices`: Stores the devices of a user.
-   `friends`: Stores the friendship information between users.
-   `group_likes`: Stores the likes of a group.
-   `group_members`: Stores the members of a group.
-   `groups`: Stores the groups.
-   `notifications`: Stores the notifications.
-   `ranking_details`: Stores the details of a ranking.
-   `rankings`: Stores the rankings.
-   `subjects`: Stores the subjects of a user.
-   `subject_timelines`: Stores the timelines of a subject.
-   `theme_likes`: Stores the likes of a theme.
-   `themes`: Stores the themes.
-   `user_themes`: Stores the themes of a user.
-   `website_settings`: Stores the website settings of a user.
-   `website_usage`: Stores the website usage of a user.

## API Endpoints

The API endpoints are defined in the `src/routes/` directory. The following are the main API endpoints:

-   `/auth`: Authentication related endpoints.
-   `/account`: Account related endpoints.
-   `/subject`: Subject related endpoints.
-   `/ranking`: Ranking related endpoints.
-   `/group`: Group related endpoints.
-   `/plan`: Plan related endpoints.
-   `/friend`: Friend related endpoints.
-   `/notification`: Notification related endpoints.
-   `/chat`: Chat related endpoints.
-   `/theme`: Theme related endpoints.
-   `/user`: User related endpoints.
-   `/extension`: Extension related endpoints.
