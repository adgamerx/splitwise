# Splitwise-like Expense Sharing Backend (MVP)

Production-oriented backend MVP for a Splitwise-like app using Node.js, Express, Sequelize, and SQLite.

## Features Implemented

- Create user (`POST /users`)
- Add expense (`POST /expenses`)
- View balances (`GET /balances`)
- Layered architecture (controller, service, repository)
- Input validation and consistent error responses
- Soft deletes on core entities (`users`, `expenses`, `expense_participants`)
- Deterministic equal split logic with integer minor units
- Integration tests for happy paths and edge cases

## Tech Stack

- Node.js
- Express
- Sequelize ORM
- SQLite
- Jest + Supertest

## Project Structure

- `src/controllers`: thin request handlers
- `src/services`: business logic
- `src/repositories`: database access
- `src/models`: Sequelize models + associations
- `src/validators`: request schema validation
- `src/utils`: money math, balance math, errors, async handling
- `migrations`: Sequelize migrations
- `tests/integration`: end-to-end API tests

## Money Handling

All monetary values are stored in the smallest currency unit (`*_amount_minor`) as integers to avoid floating-point errors.

- Example: `100.25` INR -> `10025`
- Equal split is deterministic:
  - base share = `floor(total / n)`
  - remainder distributed by ascending `userId`

## Data Model

### users

- `id`
- `email` (unique)
- `password_hash` (bcrypt)
- `default_currency`
- timestamps + `deleted_at`

### expenses

- `id`
- `name`
- `total_amount_minor`
- `currency`
- `split_type` (`EQUAL`, extensible for `CUSTOM`)
- `expense_date`
- `created_by_user_id`
- `paid_by_user_id`
- `notes`
- timestamps + `deleted_at`

### expense_participants

- `id`
- `expense_id`
- `user_id`
- `share_amount_minor`
- unique (`expense_id`, `user_id`)
- timestamps + `deleted_at`

### activity_logs (extensibility)

- `actor_user_id`
- `entity_type`
- `entity_id`
- `action`
- `metadata`
- timestamps

## Assumptions

- No real authentication is implemented.
- `user_id` is assumed to be present in request context.
- For local/dev testing, `x-user-id` header is used to populate request context.
- Expense creation currently supports equal split only.
- MVP assumes two decimal places for currency minor units.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Run migrations:

```bash
npm run db:migrate
```

3. Start server:

```bash
npm run start
```

Server runs at `http://localhost:3000` by default.

## Run Tests

```bash
npm test
```

## API Reference

### 1) Create User

`POST /users`

Request:

```json
{
  "email": "alice@example.com",
  "password": "StrongPass123",
  "defaultCurrency": "INR"
}
```

Success response (`201`):

```json
{
  "data": {
    "id": 1,
    "email": "alice@example.com",
    "defaultCurrency": "INR",
    "createdAt": "2026-04-26T00:00:00.000Z"
  }
}
```

### 2) Add Expense

`POST /expenses`

Headers:

- `x-user-id: 1`

Request:

```json
{
  "name": "Dinner",
  "value": "120.00",
  "currency": "INR",
  "members": [1, 2, 3],
  "paidByUserId": 1,
  "date": "2026-04-26",
  "notes": "Friday dinner"
}
```

Success response (`201`):

```json
{
  "data": {
    "id": 1,
    "name": "Dinner",
    "totalAmountMinor": 12000,
    "currency": "INR",
    "splitType": "EQUAL",
    "expenseDate": "2026-04-26",
    "paidByUserId": 1,
    "createdByUserId": 1,
    "notes": "Friday dinner",
    "members": [
      { "userId": 1, "shareAmountMinor": 4000 },
      { "userId": 2, "shareAmountMinor": 4000 },
      { "userId": 3, "shareAmountMinor": 4000 }
    ],
    "createdAt": "2026-04-26T00:00:00.000Z"
  }
}
```

### 3) View Balances

`GET /balances`

Headers:

- `x-user-id: 1`

Success response (`200`):

```json
{
  "data": {
    "userId": 1,
    "balances": [
      {
        "withUserId": 2,
        "currency": "INR",
        "netAmountMinor": 3500,
        "absoluteAmountMinor": 3500,
        "direction": "you_are_owed",
        "withUser": {
          "id": 2,
          "email": "bob@example.com",
          "defaultCurrency": "INR"
        }
      }
    ]
  }
}
```

## Error Format

All errors follow a consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "path": "value",
        "message": "Value must be a positive amount with up to 2 decimal places"
      }
    ]
  }
}
```

## Future-Ready Design Notes

- `split_type` allows introducing custom split logic later.
- Soft deletes allow safer update/delete flows and audit-friendly behavior.
- `activity_logs` table supports future activity feed/reporting.
- Balance source of truth remains expense + participant records (no fragile denormalized state).
