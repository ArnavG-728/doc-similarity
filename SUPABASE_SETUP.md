# Supabase Setup Guide

This guide will help you set up Supabase for your document similarity project.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `docsimilarity` (or your preferred name)
   - Database Password: Create a strong password
   - Region: Choose the closest region to your users
5. Click "Create new project"

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - Project URL
   - Anon (public) key
   - Service role key (keep this secret)

## 3. Set Up Environment Variables

1. Create a `.env.local` file in your project root
2. Add your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 4. Set Up Database Schema

1. In your Supabase dashboard, go to SQL Editor
2. Copy and paste the contents of `supabase-schema.sql` into the editor
3. Click "Run" to execute the schema

This will create:
- `profiles` table for user management
- `job_descriptions` table for storing job postings
- `consultant_profiles` table for storing consultant information
- `comparison_results` table for storing analysis results
- Row Level Security (RLS) policies for data protection
- Indexes for better performance

## 5. Install Dependencies

Run the following command to install Supabase client:

```bash
npm install
```

## 6. Test the Setup

1. Start your development server:
```bash
npm run dev
```

2. Navigate to your application and try to sign in
3. Check the browser console for any errors

## 7. Database Structure

### Profiles Table
- `id`: UUID (primary key)
- `email`: User email address
- `role`: User role ('AR Requestor' or 'Recruiter Admin')
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Job Descriptions Table
- `id`: UUID (primary key)
- `title`: Job title
- `description`: Job description
- `requirements`: Job requirements
- `created_by`: Reference to profiles table
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Consultant Profiles Table
- `id`: UUID (primary key)
- `name`: Consultant name
- `skills`: Array of skills
- `experience`: Experience description
- `education`: Education information
- `created_by`: Reference to profiles table
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Comparison Results Table
- `id`: UUID (primary key)
- `job_description_id`: Reference to job_descriptions table
- `consultant_profile_id`: Reference to consultant_profiles table
- `similarity_score`: Decimal score (0-1)
- `analysis_result`: JSON analysis result
- `created_by`: Reference to profiles table
- `created_at`: Timestamp

## 8. Security Features

The database includes:
- Row Level Security (RLS) enabled on all tables
- Users can only modify their own data
- Users can view all job descriptions and consultant profiles
- Proper foreign key constraints
- Automatic timestamp updates

## 9. Usage Examples

### Creating a Job Description
```typescript
import { DatabaseService } from '@/lib/database';

const jobDescription = await DatabaseService.createJobDescription({
  title: 'Senior Software Engineer',
  description: 'We are looking for a senior software engineer...',
  requirements: '5+ years of experience, React, TypeScript...',
  created_by: user.id
});
```

### Fetching Consultant Profiles
```typescript
const profiles = await DatabaseService.getConsultantProfiles();
```

### Creating a Comparison Result
```typescript
const result = await DatabaseService.createComparisonResult({
  job_description_id: jobId,
  consultant_profile_id: profileId,
  similarity_score: 0.85,
  analysis_result: JSON.stringify(analysis),
  created_by: user.id
});
```

## 10. Troubleshooting

### Common Issues

1. **Environment variables not loading**: Make sure your `.env.local` file is in the project root and you've restarted your development server.

2. **RLS policies blocking access**: Check that the user is properly authenticated and the policies are correctly configured.

3. **TypeScript errors**: Make sure you've installed the Supabase client and the types are properly imported.

4. **Database connection issues**: Verify your Supabase URL and keys are correct.

### Debugging

1. Check the browser console for error messages
2. Use the Supabase dashboard to inspect your database
3. Test queries in the Supabase SQL editor
4. Check the Network tab in browser dev tools for failed requests

## 11. Next Steps

1. Update your components to use the new authentication system
2. Implement proper error handling
3. Add loading states for database operations
4. Consider implementing real-time subscriptions for live updates
5. Add data validation and sanitization
6. Implement proper password authentication flow

## 12. Production Considerations

1. Set up proper environment variables in your hosting platform
2. Configure CORS settings in Supabase
3. Set up proper backup strategies
4. Monitor database performance
5. Implement proper logging and error tracking
6. Consider using Supabase Edge Functions for server-side operations 