# WalletTrack - Personal Finance Dashboard

A clean, modern personal finance management application that helps you track your income, expenses, and financial goals.

## Features

### Dashboard Overview
- Real-time balance tracking
- Income and expense summaries
- Interactive visualizations
  - Balance trend chart (line graph)
  - Spending breakdown by category (pie chart)

### Transaction Management
- Complete transaction history
- Advanced filtering by type (Income/Expense)
- Search by description or category
- Sort by date or amount
- Add new transactions (Admin role)
- Delete transactions (Admin role)

### Financial Insights
- Highest spending category analysis
- Savings rate calculation
- Monthly financial overview
- Transaction count tracking

### User Roles
- **Viewer**: Read-only access to all financial data
- **Admin**: Full access with ability to add and delete transactions

### Additional Features
- Dark mode support
- Data persistence (localStorage)
- Export data (JSON/CSV)
- Responsive design (mobile, tablet, desktop)
- Professional, clean UI

## Technology Stack

- React 18+
- Tailwind CSS v4
- Recharts (data visualization)
- Lucide React (icons)
- TypeScript

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Open your browser and navigate to the development URL

## Usage

### Switching Roles
Use the role switcher in the sidebar (or mobile header) to toggle between Viewer and Admin modes.

### Adding Transactions (Admin Only)
1. Switch to Admin role
2. Click "Add Transaction" button
3. Fill in the transaction details
4. Submit the form

### Filtering and Searching
- Use the search bar to find transactions by description or category
- Use the filter dropdown to show only Income or Expense transactions
- Click column headers to sort by date or amount

### Exporting Data
Click the "Export" button and choose your preferred format:
- JSON: Full transaction data with all fields
- CSV: Spreadsheet-compatible format

### Dark Mode
Toggle between light and dark themes using the theme switcher in the sidebar.

## Data Structure

Transactions are stored with the following fields:
- ID (unique identifier)
- Date
- Amount (positive for income, negative for expenses)
- Category
- Type (Income/Expense)
- Description

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

All rights reserved © 2026 WalletTrack
**Version:** 1.2.5 | **Built by:** Yagneshwar Chinni
