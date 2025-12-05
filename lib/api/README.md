# API Setup Documentation

## Environment Variables

Create a `.env.local` file in the root directory with the following:

```env
NEXT_PUBLIC_API_BASE_URL=http://brandlocus.foodflow.africa/api/v1
```

## Usage

### Using API Client Directly

```typescript
import { apiClient } from '@/lib/api';

// GET request
const response = await apiClient.get('/endpoint');

// POST request
const response = await apiClient.post('/endpoint', { data });
```

### Using React Query Hooks

```typescript
import { useLogin, useProfile } from '@/hooks/useAuth';

function MyComponent() {
  const loginMutation = useLogin();
  const { data: profile, isLoading } = useProfile();

  const handleLogin = async () => {
    await loginMutation.mutateAsync({ email, password });
  };

  return (
    <div>
      {isLoading ? 'Loading...' : profile?.data?.email}
    </div>
  );
}
```

## API Structure

- `lib/api/client.ts` - Axios instance with interceptors
- `lib/api/types.ts` - TypeScript types for API responses
- `lib/api/services/` - API service functions organized by domain
- `hooks/` - React Query hooks for data fetching

## Features

- ✅ Automatic token injection from localStorage
- ✅ Global error handling
- ✅ 401 redirect to login
- ✅ TypeScript support
- ✅ React Query integration

