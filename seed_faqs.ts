import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in .env")
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding detailed FAQs...")

  let admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        id: "seed-admin-id",
        name: "System Admin",
        email: "mstelidevara123@gmail.com",
        role: "ADMIN"
      }
    })
    console.log("Created dummy Admin user for FAQs.")
  }

  const faqs = [
    {
      title: "Comprehensive Guide to the Startup Dashboard",
      slug: "navigating-startup-dashboard",
      content: `## Navigating Your Central Hub

Your Xentro Dashboard is the command center for your startup. From here, you have immediate access to all critical tools and metrics required to run and scale your operations.

### Key Sections of the Dashboard

1.  **Overview Metrics:** At the top of your dashboard, you will find high-level KPIs including your current Monthly Recurring Revenue (MRR), Active Users, and overall Growth Rate. These update in real-time.
2.  **Pitch Decks:** A dedicated section to manage your investor presentations. You can quick-launch into the Pitch Deck editor directly from the dashboard sidebar.
3.  **Financial Dashboards:** Access your real-time financial health, burn rate, and runway calculations.
4.  **Activity Feed:** A scrolling ledger of recent team activities, document updates, and system notifications.
5.  **Learning Modules:** Quick access to your enrolled courses and startup growth resources.

### Customizing Your View
You can reorganize the layout of your dashboard by clicking the **"Customize Dashboard"** button located at the top right. This allows you to drag and drop widgets, prioritizing the tools (like Financials or Pitch Decks) that matter most to your current growth stage.`,
      published: true,
      authorId: admin.id
    },
    {
      title: "Creating and Managing Pitch Decks",
      slug: "managing-pitch-decks",
      content: `## Perfecting Your Pitch

The Pitch Deck module is designed to help you craft, refine, and share your startup's vision with investors.

### Creating a New Deck
Navigate to **Dashboard > Pitch Decks > Create New**. You can choose to start from a blank canvas or use one of our industry-specific templates (e.g., SaaS, DeepTech, E-commerce).

### Key Features

*   **Collaborative Editing:** Invite co-founders or advisors to edit the deck in real-time. Cursor tracking and commenting are built-in.
*   **Version Control:** Every time you hit "Save Version," a snapshot is created. You can revert to older versions from the "History" tab.
*   **Secure Sharing:** When you are ready to share with investors, generate a secure link. You can set:
    *   Password protection
    *   Expiration dates
    *   View-only or Comment-allowed permissions
*   **Analytics:** Track which investors viewed your deck, which slides they spent the most time on, and drop-off points. This data appears in the Analytics tab of your specific deck.

### Exporting
Need a physical copy? Click the **Export** button to download your presentation as a high-resolution PDF or PowerPoint (.pptx) file.`,
      published: true,
      authorId: admin.id
    },
    {
      title: "Deep Dive into the Financial Dashboards",
      slug: "using-financial-dashboards",
      content: `## Understanding Your Financial Health

The Financial Dashboard integrates with your accounting software (like QuickBooks or Xero) and bank accounts to give you a live view of your startup's financial runway.

### Core Financial Widgets

1.  **Burn Rate & Runway:** The most critical metric for any startup. We calculate your average monthly burn over the last 3 months and divide it by your current cash balance to project exactly how many months of runway you have left.
2.  **Cash Flow Statement:** A live view of cash in vs. cash out. You can toggle this view between Monthly, Quarterly, and Annually.
3.  **Revenue Projections:** Based on your historical MRR growth, our predictive model forecasts your revenue for the next 12 months. You can adjust the "Aggressiveness" slider to model different scenarios.

### Adding Manual Entries
If you have offline expenses or unlinked accounts, navigate to **Financials > Ledger > Add Manual Entry**. Ensure you categorize these correctly (e.g., Payroll, Marketing, SaaS Subscriptions) so your charts remain accurate.

### Generating Investor Reports
At the end of the month, you can generate a one-click PDF report designed specifically for board members and investors. Go to **Financials > Reports > Generate Board Update**.`,
      published: true,
      authorId: admin.id
    },
    {
      title: "Editing Your Profile & Team Settings",
      slug: "edit-profile-settings",
      content: `## Managing Your Identity and Team

Keeping your profile and team settings up to date ensures smooth collaboration and accurate permissions across the platform.

### Editing Your Personal Profile
1. Click on your avatar in the bottom-left corner of the sidebar.
2. Select **"Edit Profile"**.
3. Here you can update your:
   *   Full Name
   *   Title / Role
   *   Contact Information
   *   Profile Picture
   *   Notification Preferences (Email vs. In-App)

### Managing Team Roles (Admin Only)
If you hold the Admin role, you have access to the **Organization Settings** tab.
1. Navigate to **Settings > Team Management**.
2. To invite a new member, click **"Invite User"** and enter their email.
3. **Role Assignment:**
   *   *Admin:* Full access, including billing and team management.
   *   *Editor:* Can create and edit Pitch Decks and Financial inputs.
   *   *Viewer:* Read-only access to dashboards and decks.

### Security Settings
We strongly recommend enabling Two-Factor Authentication (2FA). Go to **Settings > Security > Enable 2FA** and scan the QR code with your preferred authenticator app (e.g., Google Authenticator, Authy).`,
      published: true,
      authorId: admin.id
    },
    {
      title: "How to Use the Knowledge Base Search",
      slug: "using-faq-search",
      content: `## Finding Answers Quickly

The Xentro Knowledge Base is built to provide instant answers to your questions. The fastest way to find what you need is using the global search function.

### Best Practices for Searching

*   **Use Keywords:** Instead of typing full sentences like "How do I change my password?", simply type "change password" or "reset password".
*   **Fuzzy Matching:** Our search algorithm tolerates minor typos, so don't worry if you misspell a word slightly.
*   **Search Scope:** The search bar on the \`/faqs\` page scans both the **Titles** and the **Full Content** of every article. If your keyword appears anywhere in the guide, it will show up in the results.

### What if I can't find the answer?
If the search returns no results, or if the article doesn't fully resolve your issue, our Support Team is ready to help!

1. Navigate to your **Support Dashboard**.
2. Click on the **"New Ticket"** button.
3. Provide a detailed description of your issue, including any error messages you are seeing.
4. Our team typically responds within 2-4 hours.`,
      published: true,
      authorId: admin.id
    }
  ]

  for (const faq of faqs) {
    await prisma.fAQ.upsert({
      where: { slug: faq.slug },
      update: faq,
      create: faq
    })
  }

  console.log("Detailed FAQs seeded successfully!")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
