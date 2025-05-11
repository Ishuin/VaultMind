# ThoughtWeb Navigator Quick Start Guide

This guide provides condensed instructions to quickly get started with implementing the ThoughtWeb Navigator project. Follow these steps to set up your development environment and begin implementation.

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Git
- Supabase account
- Stripe account

## Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/thoughtweb-navigator.git
cd thoughtweb-navigator
```

## Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

## Step 3: Set Up Environment Variables

1. Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

2. Update the environment variables in `.env.local` with your own values:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
# ... other variables
```

## Step 4: Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Set up the database schema:

```sql
-- Users table is automatically created by Supabase Auth

-- Create a table for user profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for sources
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  source_type TEXT NOT NULL,
  content TEXT,
  url TEXT,
  file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for queries
CREATE TABLE queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  query_text TEXT NOT NULL,
  model_used TEXT NOT NULL,
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for usage tracking
CREATE TABLE usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  action_type TEXT NOT NULL,
  resource_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

3. Set up Row Level Security (RLS) policies:

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create policies for sources
CREATE POLICY "Users can view their own sources"
  ON sources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sources"
  ON sources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sources"
  ON sources FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sources"
  ON sources FOR DELETE
  USING (auth.uid() = user_id);

-- Similar policies for queries and usage tables
```

## Step 5: Set Up Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Create products and pricing plans:
   - Free tier (price: $0)
   - Standard tier (price: $9.99/month)
   - Premium tier (price: $19.99/month)
   - Enterprise tier (custom pricing)
3. Get your API keys from the Stripe Dashboard
4. Update your `.env.local` file with the Stripe keys

## Step 6: Implement Authentication

1. Set up Supabase authentication in your application:

```tsx
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

2. Create authentication components:

```tsx
// src/pages/Auth.tsx
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      alert(error.message);
    } else {
      alert('Check your email for the confirmation link!');
    }
    
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      alert(error.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">ThoughtWeb Navigator</h1>
      <div className="w-full max-w-md">
        <div className="mb-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleSignIn} disabled={loading}>
            Sign In
          </Button>
          <Button onClick={handleSignUp} variant="outline" disabled={loading}>
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## Step 7: Implement Stripe Integration

Follow the detailed instructions in the [Stripe Implementation](./stripe_implementation.md) document to implement payment processing.

## Step 8: Start the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:8080](http://localhost:8080) to view the application.

## Step 9: Implement Core Features

1. Source Management:
   - Implement file upload functionality
   - Create website source input component
   - Develop source list view

2. Query Interface:
   - Create query input component
   - Implement model selection
   - Develop response display

3. Subscription Management:
   - Create subscription plan selection UI
   - Implement upgrade/downgrade functionality
   - Add usage tracking

## Step 10: Testing

1. Test authentication flow
2. Test payment processing
3. Test source management
4. Test query interface
5. Test subscription management

## Next Steps

Once you've completed the basic implementation, refer to the following documents for more detailed information:

- [Integration Plan](./integration_plan.md) for a comprehensive strategy
- [Payment Integration](./payment_integration.md) for detailed payment implementation
- [Deployment Guide](./deployment_guide.md) for production deployment instructions

## Troubleshooting

### Common Issues

1. **Authentication Issues**:
   - Ensure your Supabase URL and anon key are correct
   - Check if email confirmation is enabled in Supabase

2. **Stripe Integration Issues**:
   - Verify your Stripe API keys
   - Check webhook configuration
   - Use Stripe CLI for local testing

3. **Database Issues**:
   - Verify RLS policies are correctly set up
   - Check database schema for any errors

For more detailed troubleshooting, refer to the respective documentation for [Supabase](https://supabase.io/docs) and [Stripe](https://stripe.com/docs).
