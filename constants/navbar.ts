import { ROUTES } from './routes';

export const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  [ROUTES.dashboard]: {
    title: 'Welcome Back',
    subtitle: '👋',
  },
  [ROUTES.chatLog]: {
    title: 'AI Chat Log',
    subtitle: 'AI Conversation',
  },
  [ROUTES.users]: {
    title: 'Users',
    subtitle: 'User Management',
  },
  [ROUTES.analytics]: {
    title: 'Analytics',
    subtitle: 'Data Insights',
  },
  [ROUTES.forms]: {
    title: 'Forms',
    subtitle: 'Form Management',
  },
  [ROUTES.notifications]: {
    title: 'Notifications',
    subtitle: 'Alerts & Updates',
  },
};

export const DEFAULT_PAGE_TITLE = {
  title: 'Dashboard',
  subtitle: 'Overview',
};

