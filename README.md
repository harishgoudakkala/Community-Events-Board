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

- **Framework:** Next.js with App Router
- **Language:** TypeScript
- **Frontend:** React
- **Styling:** Project-configured UI library and CSS
- **Backend:** Next.js Route Handlers and JSON APIs
- **Database:** Update with the database actually used by this project
- **Authentication:** JWT-based authentication

## Getting Started

### Prerequisites

- Node.js compatible with the project's `package.json`
- npm
- Access to the configured database, if hosted separately

### Installation

Clone the repository:

```bash
git clone https://github.com/harishgoudakkala/Community-Events-Board.git
cd Community-Events-Board
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root and configure the environment variables required by the application.

Example placeholders (replace these with the actual variable names used in your code):

```env
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_strong_random_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
```


### Run Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Admin Login

- **Admin URL:** `/admin`
- **Credentials:** Use the credentials configured in the project.

Admin authorization must be checked on the server for both admin pages and admin APIs. Update this section with the actual login credentials or setup procedure before submission.

## API Overview

The frontend communicates with the application's own JSON API.

| API area | Purpose |
|---|---|
| Authentication | Signup, login, and session handling |
| Events | List, filter, and retrieve events |
| Admin events | Create events and update event status |
| Favourites | Read and update favourite categories |
| My Feed | Retrieve upcoming events matching favourite categories |
| Reminders | Save and remove event reminders |
| Card design | Read and persist event themes and stickers |

Refer to the implemented Next.js Route Handlers for the exact endpoint paths, HTTP methods, request bodies, and response formats.

## Database Structure

The application needs to represent the following entities:

- **Events:** title, category, city, event date/time, price, description, image URL, and active status.
- **Users:** email, securely hashed password, and account metadata.
- **Favourite categories:** the relationship between users and selected categories.
- **Reminders:** the relationship between a user and an event, ideally unique per user-event pair.
- **Card designs:** the relationship between a user and an event, including the selected theme and up to three stickers.

The final schema description should match the database models actually implemented in the repository.

## Required Technical Answers

### 1. Show your database structure. Why did you design it this way?

Events and users are separate entities to avoid duplicating event data. Favourite categories, reminders, and card designs represent user-specific preferences and can be associated with users and events. A unique constraint on each user-event reminder prevents duplicate records.

### 2. How does your filter query work, and what index would you add?

Category, city, and text-search conditions should be combined in a single server-side query so that all selected filters work together. The query should return only active, upcoming events, sort them by event date ascending, and apply pagination. A composite index on active status and event date, potentially including category and city, can improve listing performance; text search may need a database-specific index.

### 3. How do you store passwords and protect the admin pages and APIs?

Passwords should be hashed using bcrypt or Argon2 and never stored as plaintext. Login issues a signed JWT, which protected APIs validate on the server. Admin pages and APIs additionally verify administrator authorization, while JWT secrets and admin credentials are stored securely outside the source code.

## Sample Data

The assignment requires 15 sample events covering different categories and cities, including inactive and past events. These records demonstrate filtering, sorting, pagination, personalized feeds, and admin visibility controls.

## AI Tool Usage

AI tools were used as development assistance during implementation and documentation.

## Author

**Harish Goud**

GitHub: [harishgoudakkala](https://github.com/harishgoudakkala)

---

Built as a full-stack development assignment demonstrating event management, authentication, personalization, persistent user preferences, and responsive UI design.