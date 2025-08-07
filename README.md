# 🔍 DIY UptimeRobot

A **self-hosted uptime monitoring dashboard** built with **Next.js** frontend + **Neon PostgreSQL** backend. Think of it as your personal UptimeRobot, but fully under your control — complete with a no-nonsense **Admin Portal** to manage everything.

> **You own the whole damn stack.**

![DIY UptimeRobot Dashboard](https://via.placeholder.com/800x400/3b82f6/ffffff?text=DIY+UptimeRobot+Dashboard)

## ✨ Features

### 🌐 **Website Monitoring**
- **Real-time health checks** for websites and APIs
- **Customizable check intervals** (1 minute to 1 hour)
- **Response time tracking** with millisecond precision
- **HTTP status code monitoring** (2xx/3xx = up, 4xx/5xx = down)
- **Comprehensive error detection** (DNS, timeout, connection issues)

### 📊 **Admin Dashboard**
- **Live monitoring dashboard** with real-time statistics
- **Site management** (add, edit, delete, manual checks)
- **Detailed logging** with search and filtering
- **User management** with role-based access control
- **Monitoring engine controls** (start/stop background processes)

### 🔐 **Authentication & Security**
- **JWT-based authentication** with HTTP-only cookies
- **bcrypt password hashing** (12 rounds)
- **Email confirmation** workflow (ready for SMTP)
- **Role-based permissions** (admin/user)
- **Secure API endpoints** with proper authorization

### 📈 **Public Status Pages**
- **Branded status pages** at \`/status/[slug]\`
- **Real-time uptime statistics** and response times
- **Incident history** and downtime tracking
- **Optional password protection**
- **Custom branding** support

### 🔔 **Smart Notifications** (Framework Ready)
- **Status change detection** (down → up, up → down)
- **Downtime duration tracking**
- **Notification framework** ready for email/Discord/Slack
- **Configurable alert preferences**

## 🏗️ Tech Stack

### **Frontend**
- **Next.js 14** (App Router)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Recharts** for data visualization
- **React Query patterns** for data fetching

### **Backend**
- **Next.js API Routes** (serverless functions)
- **Neon PostgreSQL** (serverless database)
- **JWT authentication** with secure cookies
- **Zod** for input validation
- **Background monitoring** with Node.js timers

### **Database**
- **PostgreSQL** with UUID primary keys
- **Optimized indexes** for performance
- **Foreign key constraints** for data integrity
- **Automatic timestamps** with triggers
- **JSONB support** for flexible configuration

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ 
- A Neon database account
- Git

### **1. Clone the Repository**
\`\`\`bash
git clone https://github.com/yourusername/diy-uptimerobot.git
cd diy-uptimerobot
\`\`\`

### **2. Install Dependencies**
\`\`\`bash
npm install
\`\`\`

### **3. Environment Setup**
Create a \`.env.local\` file in the root directory:

\`\`\`env
# Database (Required)
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# JWT Secret (Required - generate a secure random string)
JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"

# App URL (Optional)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
\`\`\`

### **4. Database Setup**
Run the database migration to create all tables and sample data:

\`\`\`bash
npm run db:setup
\`\`\`

This will create:
- All required database tables
- Proper indexes and constraints
- Sample admin and user accounts
- Database triggers for automatic timestamps

### **5. Start Development Server**
\`\`\`bash
npm run dev
\`\`\`

Visit \`http://localhost:3000\` to see your DIY UptimeRobot!

### **6. Login with Sample Accounts**
- **Admin:** \`admin@example.com\` / \`admin123\`
- **User:** \`john@example.com\` / \`user123\`

## 📖 Usage Guide

### **Adding Your First Site**

1. **Login** to the admin dashboard
2. **Navigate** to "Sites" in the sidebar
3. **Click "Add Site"** button
4. **Fill in the details:**
   - **Site Name:** A friendly name for your site
   - **URL:** The full URL to monitor (https://example.com)
   - **Check Interval:** How often to check (1-60 minutes)
   - **Timeout:** How long to wait for a response (10-60 seconds)
   - **Enable Notifications:** Get alerts when site goes down
   - **Public Status Page:** Allow public access to status

### **Starting the Monitoring Engine**

1. **Go to Settings** in the admin dashboard
2. **Click "Start Monitoring"** in the Monitoring Engine card
3. **Watch the console** for monitoring activity
4. **Check the logs** to see monitoring results

The monitoring engine will:
- Check each site based on its configured interval
- Record response times and status codes
- Detect when sites go down or recover
- Store all results in the database
- Trigger notifications on status changes

### **Manual Site Checks**

You can manually check any site instantly:
1. **Go to the Sites page**
2. **Click "Check Now"** next to any site
3. **See instant results** with response time and status
4. **Results are saved** to the database like scheduled checks

### **Viewing Monitoring Data**

- **Dashboard:** Overview of all sites with key metrics
- **Sites:** Detailed view of each monitored site
- **Logs:** Complete history of all monitoring checks
- **Status Pages:** Public-facing status for each site

## 🗄️ Database Schema

### **Core Tables**

\`\`\`sql
users              # User accounts and authentication
├── id (UUID)
├── username
├── email  
├── password_hash
├── role (admin/user)
└── status (active/inactive/pending)

sites              # Monitored websites
├── id (UUID)
├── user_id → users(id)
├── name
├── url
├── check_interval (minutes)
├── timeout_seconds
├── notifications_enabled
├── public_status_page
└── status_page_slug

site_checks        # Monitoring results
├── id (UUID)
├── site_id → sites(id)
├── status (up/down)
├── response_time (ms)
├── status_code
├── error_message
└── checked_at

incidents          # Downtime incidents
├── id (UUID)
├── site_id → sites(id)
├── title
├── description
├── status (investigating/resolved)
├── started_at
└── resolved_at

notifications      # Alert preferences
├── id (UUID)
├── user_id → users(id)
├── site_id → sites(id)
├── type (email/discord/slack)
├── config (JSONB)
└── enabled
\`\`\`

### **Key Features**
- **UUID primary keys** for better security and distribution
- **Foreign key constraints** ensure data integrity
- **Optimized indexes** on frequently queried columns
- **Automatic timestamps** with database triggers
- **JSONB configuration** for flexible notification settings

## 🔧 API Reference

### **Authentication**
\`\`\`http
POST /api/auth/register     # Create new user account
POST /api/auth/login        # Login with email/password
GET  /api/auth/me          # Get current user info
POST /api/auth/logout      # Logout and clear session
\`\`\`

### **Site Management**
\`\`\`http
GET    /api/sites          # List user's sites
POST   /api/sites          # Create new site
GET    /api/sites/[id]     # Get specific site
PUT    /api/sites/[id]     # Update site settings
DELETE /api/sites/[id]     # Delete site
\`\`\`

### **Monitoring**
\`\`\`http
POST /api/monitoring/start    # Start monitoring engine
POST /api/monitoring/stop     # Stop monitoring engine
GET  /api/monitoring/status   # Get engine status
POST /api/monitoring/check    # Manual site check
\`\`\`

### **Logs & Data**
\`\`\`http
GET /api/logs                 # Get monitoring logs
GET /api/status/[slug]        # Public status page data
\`\`\`

## 🎨 Customization

### **Styling**
The app uses **Tailwind CSS** with a custom design system:
- **Primary color:** Blue (\`#3b82f6\`)
- **Success color:** Green (\`#10b981\`)
- **Error color:** Red (\`#ef4444\`)
- **Warning color:** Yellow (\`#f59e0b\`)

To customize colors, edit \`app/globals.css\`:

\`\`\`css
:root {
  --primary: 221.2 83.2% 53.3%;        /* Blue */
  --destructive: 0 84.2% 60.2%;        /* Red */
  /* ... other CSS variables */
}
\`\`\`

### **Branding**
Update the logo and app name in:
- \`app/page.tsx\` (landing page)
- \`components/admin-sidebar.tsx\` (admin navigation)
- \`app/layout.tsx\` (page title and metadata)

### **Monitoring Intervals**
Default check intervals are defined in:
- \`app/admin/sites/new/page.tsx\` (site creation form)
- Database constraint allows 1-60 minutes

### **Notification Templates**
Notification logic is in \`lib/notifications.ts\`. Currently logs to console, but ready for:
- **Email templates** (HTML/text)
- **Discord webhooks** 
- **Slack integration**
- **Custom webhook endpoints**

## 🔒 Security Considerations

### **Authentication**
- **JWT tokens** stored in HTTP-only cookies
- **bcrypt hashing** with 12 rounds (industry standard)
- **CSRF protection** via SameSite cookies
- **Session expiration** (7 days default)

### **Database Security**
- **Parameterized queries** prevent SQL injection
- **User authorization** on all endpoints
- **Input validation** with Zod schemas
- **Foreign key constraints** prevent orphaned data

### **Network Security**
- **HTTPS enforcement** in production
- **Secure headers** (CSP, HSTS, etc.)
- **Rate limiting** ready for implementation
- **CORS configuration** for API endpoints

### **Monitoring Security**
- **User-Agent identification** in monitoring requests
- **Timeout protection** prevents hanging requests
- **Error handling** doesn't expose sensitive info
- **Site isolation** (users can only see their own sites)

## 🚀 Deployment

### **Vercel (Recommended)**

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Add environment variables:**
   - \`DATABASE_URL\`
   - \`JWT_SECRET\`
4. **Deploy automatically**

The monitoring engine will start automatically in production.

### **Docker Deployment**

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

### **Environment Variables for Production**

\`\`\`env
# Required
DATABASE_URL="postgresql://..."
JWT_SECRET="your-production-secret"

# Optional
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NODE_ENV="production"
\`\`\`

## 📊 Monitoring Best Practices

### **Check Intervals**
- **Critical services:** 1-2 minutes
- **Important services:** 5 minutes  
- **Regular monitoring:** 10-15 minutes
- **Low priority:** 30-60 minutes

### **Timeout Settings**
- **Fast APIs:** 10-20 seconds
- **Web applications:** 30 seconds
- **Slow services:** 60 seconds
- **Consider your server response times**

### **Site Organization**
- **Use descriptive names** (e.g., "Main Website", "Payment API")
- **Group related services** with consistent naming
- **Enable notifications** for critical services only
- **Use public status pages** for customer-facing services

## 🔮 Roadmap

### **Phase 1: Core Monitoring** ✅
- [x] Website health checking
- [x] Admin dashboard
- [x] User authentication
- [x] Database integration
- [x] Manual site checks

### **Phase 2: Real-time Features** 🚧
- [ ] WebSocket live updates
- [ ] Real-time dashboard
- [ ] Live status indicators
- [ ] Push notifications

### **Phase 3: Notifications** 📋
- [ ] SMTP email integration
- [ ] Discord webhook support
- [ ] Slack integration
- [ ] Custom webhook endpoints
- [ ] SMS notifications (Twilio)

### **Phase 4: Advanced Features** 📋
- [ ] Incident management system
- [ ] SLA reporting and analytics
- [ ] Multi-location monitoring
- [ ] API endpoint monitoring
- [ ] SSL certificate monitoring
- [ ] Domain expiration alerts

### **Phase 5: Enterprise Features** 📋
- [ ] Team collaboration
- [ ] Multi-tenant support
- [ ] Advanced analytics
- [ ] Custom dashboards
- [ ] API for integrations
- [ ] White-label solutions

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### **Development Setup**
1. **Fork the repository**
2. **Clone your fork**
3. **Create a feature branch**
4. **Make your changes**
5. **Test thoroughly**
6. **Submit a pull request**

### **Code Style**
- **TypeScript** for all new code
- **ESLint** for code quality
- **Prettier** for formatting
- **Conventional commits** for commit messages

### **Testing**
- **Unit tests** for utility functions
- **Integration tests** for API endpoints
- **E2E tests** for critical user flows
- **Manual testing** for UI changes

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **Neon** for serverless PostgreSQL
- **shadcn/ui** for beautiful components
- **Tailwind CSS** for utility-first styling
- **Vercel** for seamless deployment

## 📞 Support

### **Documentation**
- **GitHub Issues** for bug reports
- **GitHub Discussions** for questions
- **Wiki** for detailed guides

### **Community**
- **Discord Server** (coming soon)
- **Twitter** [@DIYUptimeRobot](https://twitter.com/DIYUptimeRobot)
- **Blog** with tutorials and updates

### **Professional Support**
For enterprise deployments and custom development:
- **Email:** support@diyuptimerobot.com
- **Consulting** available for large deployments

---

**Built with ❤️ by developers who believe in owning your infrastructure.**

*Star ⭐ this repo if you find it useful!*
