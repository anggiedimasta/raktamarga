# Bloodline App - Product Requirements Document

## 1. Executive Summary

**Product Name:** Bloodline (Raktamarga)**Product Vision:** A modern genealogy and family tree application that allows families to document their lineage, connect with extended family members, and maintain privacy-controlled family networks.**Core Value Proposition:**

- Build and visualize family trees with admin-validated data
- Connect families through shared members (like real-world relationships)
- Privacy-first: Each member controls their data visibility
- Modern tech stack for performance and developer experience
- Type-safe end-to-end: TanStack Router + tRPC + Effect for maximum type safety

---

## 2. Technical Architecture

### 2.1 Monorepo Structure (Bun)

```javascript
raktamarga/
├── apps/
│   ├── web/              # TanStack Start frontend (React 19)
│   │   └── src/
│   │       ├── app/       # App layer (providers, root layout)
│   │       ├── routes/    # Type-safe routing (TanStack Router)
│   │       ├── features/  # Feature-specific logic (Hooks + Query)
│   │       ├── entities/  # Domain entities (Family, Member)
│   │       └── shared/    # UI (shadcn/ui), tRPC client, utils
│   └── api/              # Backend API (Elysia, feature-based)
│       └── src/
│           ├── modules/   # Feature modules
│           │   ├── auth/
│           │   ├── family/
│           │   ├── member/
│           │   └── connection/
│           ├── utils/     # Shared utilities
│           └── types/     # Shared types
├── packages/
│   ├── ui/               # Shared React shadcn/ui components
│   ├── db/               # Database schema & migrations
│   ├── auth/             # BetterAuth configuration
│   └── shared/           # Shared utilities & types
├── docs/                 # All documentation (PRD, architecture, etc.)
├── bun.lockb
└── package.json
```



### 2.2 Technology Stack Recommendations

#### Frontend

- **Framework:** TanStack Start (React 19)
- **Routing:** TanStack Router (100% type-safe, file-based routing)
- **UI Library:** shadcn/ui (React version - the original)
- **State Management:** React hooks + TanStack Query (built-in server state management)
- **Forms:** React Hook Form + Zod validation
- **Charts/Visualization:** D3.js or React-Flow for family tree graphs (better React ecosystem support)
- **Date Handling:** date-fns or Temporal (when stable)

**Frontend Architecture Benefits:**
- **End-to-End Type Safety:** TanStack Router ensures API types flow perfectly to UI components without manual type casting
- **Complex Search Params:** Better support for JSON-based, type-safe search parameters (e.g., `?filter=maternal&depth=3`)
- **Ecosystem Compatibility:** Access to mature React visualization libraries (React-Flow excellent for family tree visualizations)

**Trade-offs:**
- **Bundle Size:** React + TanStack Start ships more JavaScript to the browser than Svelte's compiled output
- **Complexity:** Move from Svelte's "plain HTML" feel to React's "Hooks and JSX" complexity

#### Backend

- **Runtime:** Bun (for API server)
- **Framework:** Elysia (Bun-optimized, excellent tRPC integration)
- **Architecture:** Feature-based modules
- Each module: controller (index.ts), service (service.ts), model (model.ts)
- Modules: auth, family, member, connection, notification, event
- **Database:** PostgreSQL on Neon (serverless Postgres) - See Graph DB analysis in section 7.1.1
- **ORM:** Drizzle ORM (TypeScript-first, excellent with Bun)
- **Error Handling & Services:** Effect (type-safe error handling, resource management, observability)
- **Auth:** BetterAuth (supports phone, OAuth, sessions)
- **API:** tRPC (end-to-end type safety, perfect for monorepo)

**Effect Integration:**
- Type-safe error handling in service layer (replaces try/catch with Effect types)
- Dependency injection via Effect Context (database, logger, config)
- Built-in observability (logging, metrics, tracing with OpenTelemetry support)
- Structured concurrency and retry mechanisms for database operations
- Unified standard library for backend operations

#### Infrastructure & Services (Free Tier Priority for MVP)

**Deployment: Railway** (Primary choice for both frontend and backend)

- **Free Trial:** $5 credits for 30 days (1 GB RAM, shared vCPU per service, up to 5 services per project)
- **Free Plan:** $1/month non-rollover credits after trial (sufficient for lightweight services)
- **Hobby Plan:** $5/month with $5 monthly credits (8 GB RAM, 8 vCPU per service) - upgrade if needed
- Usage-based pricing: Pay per second for resources consumed
- **Recommendation:** Start with free trial, then free plan for MVP

**Database: Neon** (Serverless PostgreSQL)

- **Free Tier (2025):**
- 0.5 GB storage per project
- 100 Compute Unit (CU) hours per project
- Up to 20 projects per user
- Up to 10 branches per project
- Autoscaling up to 2 CUs (2 vCPUs, 8 GB RAM)
- Scale to zero after 5 minutes inactivity
- 5 GB public network transfer
- 6 hours restore history (or 1 GB data changes)
- **Perfect for MVP:** More than sufficient for development and initial users
- **Database Strategy:** Use PostgreSQL LTree extension for efficient family tree pathing and graph-like traversal

**File Storage: Cloudflare R2** (S3-compatible object storage)

- **Free Tier (2025):**
- 10 GB storage per month
- 1 million Class A operations (writes, lists)
- 10 million Class B operations (reads)
- **Unlimited egress** (data transfer out) - FREE
- **Perfect for MVP:** Handles profile photos and family images

**Email: Resend**

- **Free Tier (2025):**
- 3,000 emails per month
- 100 emails per day limit
- 1 custom domain per team
- 2 requests per second rate limit
- **Perfect for MVP:** Sufficient for user notifications and admin alerts

**Authentication: BetterAuth**

- **Free:** Open source (MIT license), self-hosted
- **No costs:** No licensing fees, no per-user charges
- **Full control:** Complete control over auth infrastructure and user data
- **Perfect for MVP:** Completely free, just hosting costs (covered by Railway)

**SMS/Phone Authentication:**

- **Challenge:** No truly free tier for Indonesian phone numbers
- **Options:**

1. **Alibaba Cloud:** Free trial with 100 SMS (then ~Rp500/SMS)
2. **Google OAuth (Fallback):** Free, no limits - use if phone auth not feasible
3. **BetterAuth:** Supports both phone and OAuth - can implement hybrid approach

- **MVP Recommendation:** Start with Google OAuth (free), add phone auth later if needed
- **Alternative:** Use phone auth only for production, OAuth for MVP

**Frontend Deployment:**

- **Cloudflare Pages (Recommended):**
- Unlimited bandwidth
- Fast edge delivery
- Free tier with generous limits
- Excellent for static and server-rendered React applications
- **Alternative:** Railway for unified deployment (simpler for MVP)

#### Development Tools

- **Package Manager:** Bun
- **Type Checking:** TypeScript (strict mode)
- **Linting & Formatting:** Biome (replaces ESLint + Prettier)
- Single tool for linting, formatting, and import sorting
- 15x faster than ESLint (Rust-based)
- Built-in TypeScript support (Biome 2.0+)
- **Testing:** Vitest + Testing Library (always write tests)
- Unit tests for all business logic
- Integration tests for API endpoints
- Component tests for UI components (React Testing Library)
- Test coverage requirement: Minimum 80%
- **E2E:** Playwright
- **Backend Error Handling:** Effect (type-safe error handling, resource management, observability)

### 2.3 Authentication Strategy (Hybrid Approach)

**MVP: Google OAuth (Primary)**

- **Free:** No cost, unlimited usage
- BetterAuth supports Google OAuth out of the box
- Simple implementation for MVP
- **Start here for MVP**

**Future Enhancement: Phone Authentication (No SMS)**

- Use BetterAuth's phone authentication
- **No SMS:** Phone number verification without SMS (BetterAuth supports this)
- **WhatsApp Integration:** Add WhatsApp-based OTP later (BetterAuth supports WhatsApp)
- Phone numbers stored with country code format (+62XXXXXXXXXXX)
- **Implementation:** Phone auth without SMS, WhatsApp OTP as future enhancement

**Hybrid Implementation:**

- BetterAuth supports both phone and OAuth simultaneously
- Users can choose: Google OAuth OR Phone (no SMS) OR WhatsApp (future)
- **MVP:** Google OAuth only
- **Phase 2:** Add phone auth (no SMS)
- **Phase 3:** Add WhatsApp OTP authentication

---

## 3. Core Features

### 3.1 User Authentication & Onboarding

**3.1.1 Sign Up/Sign In**

- **Primary:** Google OAuth (MVP)
- **Future:** Phone authentication (no SMS) + WhatsApp OTP
- Profile creation: Name, date of birth, profile photo
- Initial family creation or join existing family

**3.1.2 Family Creation**

- First user becomes family admin automatically
- Family name, description, cover photo
- **Family Code:** Required, unique identifier (similar to username)
- Format: Alphanumeric, 6-12 characters
- Used for joining families (share code with family members)
- Must be unique across platform
- Displayed prominently for easy sharing

**3.1.3 Join Family by Code**

- Users can join existing families using family code
- Enter family code → Request sent to family admin
- Admin approves/rejects join request
- Upon approval, user becomes family member

### 3.2 Role-Based Access Control

**Roles:**

1. **Family Admin**

- Validate member submissions/edits
- Manage family settings
- Invite/remove members
- Approve family interconnections
- View all family data (regardless of privacy settings)

2. **Family Member**

- Submit new family members
- Edit their own profile
- Request edits to other members (requires admin approval)
- Control their own privacy settings

**Permission Model:**

- Admin approval required for:
- Adding new family members
- Editing existing member data (except own profile)
- Connecting to other families
- Members can edit their own profile immediately (with admin notification)

### 3.3 Family Tree Management

**3.3.1 Member Management**

- Add family members (name, DOB, DOD, gender, relationships, photos)
- Relationship types: Parent, Child, Sibling, Spouse, Partner
- Support for complex relationships (adoption, step-siblings, etc.)
- Timeline view: Birth, marriage, death events

**3.3.2 Family Tree Visualization**

- Interactive tree/graph view (D3.js or Cytoscape.js)
- Multiple layout options: hierarchical, radial, force-directed
- Search and filter members
- Export as image/PDF

**3.3.3 Data Validation**

- Admin reviews all submissions
- Edit history/audit log
- Revert changes capability

### 3.4 Family Interconnection

**3.4.1 Connection Model**

- Families connect through shared members (like real life)
- Example: Person A in Family 1 marries Person B in Family 2
- Both families become "connected families"
- Connection requires approval from both family admins

**Connection Request Flow:**

1. User requests connection (e.g., "I am married to Person X from Family Y")
2. Connection request created with status: **Pending**
3. Request visible to both family admins with **"Unverified"** badge
4. Both admins must approve → Status changes to **Verified**
5. If one admin rejects → Status: **Rejected**, connection not established
6. **Unverified connections** are visible but marked clearly in UI
7. Verified connections enable full data sharing (based on privacy settings)

**3.4.2 Connection Degrees**

- **Direct Connection:** Shared member (1st degree)
- **Indirect Connection:** Through another connected family (2nd degree, 3rd degree, etc.)
- Connection graph visualization

**3.4.3 Privacy Controls (Per Member)**Each member controls their data visibility:**Visibility Levels:**

1. **Private:** Only visible to own family admin
2. **Family Only:** Visible to all members of own family
3. **1st Degree Connections:** Visible to directly connected families
4. **2nd Degree Connections:** Visible to families connected through one intermediary
5. **3rd+ Degree Connections:** Extends further
6. **Public:** Visible to all connected families (within the platform)

**Controlled Data:**

- Profile information (name, DOB, photos)
- Relationship information
- Timeline events
- Contact information (optional field)

**Alternative/Refined Model:**Instead of numeric degrees, use relationship-based categories:

- **Immediate Family:** Parents, siblings, children, spouse
- **Extended Family:** Aunts, uncles, cousins, grandparents
- **Connected Families:** Families linked through marriage/partnership
- **Extended Connections:** Families connected through extended connections
- **Public:** All platform users

This is more intuitive for family context than "1st/2nd degree" which feels more like LinkedIn.**Recommendation:** Use relationship-based categories with admin override capability.

### 3.5 Event Logging & Timeline

**3.5.1 Event Types**

- **Life Events:** Birth, Death, Marriage, Divorce
- **Relationship Events:** Marriage, Partnership, Adoption
- **Location Events:** Birthplace, Death place, Residence changes
- **Custom Events:** User-defined events (graduation, migration, etc.)

**3.5.2 Timeline Views**

- **Person Timeline:** All events for a specific person
- Example: "Person A died at Jakarta on 2024-01-15"
- Example: "Person B married Person H at Bandung on 2020-06-20"
- Chronologically ordered
- Filterable by event type
- **Family Timeline:** Aggregated events for entire family
- All family members' events in chronological order
- Filterable by person, event type, date range
- Visual timeline with markers

**3.5.3 Event Data**

- Event type, date, location, description
- Related persons (for relationship events)
- Photos/documents attached to events
- Privacy settings per event (inherits from person or custom)

**3.5.4 Event Creation**

- Members can submit events (requires admin approval)
- Admins can create events directly
- Events linked to family members
- Validation: Date consistency checks, relationship validation

### 3.6 In-App Notifications

**3.6.1 Notification Types**

- **Admin Notifications:**
- New member submission pending approval
- Member edit request pending approval
- Family connection request (unverified)
- Join family request
- **Member Notifications:**
- Submission approved/rejected
- Edit request approved/rejected
- New family member added
- Family connection established
- Event added to timeline
- Privacy setting changes

**3.6.2 Notification Features**

- Real-time notifications (WebSocket/SSE)
- Notification center/bell icon
- Mark as read/unread
- Notification preferences (email digest, in-app only)
- Notification history (last 30 days)

**3.6.3 Notification Display**

- Badge count on notification icon
- Toast notifications for important events
- Notification list with filtering
- Grouped notifications (e.g., "5 pending approvals")

### 3.7 Privacy & Security

**3.5.1 Data Privacy**

- GDPR/Data Protection compliance considerations
- Data export (JSON/GEDCOM format)
- Account deletion with data retention policies
- Encryption at rest and in transit

**3.5.2 Access Control**

- JWT-based sessions (BetterAuth)
- Role-based API endpoints
- Rate limiting
- Input validation and sanitization

---

## 4. Data Model (High Level)

### Core Entities

**Users**

- id, email/phone, auth_provider, created_at, updated_at

**Families**

- id, name, description, family_code (unique), admin_id, created_at, updated_at

**Family Members**

- id, family_id, user_id (nullable - for registered users), name, dob, dod, gender, profile_photo, privacy_settings, created_by, created_at, updated_at

**Relationships**

- id, member1_id, member2_id, relationship_type, verified, created_at

**Family Connections**

- id, family1_id, family2_id, connecting_member_id, status (pending/verified/rejected), verified (boolean), approved_by_family1_admin, approved_by_family2_admin, created_at, verified_at

**Events**

- id, member_id, event_type, event_date, location, description, related_member_id (nullable), photos (JSON array), privacy_level, created_by, created_at, updated_at

**Notifications**

- id, user_id, type, title, message, related_entity_type, related_entity_id, read (boolean), created_at

**Member Submissions**

- id, family_id, member_data (JSON), submission_type (create/update), status (pending/approved/rejected), submitted_by, reviewed_by, created_at

**Privacy Settings**

- member_id, visibility_level, custom_rules (JSON)

---

## 5. User Flows

### 5.1 New User Onboarding

1. Sign up (Google OAuth - MVP)
2. Create profile (name, DOB, photo)
3. **Option A - Create Family:**

- Enter family name, description
- Generate or choose family code (unique identifier)
- Become family admin automatically
- Add initial family members

4. **Option B - Join Family:**

- Enter family code
- Request sent to family admin
- Wait for admin approval
- Upon approval: Become family member

### 5.2 Adding Family Member

1. Member submits new person form
2. Submission queued for admin review
3. Admin reviews, approves/rejects/requests changes
4. If approved: member added to family tree
5. Notification sent to submitter

### 5.3 Connecting Families

1. Member identifies shared person (e.g., "I am married to X from Family Y")
2. Connection request created with status: **Pending/Unverified**
3. Request visible to both family admins with **"Unverified"** badge
4. Both admins review and approve → Status changes to **Verified**
5. If both approve: Families connected, full data sharing enabled (based on privacy)
6. If one rejects: Connection not established, request marked as rejected
7. **Unverified connections** remain visible but clearly marked in UI

### 5.4 Viewing Family Tree

1. User navigates to family tree view
2. System calculates visible members based on:

- User's role (admin sees all)
- Member privacy settings
- Connection degrees

3. Tree rendered with visible members only

---

## 6. Non-Functional Requirements

### 6.1 Performance

- Initial page load < 2s
- Family tree rendering < 1s for up to 500 members
- API response time < 200ms (p95)

### 6.2 Scalability

- Support 10,000+ families
- Support family trees with 1,000+ members
- Efficient graph traversal for connection calculations

### 6.3 Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- High contrast mode

### 6.4 Internationalization

- Primary: Indonesian (Bahasa Indonesia)
- Secondary: English
- Date formats, number formats localized

---

## 7. Technical Recommendations

### 7.1 Database Design

**7.1.1 PostgreSQL vs Graph Database AnalysisPostgreSQL (Recommended for MVP)Pros:**

- Free tier available (Neon: 0.5 GB, 100 CU hours)
- Excellent transactional support (ACID compliance)
- JSONB support for flexible member data
- Mature ecosystem, extensive tooling
- Can handle graph queries with recursive CTEs
- Better for structured data (users, families, events)
- Easier to implement with existing stack (Drizzle ORM)

**Cons:**

- Complex relationship queries require recursive CTEs (more complex SQL)
- Performance degrades with deeply nested relationships
- Not optimized for graph traversal

**Neo4j (Graph Database Alternative)Pros:**

- Native graph model (nodes = people, edges = relationships)
- Intuitive for family tree data structure
- Excellent performance for relationship traversal
- Cypher query language designed for graphs
- Natural fit for genealogy applications

**Cons:**

- No free tier (paid plans start ~$65/month)
- Additional infrastructure complexity
- Learning curve for Cypher queries
- Less suitable for structured data (users, notifications, events)
- Would require dual database setup (PostgreSQL + Neo4j)

**Recommendation: Start with PostgreSQLRationale:**

1. **Cost:** Free tier sufficient for MVP (Neon)
2. **Simplicity:** Single database, easier to manage
3. **MVP Scale:** PostgreSQL handles 1,000+ member trees efficiently
4. **Flexibility:** JSONB allows flexible member data
5. **Migration Path:** Can add Neo4j later if needed (when scale requires it)

**When to Consider Neo4j:**

- Family trees exceed 10,000 members
- Complex relationship queries become performance bottleneck
- Need advanced graph analytics (e.g., "find all descendants of X")
- Budget allows for additional database infrastructure

**7.1.2 Database Schema (PostgreSQL)**

- Use PostgreSQL with JSONB for flexible member data
- Recursive CTEs for relationship traversal
- Indexes on: family_id, user_id, relationship lookups, family_code
- Consider materialized views for frequently accessed family trees

### 7.2 Caching Strategy

- Redis for session management (BetterAuth)
- Cache family tree data (invalidate on updates)
- CDN for static assets and images

### 7.2.1 Framework Choice: Elysia vs Hono

**Comparison:**| Aspect | Elysia | Hono ||--------|--------|------|| **Performance** | ~1.8M RPS (faster) | ~740K RPS || **tRPC Integration** | Official plugin (`@elysiajs/trpc`) | Community adapter (`@hono/trpc-router`) || **Runtime Support** | Bun-optimized (primary) | Cross-runtime (Node, Deno, Bun) || **Developer Experience** | Ergonomic syntax, static code analysis | Minimalist, lightweight || **Type Safety** | Built-in type inference | Web Standard APIs |**Decision: ElysiaRationale:**

1. **Bun Optimization:** Since we're committed to Bun, Elysia's Bun-first design provides better performance
2. **tRPC Integration:** Official `@elysiajs/trpc` plugin with first-class support
3. **Performance:** Significantly higher throughput (2.5x faster in benchmarks)
4. **Developer Experience:** Better ergonomics with method chaining and static analysis
5. **Type Safety:** Excellent TypeScript integration aligns with our tRPC + TypeScript stack

**Trade-offs:**

- Less runtime flexibility (Bun-only), but acceptable since we're Bun-committed
- Slightly larger bundle size, but negligible for backend

### 7.3 API Design

- **tRPC** for end-to-end type safety (primary choice)
- Perfect for monorepo architecture
- Shared types between frontend and backend
- Automatic type inference
- Built-in request/response validation
- Excellent developer experience with TanStack Start and TanStack Router
- Integration: Use `@elysiajs/trpc` plugin for seamless Elysia integration

### 7.3.1 Error Handling with Effect

- **Effect** for type-safe error handling in service layer
- Replace try/catch with Effect types for explicit error handling
- Use `Effect.catchTags` for handling specific error types (DatabaseError, ValidationError, etc.)
- Effect Context for dependency injection (database, logger, config)
- Built-in observability: logging, metrics, and tracing with OpenTelemetry support
- Structured concurrency for parallel operations
- Retry mechanisms with declarative scheduling

**Benefits:**
- Type-safe error handling eliminates runtime surprises
- Explicit error types make error handling predictable
- Dependency injection improves testability
- Built-in observability reduces need for external tools
- Structured concurrency prevents resource leaks

**Example Service Pattern:**
```typescript
import { Effect, Context, pipe } from 'effect'

// Define service dependencies
class DatabaseService extends Context.Tag('DatabaseService')<
  DatabaseService,
  { query: (sql: string) => Effect.Effect<Result, DatabaseError> }
>() {}

// Service method using Effect
export class FamilyService {
  create(data: NewFamily): Effect.Effect<Family, DatabaseError | ValidationError> {
    return pipe(
      DatabaseService,
      Effect.flatMap((db) => db.query(`INSERT INTO families ...`)),
      Effect.catchTag('DatabaseError', (error) =>
        Effect.fail(new DatabaseError('Failed to create family', error))
      )
    )
  }
}
```

**Installation:**
```bash
cd apps/api
bun add effect
```

See [Effect Documentation](https://effect.website/docs/quickstart) for setup and usage.

### 7.4 Real-time Features (Future)

- WebSocket/SSE for admin notifications
- Real-time family tree updates
- Consider: PartyKit, Pusher, or Supabase Realtime

### 7.5 Testing Strategy (Always Write Tests)

**Testing Requirements:**

- **Unit Tests:** All business logic, services, utilities
- Minimum 80% code coverage
- Test all edge cases and error scenarios
- Use Vitest for fast execution
- **Integration Tests:** API endpoints, tRPC procedures
- Test full request/response cycles
- Test authentication and authorization
- Test database interactions
- **Component Tests:** UI components (React components)
- Test user interactions
- Test component rendering
- Test form validation
- Use React Testing Library for component testing
- **E2E Tests:** Critical user flows
- User registration and login
- Family creation and joining
- Member submission and approval
- Family connection flow

**Testing Tools:**

- **Vitest:** Unit and integration tests
- **Testing Library:** Component testing
- **Playwright:** E2E testing
- **Test Coverage:** Use Vitest's coverage reporting

**Testing Best Practices:**

- Write tests alongside code (TDD when possible)
- Tests must pass before merging PRs
- Mock external dependencies (database, APIs)
- Use descriptive test names
- Keep tests maintainable and readable

---

## 8. Development Phases

### Phase 1: MVP (Weeks 1-4)

- Authentication (Google OAuth)
- Basic family creation with family code
- Join family by code
- Add/view family members
- Admin approval workflow
- Simple tree visualization
- Basic event logging (birth, death, marriage)
- In-app notifications (basic)
- Bahasa Indonesia localization

### Phase 2: Interconnection (Weeks 5-6)

- Family connection requests with unverified status
- Privacy controls implementation (relationship-based model)
- Connection verification workflow
- Enhanced tree view with connections
- Timeline views (person and family)
- Enhanced notifications (real-time)

### Phase 3: Polish (Weeks 7-8)

- Advanced privacy settings
- Export functionality
- Mobile responsiveness
- Performance optimization

### Phase 4: Enhancements

- Timeline view
- Photo galleries
- Events/anniversaries
- Search and filters
- GEDCOM import/export

---

## 9. Success Metrics

- User sign-ups per month
- Families created
- Average family size
- Interconnection rate (families with at least one connection)
- Admin approval time
- User retention (30-day, 90-day)

---

## 9.1 MVP Cost Estimation (Free Tier)

**Monthly Cost for MVP: $0 - $1**| Service | Free Tier Limit | MVP Usage Estimate | Cost ||---------|----------------|-------------------|------|| **Railway** | $1/month free credits | Lightweight services | $0 (free plan) || **Neon Database** | 0.5 GB, 100 CU hours | ~100-200 users, moderate usage | $0 || **Cloudflare R2** | 10 GB, 1M writes, 10M reads | Profile photos, family images | $0 || **Resend** | 3,000 emails/month | User notifications, admin alerts | $0 || **BetterAuth** | Open source | Unlimited users | $0 || **Google OAuth** | Unlimited | Primary auth method | $0 || **Total** | | | **$0/month** |**Notes:**

- Railway free plan provides $1/month credits, sufficient for MVP
- All core services have free tiers that cover MVP needs
- Phone SMS auth can be added later (not free, but optional)
- Scale to paid plans only when exceeding free tier limits

**When to Upgrade:**

- Railway: When exceeding $1/month usage (upgrade to $5/month Hobby plan)
- Neon: When exceeding 0.5 GB storage or 100 CU hours (paid plans available)
- Cloudflare R2: When exceeding 10 GB storage (very unlikely for MVP)
- Resend: When exceeding 3,000 emails/month (unlikely for MVP)

---

## 10. Documentation Structure

All documentation will be stored in the `docs/` folder at the root of the monorepo:

- PRD (this document)
- Architecture diagrams
- API documentation
- Database schema documentation
- Deployment guides
- Development setup guides

## 11. Open Questions & Decisions Needed

1. **Phone Auth Cost:** Verify Indonesian SMS provider costs and BetterAuth compatibility
2. **Graph Database:** Start with PostgreSQL on Neon, evaluate Neo4j if scale requires
3. **File Storage:** Photo storage limits and optimization strategy
4. **GEDCOM Support:** Import/export priority for genealogy enthusiasts
5. **Mobile App:** Web-first or native app consideration
6. **Monetization:** Free tier limits, premium features (if applicable)

---

## 12. Risk Mitigation

- **Data Accuracy:** Admin validation + edit history