# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 starter template with comprehensive authentication using Better Auth, built with TypeScript, Tailwind CSS, and modern development tools.

**Tech Stack:**
- **Framework**: Next.js 15 with App Router, React 19
- **Authentication**: Better Auth v1.3.9 with plugins (2FA, passkeys, organizations, etc.)
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: shadcn/ui components, Tailwind CSS, Lucide icons
- **Code Quality**: Biome for linting/formatting, strict TypeScript
- **Environment**: Type-safe env variables with @t3-oss/env-nextjs

## Development Commands

```bash
# Development (with Turbopack)
pnpm dev

# Build (with Turbopack)
pnpm build

# Code quality check (TypeScript + Biome check + format)
pnpm check

# Individual tools
pnpm lint        # Biome check only
pnpm format      # Biome format

# Database operations
pnpm db:generate # Generate migrations
pnpm db:migrate  # Run migrations
pnpm db:push     # Push schema changes
pnpm db:studio   # Open Drizzle Studio
pnpm db:seed     # Seed database

# Better Auth
pnpm auth:gen    # Generate auth schema
```

## Project Architecture

### Route Structure
- `app/(auth)/` - Authentication pages (sign-in, sign-up, reset-password, etc.)
- `app/(main)/` - Public pages with main layout
- `app/(dashboard)/` - Protected dashboard pages
- `app/api/auth/[...all]/` - Better Auth API routes

### Component Organization
- `components/ui/` - shadcn/ui components (accordion, button, card, etc.)
- `components/layout/` - App layout components (navbar, footer, user-actions)
- `components/` - Other reusable components (profile-dropdown, theme-toggle)

### Core Directories and File Organization

- `actions/` - Server actions (all files must use "use server" directive)
- `components/` - React components organized by type and purpose
- `context/` - React contexts and providers
- `data/` - Static data (navigation links, constants, configuration data)
- `db/` - Database client, schema, migrations, and seed files
- `hooks/` - Custom React hooks
- `lib/` - Shared utilities and configurations
- `styles/` - Global CSS and styling files

### Key Files and Their Purpose

**Authentication Files:**
- `lib/auth.ts` - Server-side Better Auth configuration
- `lib/auth-client.tsx` - Client-side auth hooks and utilities

**Shared Utilities:**
- `lib/shared.ts` - Shared utilities and callback URLs
- `lib/path.ts` - Centralized URL/route definitions
- `lib/utils.ts` - General utility functions
- `lib/config.ts` - Site configuration

**Data Files:**
- `data/navLinks.tsx` - Navigation menu structure
- `data/` - Other static data and constants

**Styling:**
- `styles/global.css` - Global styles and Tailwind imports

## Authentication (Better Auth)

The app uses Better Auth with extensive plugin configuration including:
- Email/password authentication with verification
- Google OAuth
- Two-factor authentication (TOTP + backup codes)
- Passkey support
- Organization/team management with invitations
- Admin roles and permissions
- Multi-session support
- Device authorization

**Key Files:**
- `lib/auth.ts` - Server-side auth configuration
- `lib/auth-client.tsx` - Client-side auth hooks and utilities
- `db/schema/auth.ts` - Database schema for auth tables
- `docs/better-auth-llm.txt` - Better Auth documentation reference

**Auth Patterns:**
- Use `useSession()` hook for accessing current user
- Server actions should handle auth redirects and errors properly
- Follow Better Auth client patterns for sign-in/sign-up flows
- Organization features require admin role for creation

## Database (Drizzle + PostgreSQL)

- **Schema Location**: `db/schema/` directory
- **Client**: `db/client.ts` exports the main db instance
- **Migrations**: Auto-generated in `drizzle/` directory
- **Config**: `drizzle.config.ts` for Drizzle Kit

**Schema Structure:**
- Auth tables: `user`, `session`, `account`, `verification`, `organization`, `member`, `invitation`, `twoFactor`, `passkey`, `deviceCode`
- Follow existing patterns for new tables
- Use proper foreign key relationships with cascade deletes

## Server Actions

All server actions must be placed in the `actions/` directory and follow these patterns:

**File Structure:**
- Each server action file must start with `"use server"` directive
- Define proper input and output types when necessary
- Use standardized return format: `{ data?, error?, success? }`

**Example Server Action Pattern:**
```typescript
"use server"

import { z } from "zod/v4"

// Input validation schema
const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

type CreateUserInput = z.infer<typeof CreateUserSchema>
type CreateUserOutput = {
  data?: { id: string }
  error?: string
  success?: string
}

export async function createUser(input: CreateUserInput): Promise<CreateUserOutput> {
  // Server action implementation
}
```

## Forms and Validation

- **Forms**: Use React Hook Form for all forms
- **Validation**: Use Zod v4 for schema validation
- **Server Actions**: Must return standardized format with `{ data?, error?, success? }`
- **Error Handling**: Handle and display errors consistently across the app

## UI Components (shadcn/ui)

- Use shadcn/ui components from `components/ui/`
- Follow New York style variant
- Components are configured for Tailwind CSS variables
- Lucide React for icons
- Dark mode support with next-themes

**shadcn Configuration:**
- Style: "new-york"
- CSS Variables: enabled
- Base color: "neutral"
- Components path: `@/components/ui`

## Dashboard Design System

The dashboard follows a comprehensive design system with consistent layouts, spacing, and component patterns. All dashboard pages must adhere to these guidelines:

**Key Guidelines:**
- Use `DashboardPageContainer` for all dashboard pages with breadcrumb navigation
- Consistent spacing: `p-6` for content, `space-y-6` between sections, `gap-4` for component groups
- Header heights: `h-14` for all headers (sidebar, breadcrumbs, mobile header)
- Responsive design with mobile-first approach
- Modern design inspired by Vercel, Linear, GitHub, and Stripe

**For detailed guidelines, see `docs/dashboard.md`** which covers:
- Layout structure and hierarchy
- Spacing system and measurements
- Component patterns and usage
- Responsive behavior and mobile adaptations
- Accessibility requirements
- Common UI patterns (forms, tables, actions)
- Performance and future considerations

## Development Guidelines

### TypeScript
- Strict mode enabled
- Never use `any` types
- Use proper typing for Better Auth sessions and database queries
- Leverage Drizzle's type inference

### Code Style (Biome)
- 2-space indentation
- Recommended rules for Next.js and React
- Import organization enabled
- Some accessibility rules disabled for UI components

### Component Patterns
- Group related components in subdirectories
- Use proper prop interfaces
- Follow existing naming conventions
- Prefer composition over complex prop drilling

### File Organization Rules
- **Server Actions**: Always place in `actions/` folder with "use server" directive
- **Components**: Organize in `components/` with subdirectories (ui/, layout/)
- **Hooks**: Custom hooks go in `hooks/` folder
- **Utilities**: Shared functions in `lib/` folder
- **Data**: Static data and constants in `data/` folder
- **Styles**: CSS files in `styles/` folder
- **URLs**: All route definitions in `lib/path.ts`
- **Config**: Site configuration in `lib/config.ts`
- **Shared Logic**: Reusable utilities and callback URLs in `lib/shared.ts`

### Environment Variables
- Defined in `env.ts` with Zod validation
- Server and client vars properly separated
- Required vars: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, Google OAuth credentials, SMTP config

## Important Paths and Configuration

- `lib/path.ts` - Centralized route definitions
- `lib/config.ts` - Site configuration
- `biome.json` - Linting and formatting config
- `components.json` - shadcn/ui configuration
- `next.config.ts` - Next.js configuration with image domains

## Email System

- Uses `@react-email/components` for email templates
- SMTP configuration via environment variables
- Templates in `lib/email/` directory
- Integrated with Better Auth for verification and password reset emails

## Testing and Quality

Always run quality checks after making changes:
```bash
pnpm check  # TypeScript + Biome check + format
```

## Docker Support

- `docker-compose.yml` available for PostgreSQL database
- Use for local development database setup