# 🪙 CoinTrack: App Features & Product Overview

**CoinTrack** is a personal finance tracker and budgeting application designed to help users track expenses, plan savings goals, and understand their financial habits through clean visualizations and smart safety nets.

---

## 🌟 Core App Features

### 1. Secure Authentication & Personalization
*   **Sign-in & Sign-up**: Register and log in securely with your email and password at the [Login Screen](file:///d:/Arush/budgeting-app/app/(auth)/login.jsx).
*   **Onboarding Setup**: When you first sign up, CoinTrack asks for your display username and your total monthly income at the [UserDetails Onboarding Screen](file:///d:/Arush/budgeting-app/app/UserDetails/index.jsx). This forms the baseline for your monthly budget, balances, and savings metrics.

### 2. The Command Center (Dashboard)
Located at the [Home Tab](file:///d:/Arush/budgeting-app/app/(tabs)/Home.jsx), the dashboard gives you a complete financial summary at a single glance:
*   **Real-time Balances**: Instantly check your base monthly income, total expenses logged in the current calendar month, and your remaining liquid savings.
*   **Spending Trend Charts**: View an interactive monthly bar chart displaying your non-recurring spending across the last 4 months, allowing you to easily spot historical spikes.
*   **Activity Snapshot**: Preview your latest expenses and the progress of your savings goals without digging through menus.

### 3. Smart Expense Tracking & Categorization
Log and manage your expenses at the [Expenses Tab](file:///d:/Arush/budgeting-app/app/(tabs)/Expenses.jsx):
*   **Categorization**: Organize purchases by category (e.g., Food, Shopping, UPI, Cash) to review where your money goes.
*   **Flexible Transaction Types**:
    *   **Non-Recurring**: One-off purchases (like a dinner bill or electronics) that affect the current month.
    *   **Recurring**: Continuous monthly obligations (like Netflix subscriptions, rent, or utilities) which apply automatically when the calendar day matches the transaction day.
*   **Financial Safety Guards**:
    *   🛑 **Overdraft Blocker**: The app checks your balance and blocks you from adding an expense that is larger than your current savings.
    *   ⚠️ **Low-Savings Sentinel**: If an expense drops your remaining savings below **10%** of your monthly income, the app presents a custom alert warning you that your savings are running low.

### 4. Interactive Goals Planning
Set milestones and build habits at the [Goals Tab](file:///d:/Arush/budgeting-app/app/(tabs)/Goals.jsx):
*   **Create Savings Targets**: Name a goal (e.g., "New iPhone", "Emergency Fund") and set a target amount.
*   **Transfer Funds**: Move cash directly from your main liquid balance into specific goals.
*   **Progress Rings**: Check progress with animated percentage rings showing how close you are to completing your goal.
*   **Celebration Modal**: Reaching 100% of your target triggers a full-screen completion celebration.
*   **Refundable Deletions**: If you decide to cancel or remove a savings goal, all funds you contributed are immediately returned to your main liquid savings balance.

### 5. Profile Customization & PDF Reports
Access settings at the [Profile Screen](file:///d:/Arush/budgeting-app/app/profile/index.jsx):
*   **Edit Profile**: Update your display username at any time.
*   **Income Redefinition & Resets**: If you change your monthly income limit, the app prompts you with a warning indicating that modifying your income baseline will safely purge historical expenses and goals to prevent outdated data overlap.
*   **Export Monthly Reports**: Select any month and year to compile a formatted PDF listing all transactions, your total expenses, and final savings. The app then triggers the native OS sharing sheet to let you email, message, or save the document locally.

---

## 💎 Design and Experience Highlights

*   **Vibrant Dark & Light Modes**: Full custom theme support optimized for readability in any environment.
*   **Fluid Animations**: Premium stagger animations, fading items, sliding notifications, and dynamic charts keep the interface feeling responsive.
*   **Offline Session Recovery**: Keeps you signed in between sessions using local device caching.
