import { createRootRoute, createRoute } from '@tanstack/react-router'
import { RootLayout } from './routes/__root'
import { HomePage } from './routes/index'
import { FamilyDetailPage } from './routes/families.$familyId'
import { SettingsPage } from './routes/settings'
import { MemberDetailPage } from './routes/families.$familyId.members.$memberId'

// Create the root route
const rootRoute = createRootRoute({
  component: RootLayout,
})

// Create the index route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

// Create the family detail route
const familyDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/families/$familyId',
  component: FamilyDetailPage,
})

// Create the member profile route
const memberProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/families/$familyId/members/$memberId',
  component: MemberDetailPage,
})

// Create the settings route
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
})

// Create the route tree
export const routeTree = rootRoute.addChildren([
  indexRoute,
  familyDetailRoute,
  memberProfileRoute,
  settingsRoute,
])
