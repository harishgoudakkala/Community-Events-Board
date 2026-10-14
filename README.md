# Community Events Board

A responsive event discovery platform built with **Next.js App Router**. Visitors can discover upcoming community events, filter events by category and city, save their interests, create a personalized feed, set reminders, and customize event cards. Administrators can manage event listings and control their visibility.

**Repository:** [harishgoudakkala/Community-Events-Board](https://github.com/harishgoudakkala/Community-Events-Board)

## Features

### Admin
- Admin authentication with server-side protection for admin pages and APIs.
- Create events with title, category, city, date, time, price, description, and image URL.
- Activate or deactivate events without deleting them.

### Event Discovery
- Browse active, upcoming events sorted by nearest date.
- Combine category, city, and text-search filters.
- Navigate results using pagination.
- Display prices in Indian Rupee format and dates in a human-friendly format.

### User Accounts and Personalization
- Sign up and log in using email and password.
- Authenticate API requests using JWT-based authentication.
- Select favourite event categories.
- Browse a personalized **My Feed** based on favourite categories.
- Set and remove event reminders, with changes persisted across refreshes and error handling for failed requests.

### Event Card Designer
- Switch between three background themes.
- Add and remove stickers, with a maximum of three stickers per card.
- Preview design changes immediately with smooth transitions.
- Save a separate card design for each event and restore it after refreshing the page.

### User Experience
- Responsive layouts for mobile and desktop.
- Loading, empty, and error states.
- Consistent styling and reusable UI components.
- JSON API architecture designed to support future clients, including mobile applications.

## Tech Stack

- **Framework:** Next.js App Router
- **Language:** TypeScript
- **Frontend:** React
- **Database:** PostgreSQL hosted on Neon
- **Backend:** Next.js Route Handlers and JSON APIs
- **Authentication:** JWT-based authentication
- **Styling:** UI library and styling system configured in the project

## Getting Started

### Prerequisites

- Node.js compatible with the project's `package.json`
- npm
- A PostgreSQL database on [Neon](https://neon.tech/) or another compatible provider

### 1. Clone the Repository

```bash
git clone https://github.com/harishgoudakkala/Community-Events-Board.git
cd Community-Events-Board
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root and configure the environment variables required by the application.

Example:

```env
DATABASE_URL="your_neon_postgresql_connection_string"
JWT_SECRET="your_strong_random_secret"
```

Use the exact variable names expected by the application. Configure any additional variables required by the project.

**Security:** Never commit `.env.local`, database credentials, or JWT secrets to GitHub. Use your own Neon database connection string when running the application locally.

### 4. Run Database Migrations

Initialize the database schema:

```bash
npm run db:migrate
```

This applies the database migrations defined in the project.

### 5. Seed the Database

Insert the sample event data:

```bash
npm run db:seed
```

This runs the project's seed script to populate the database. The assignment requires 15 sample events across different categories and cities, including inactive and past events.

### 6. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

## Admin Login

- **Admin URL:** `/admin`
- **Credentials:** Use the administrator credentials configured in the project.

Admin pages and APIs must validate administrator authorization on the server. Refer to the project's authentication implementation for the actual login procedure.

## API Overview

The frontend communicates with the application's own JSON API, keeping the backend independent of the web UI.

| API area | Purpose |
|---|---|
| Authentication | User signup and login |
| Events | List, filter, and retrieve events |
| Admin events | Create events and update event status |
| Favourites | Read and update favourite categories |
| My Feed | Retrieve upcoming events matching favourite categories |
| Reminders | Save and remove event reminders |
| Card design | Read and persist event themes and stickers |

Refer to the Next.js Route Handlers in the repository for the exact endpoint paths, HTTP methods, request bodies, and response formats.

## Database Structure

The application uses PostgreSQL to store events, users, and user-specific preferences.

- **Events:** Title, category, city, event date and time, price, description, image URL, and active status.
- **Users:** Email, securely hashed password, and account metadata.
- **Favourite categories:** User-selected event categories.
- **Reminders:** Associations between users and events, ideally unique for each user-event pair.
- **Card designs:** User-specific event card themes and sticker selections, limited to three stickers per card.

The migration files define the database schema, while the seed script populates the database with sample data. Each reviewer can configure their own Neon database; access to the developer's database is not required.

## Required Technical Answers

### 1. Show your database structure. Why did you design it this way?

Events and users are separate entities to avoid duplicating event data. Favourite categories, reminders, and card designs represent user-specific preferences associated with users and events. A unique constraint on the user-event reminder pair helps prevent duplicate reminders.

### 2. How does your filter query work, and what index would you add?

Category, city, and text-search conditions are combined in a single server-side query so all selected filters apply together. The query returns only active, upcoming events, sorts them by event date ascending, and applies pagination. A composite index on active status and event date, potentially including category and city, can improve query performance; text search may require a PostgreSQL-specific index depending on its implementation.

### 3. How do you store passwords and protect the admin pages and APIs?

Passwords should be hashed using a suitable algorithm such as bcrypt or Argon2, never stored as plaintext. Login issues a signed JWT, which protected APIs validate on the server. Admin pages and APIs additionally verify administrator authorization, while JWT secrets and database credentials remain in environment variables.

## Sample Data

The project includes a database seeding workflow through:

```bash
npm run db:seed
```

The seed data should contain 15 sample events covering different categories and cities, including inactive and past events, to demonstrate filtering, sorting, pagination, and visibility controls.

## AI Tool Usage

AI tools were used as development assistance during implementation and documentation. The developer is responsible for reviewing, testing, and understanding the submitted code.

## Known Limitations

Document any incomplete requirements, known bugs, or deployment-specific configuration here. If all assignment requirements have been implemented and verified, state that no known assignment-related limitations remain.

## Author

**Harish Goud**

GitHub: [harishgoudakkala](https://github.com/harishgoudakkala)

---

Built as a full-stack development assignment demonstrating event management, authentication, personalization, persistent user preferences, and responsive UI design.