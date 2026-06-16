const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://vybaolctcayceabaysdf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5YmFvbGN0Y2F5Y2VhYmF5c2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNTQwNDMsImV4cCI6MjA5NjkzMDA0M30.CuxOx8IbMHiS8WrO70b4iij-9PpF6Kd7V4k16VGVtcE";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const dummyExpenseNames = [
    { name: "Starbucks Coffee", category: "Food", amount: 250 },
    { name: "Netflix Subscription", category: "Entertainment", amount: 499 },
    { name: "Grocery Shopping", category: "Food", amount: 1500 },
    { name: "Petrol Refuel", category: "Transport", amount: 1200 },
    { name: "McDonalds Dinner", category: "Food", amount: 450 },
    { name: "Zara Clothes", category: "Shopping", amount: 3200 },
    { name: "Electricity Bill", category: "Utilities", amount: 2200 },
    { name: "Gym Membership", category: "Health", amount: 1000 },
    { name: "Amazon Book Purchase", category: "Education", amount: 350 },
    { name: "Movie Tickets", category: "Entertainment", amount: 600 },
    { name: "Uber Ride", category: "Transport", amount: 300 },
    { name: "Pharmacy Medicines", category: "Health", amount: 400 },
    { name: "Office Lunch", category: "Food", amount: 180 },
    { name: "Spotify Premium", category: "Entertainment", amount: 119 },
    { name: "Broadband Internet", category: "Utilities", amount: 799 },
    { name: "Sneakers Purchase", category: "Shopping", amount: 4500 },
    { name: "Dentist Visit", category: "Health", amount: 1500 },
    { name: "Pizza Party", category: "Food", amount: 950 },
    { name: "Gas Refill", category: "Utilities", amount: 1050 },
    { name: "Train Ticket", category: "Transport", amount: 650 }
];

const generateDummyExpenses = () => {
    // Generate UUIDs using a simple generator function to avoid importing a library
    const uuidv4 = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentDate = new Date();
    const currentMonthStr = monthNames[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();

    return dummyExpenseNames.map((item, index) => {
        // Distribute dates across the current month (e.g. June 1 to June 16)
        const day = Math.max(1, Math.min(28, currentDate.getDate() - (index % 15)));
        const dateStr = `${currentMonthStr} ${day} ${currentYear}`;

        return {
            expenseId: uuidv4(),
            expenseName: item.name,
            expenseAmount: item.amount,
            paymentMode: index % 2 === 0 ? "Card" : "UPI",
            expenseDate: dateStr,
            expenseCategory: item.category,
            expenseType: "Non-Recurring"
        };
    });
};

async function run() {
    console.log("Fetching users from Supabase...");
    const { data: users, error: fetchError } = await supabase
        .from("User Data")
        .select("*");

    if (fetchError) {
        console.error("Error fetching users:", fetchError);
        return;
    }

    if (!users || users.length === 0) {
        console.log("No users found in 'User Data' table.");
        return;
    }

    console.log(`Found ${users.length} users:`);
    users.forEach((u, i) => console.log(`${i + 1}. ${u.email}`));

    // We will populate dummy data for all users in the DB
    for (const user of users) {
        console.log(`\nAdding 20 dummy expenses for user: ${user.email}`);
        const dummyExpenses = generateDummyExpenses();
        
        // Merge with existing expenses or replace
        const existingExpenses = Array.isArray(user.expenses) ? user.expenses : [];
        const updatedExpenses = [...dummyExpenses, ...existingExpenses];
        
        // Compute new savings (subtract dummy expenses from savings)
        const totalDummyAmount = dummyExpenses.reduce((sum, e) => sum + e.expenseAmount, 0);
        const updatedSavings = Math.max(0, (Number(user.savings) || 0) - totalDummyAmount);
        
        const { error: updateError } = await supabase
            .from("User Data")
            .update({
                expenses: updatedExpenses,
                // Make sure they have enough savings/income to offset it
                income: Math.max(Number(user.income) || 0, totalDummyAmount + 10000),
                savings: Math.max(Number(user.savings) || 0, totalDummyAmount + 5000)
            })
            .eq("email", user.email);

        if (updateError) {
            console.error(`Error updating user ${user.email}:`, updateError);
        } else {
            console.log(`Successfully added 20 dummy expenses for ${user.email}!`);
        }
    }
}

run();
