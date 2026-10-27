# Haven Group — Hotel Management System

A responsive internal hotel-management application for coordinating daily operations across multiple hotel properties.

The system brings reservations, room operations, billing, payments, staff information, and operational tasks into one workspace.

## Table of Contents

- [Overview](#overview)
- [Who Uses the System](#who-uses-the-system)
- [Navigation Guide](#navigation-guide)
- [Reservations](#reservations)
- [Room Management](#room-management)
- [Billing and Payments](#billing-and-payments)
- [Employees and Staff Operations](#employees-and-staff-operations)
- [Expenses and Financial Tracking](#expenses-and-financial-tracking)
- [Tasks and Daily Operations](#tasks-and-daily-operations)
- [Settings and Notifications](#settings-and-notifications)
- [Recommended Daily Workflows](#recommended-daily-workflows)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Build](#build)
- [Data and Security](#data-and-security)
- [Troubleshooting](#troubleshooting)

## Overview

Haven Group is designed to help hotel owners and staff manage hotel operations from a centralized interface.

Users can work with hotel properties, review reservations, monitor room availability and housekeeping, maintain guest billing records, track payments, manage employee information, and coordinate operational tasks.

The application is responsive and designed for use on desktop and mobile devices.

## Who Uses the System

### Reception and Front Office

Typical activities include:

- Reviewing current and upcoming reservations.
- Creating reservations and correcting booking details.
- Checking guests in and out.
- Confirming room availability before assigning rooms.
- Reviewing guest charges and payment records.
- Exporting reservation information when needed.

### Housekeeping and Operations

Typical activities include:

- Checking which rooms are occupied or vacant.
- Reviewing housekeeping status.
- Identifying rooms requiring maintenance.
- Updating room notes and operational status.
- Reviewing and completing assigned tasks.

### Hotel Management and Ownership

Typical activities include:

- Reviewing activity across hotel properties.
- Monitoring reservations and room operations.
- Reviewing billing, payment, and expense information.
- Maintaining employee records.
- Following up on operational tasks.
- Reviewing available financial summaries.

Available actions depend on the features implemented in the current version and any access controls configured for the application.

## Navigation Guide

Use the application's navigation menu to open the relevant section.

| Section | Purpose | What users can do |
| --- | --- | --- |
| Dashboard | Operational overview | Review the available property and business summaries. |
| Reservations | Guest stays and bookings | Create, review, and edit reservations; manage check-in and check-out; export reservation data. |
| Room Management | Room availability and condition | Review room status, update housekeeping information, record notes, and manage maintenance status. |
| Billing | Guest charges and billing records | Review available billing information and charges. |
| Payment History | Recorded payments | Review payment records and available payment details. |
| Employees | Staff information | View and maintain employee records. |
| Expenses | Business expenses | Review and maintain expense records and available financial information. |
| Tasks | Operational follow-up | Review and manage available operational tasks. |
| Settings | Application preferences | Review available configuration, language, and notification options. |

The exact menu labels and available actions may vary as the application evolves.

## Reservations

The Reservations section is the main workspace for managing guest stays.

### Common actions

- Create a reservation for a guest.
- Select the relevant hotel and room.
- Enter or correct reservation details.
- Review check-in and check-out dates.
- Edit a reservation when changes are permitted.
- Check guests in and out.
- Export reservation information to Excel.

### Reservation statuses

The application uses the following reservation statuses:

- **Confirmed** — the reservation is confirmed.
- **Arriving today** — the guest is expected to arrive today.
- **Checked in** — the guest has checked in.
- **Checked out** — the guest has checked out.
- **Cancelled** — the reservation has been cancelled.
- **No-show** — the guest did not arrive as expected.

### Check-in and check-out

Before checking a guest in, verify the reservation details and assigned room.

When checking a guest out, confirm the stay details and follow the application's checkout workflow. The configured workflow updates the room to Vacant and its housekeeping status to Dirty so that the room can be prepared for the next guest.

Room availability, maintenance restrictions, date rules, and reservation conflicts may affect which actions are permitted.

### Reservation exports

Use the available Excel export action when you need a spreadsheet for operational review, recordkeeping, or reporting.

Check the exported data before sharing it, because reservation records can contain sensitive guest information.

## Room Management

The Room Management section helps staff understand the current state of each room.

### Occupancy status

- **Occupied** — the room is in use.
- **Vacant** — the room is available from an occupancy perspective.
- **Maintenance** — the room is marked for maintenance and should not be assigned as an ordinary available room.

### Housekeeping status

- **Clean** — the room is marked clean.
- **Dirty** — the room requires cleaning.

Occupancy and housekeeping are separate indicators. A vacant room may still be dirty and not ready for the next guest.

### Room notes

Use room notes to record relevant operational information, such as maintenance observations or housekeeping follow-up.

Keep notes factual, professional, and limited to information necessary for hotel operations.

## Billing and Payments

These sections support review of guest charges and recorded payment information.

### Billing

Use the Billing section to review available billing records and charge details. Check the guest, reservation, room, amounts, and relevant dates before making or confirming changes.

### Payment History

Use Payment History to review recorded payments and the details available for each transaction.

When investigating a balance or a payment discrepancy:

1. Identify the relevant guest or reservation.
2. Review the associated charges.
3. Review the recorded payments.
4. Compare the dates and amounts.
5. Resolve discrepancies using the hotel's approved process.

Always verify the current application behavior before assuming that a displayed balance has been settled or that a payment has been processed externally.

## Employees and Staff Operations

The Employees section is used to maintain staff information.

Depending on the available form fields, staff records may include employee details, department, job title, and other operational information.

Use consistent department and job-title information so that staff records remain easy to understand and maintain.

Only enter employee information needed for legitimate business operations.

## Expenses and Financial Tracking

The Expenses section provides access to recorded business expenses and available financial information.

Use it to review expense entries, check amounts and dates, and maintain accurate operational records.

When reviewing financial summaries:

- Check the selected reporting period.
- Confirm that the correct property or scope is selected where applicable.
- Compare figures with the underlying records.
- Distinguish recorded revenue, payments received, expenses, and outstanding balances.

A displayed summary should not be treated as a substitute for reconciling the underlying records.

## Tasks and Daily Operations

Use the Tasks section to coordinate operational follow-up.

Examples of hotel activities that may require tasks include:

- Following up on room maintenance.
- Coordinating housekeeping.
- Resolving booking or billing discrepancies.
- Completing routine operational checks.

Review task details and status regularly. Update tasks according to the actions actually completed.

## Settings and Notifications

The Settings section provides access to configuration options available in the current application.

Depending on the current version, these may include language preferences, notification settings, and other application preferences.

If push notifications are enabled, the browser or device may require notification permission. Notifications may also depend on browser support, network connectivity, and the availability of the notification service.

Do not place passwords, API secrets, or other credentials in frontend settings.

## Recommended Daily Workflows

### Start of shift

1. Open the dashboard and review the available operational overview.
2. Review reservations expected to arrive or depart.
3. Check room occupancy and housekeeping status.
4. Identify rooms marked for maintenance.
5. Review outstanding operational tasks.

### Guest arrival

1. Find the guest's reservation.
2. Verify the guest and reservation details.
3. Confirm the assigned room is suitable for check-in.
4. Complete the check-in workflow.
5. Review any relevant billing or payment information.

### Guest departure

1. Open the correct reservation.
2. Verify the stay and checkout details.
3. Review relevant charges and payment records.
4. Complete the checkout workflow.
5. Confirm the room's occupancy and housekeeping status.
6. Record or communicate any necessary follow-up.

### End of shift

1. Review pending arrivals, departures, and unresolved reservations.
2. Check outstanding billing or payment questions.
3. Review room maintenance and housekeeping follow-up.
4. Update outstanding tasks.
5. Export records if required by the hotel's procedures.

## Getting Started

### Requirements

- Node.js 20.19+ or 22.12+
- npm

### Run locally

Install dependencies:

    npm ci

Start the frontend and API:

    npm run dev

Open the frontend at:

    http://localhost:5173

The local API defaults to port 4000, and Vite proxies `/api` requests to it during development.

### Available commands

Build the production frontend:

    npm run build

The production frontend is generated in `dist/`.

## Configuration

The frontend supports `VITE_API_URL` for connecting to a separately hosted API.

When `VITE_API_URL` is unset, API requests use the same origin. During local development, Vite proxies `/api` requests to the local API.

The API supports these environment variables:

- `PORT` — API listening port; defaults to `4000`.
- `DATA_FILE` — path to the persistent JSON data file.
- `PUSH_SUBSCRIPTIONS_FILE` — path to the push-notification subscriptions file.

Never put server secrets in `VITE_*` variables. Frontend environment variables can be exposed to users through the built application.

## Data and Security

Before exposing the API publicly or using real guest information, ensure that appropriate authentication, authorization, input validation, secure data storage, and backups are in place.

Additional precautions:

- Do not commit `.env` files, credentials, push subscriptions, or real hotel data.
- Restrict access to guest and employee information to authorized personnel.
- Keep backups in a secure location and test that they can be restored.
- Avoid sharing reservation exports or financial records through unsecured channels.
- Do not assume that a successful frontend build proves that the backend is production-secure.
- Confirm that the API's data file is stored persistently in the actual deployment environment.

A local JSON data file is not automatically a durable database on every hosting platform. Verify persistence and backup arrangements before relying on a deployment for live hotel operations.

## Troubleshooting

### The application opens but data is missing

- Confirm that the API is running and reachable.
- Verify the configured `VITE_API_URL`, if one is used.
- Check that the API is connected to the intended data file.
- Confirm that the deployment environment preserves the API's data between restarts.

### Changes do not appear on the deployed website

- Check the hosting provider's deployment status.
- Confirm that the intended Git commit was pushed to the correct branch.
- Review build logs for errors.
- Refresh the website after the deployment is ready.

### Notifications do not appear

- Check browser notification permissions.
- Verify that the device supports the notification features being used.
- Confirm that the notification service and API are available.

### The local application does not start

- Confirm that the required Node.js version is installed.
- Run `npm ci` from the project directory.
- Check the terminal output for port conflicts, missing configuration, or dependency errors.

---

Haven Group — Internal hotel-management system.
