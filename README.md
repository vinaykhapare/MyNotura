# MyNotura — A Quiet Place to Write

> **"A digital notebook designed for pure, distraction-free personal writing."**  
> Built with **React 19**, **Vite**, **Tailwind CSS v4**, and **Supabase**.

---

## ✦ Core Vision & Design Philosophy

**MyNotura** is **not a Markdown editor** and **not a complex note-taking platform**. It is an intentional, distraction-free digital notebook where users can simply:

- **Create entries** in plain English text
- **Read & edit** with literary warmth powered by **Playfair Display**
- **Auto-save silently** as you type
- **Search entries** with instant filtering
- **Delete entries** with simple confirmation

### Typography Hierarchy
- **Playfair Display** → Main journal editor body, entry titles, literary reading experience
- **Inter** → Sidebar, buttons, search, navigation, metadata

### True Dark Palette
- **Background**: `#000000` (Pure Obsidian Black)
- **Sidebar**: `#0A0A0A`
- **Cards**: `#111111`
- **Borders**: `#1A1A1A`
- **Text**: `#FFFFFF`
- **Secondary Text**: `#A0A0A0`

---

## ✦ Project Structure

```
d:/My Projects/note-app/
├── client/
│   ├── public/
│   │   ├── favicon.svg                  # Handcrafted vector brand icon
│   │   └── _redirects                   # SPA routing rule for production
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── AuthForm.tsx         # Quiet, card-centered auth
│   │   │   │   └── ProtectedRoute.tsx   # Auth guard with brand loader
│   │   │   ├── brand/
│   │   │   │   ├── AppIcon.tsx          # Minimalist monochrome symbol
│   │   │   │   └── Logo.tsx             # Full logo (Icon + Wordmark)
│   │   │   ├── dashboard/
│   │   │   │   ├── DeleteConfirmModal.tsx # Minimal delete confirmation
│   │   │   │   ├── JournalEditor.tsx    # Playfair Display writing canvas
│   │   │   │   └── Sidebar.tsx          # Collapsible sidebar with notes list
│   │   │   ├── landing/
│   │   │   │   ├── Features.tsx         # 3 focused writing features
│   │   │   │   ├── Footer.tsx           # Minimalist dark footer
│   │   │   │   ├── Hero.tsx             # Literary hero with live mockup
│   │   │   │   └── Navbar.tsx           # Quiet sticky header
│   │   │   └── ui/
│   │   │       ├── Button.tsx           # Monochrome button variants
│   │   │       ├── EnvNoticeBanner.tsx  # Unobtrusive demo banner
│   │   │       ├── Input.tsx            # Form input
│   │   │       ├── Modal.tsx            # Backdrop blur modal
│   │   │       └── Toast.tsx            # Action notifications
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx          # Supabase auth session + local demo
│   │   │   └── NotesContext.tsx         # Journal state & active note syncing
│   │   ├── lib/
│   │   │   ├── supabase.ts              # Supabase client initializer
│   │   │   └── utils.ts                 # Relative date & word count
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx        # Two-pane digital journal workspace
│   │   │   ├── LandingPage.tsx          # Refined literary landing page
│   │   │   └── LoginPage.tsx            # Minimal auth page
│   │   ├── types/
│   │   │   └── note.ts                  # Clean TypeScript definitions
│   │   ├── App.tsx                      # App router & providers
│   │   ├── index.css                    # Tailwind CSS v4 styling rules
│   │   └── main.tsx                     # Entry point
│   ├── .env.example                     # Environment template
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── supabase/
│   └── schema.sql                       # PostgreSQL table schema & RLS policies
└── README.md
```

---

## ✦ Getting Started

### 1. Installation
```powershell
cd client
npm install
```

### 2. Configure Environment Variables
Inside `client/`, create a `.env` file (or copy from `.env.example`):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
*(Without credentials, MyNotura automatically operates in an offline **Local Demo Mode** with pre-seeded journal entries so you can begin writing immediately).*

### 3. Start Development Server
```powershell
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.
