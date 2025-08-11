# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a UI Note Service application built with:
- **Next.js 15** with App Router
- **React 18** with TypeScript
- **Tailwind CSS v4** for styling
- **@tailwindcss/forms** plugin for enhanced form styling
- **ESLint** for code quality

## Development Guidelines
- Use TypeScript for all components and utilities
- Follow React best practices with functional components and hooks
- Utilize Tailwind CSS classes for styling
- Implement responsive design patterns
- Use the App Router structure (`src/app/` directory)
- Follow Next.js conventions for routing and API routes

## Form Design Guidelines
When creating new forms, follow these Tailwind CSS patterns:

### Form Container
- Use gradient backgrounds: `bg-gradient-to-br from-indigo-50 to-blue-50`
- Center forms with: `min-h-screen flex items-center justify-center`
- Use white cards: `bg-white p-8 rounded-xl shadow-lg`
- Set consistent max width: `max-w-md w-full`

### Form Inputs
- Individual field spacing: `space-y-4` for form sections
- Visible labels: `block text-sm font-medium text-gray-700 mb-2`
- Input styling: `px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`
- Error states: `border-red-300 focus:ring-red-500 focus:border-red-500`
- Smooth transitions: `transition-colors`

### Buttons
- Primary buttons: `bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg`
- Add shadows: `shadow-md hover:shadow-lg`
- Loading states: Include spinner with `disabled:opacity-50 disabled:cursor-not-allowed`

### Error Handling
- Error containers: `bg-red-50 border border-red-200 p-4 rounded-lg`
- Include error icons and proper spacing
- Use `text-red-600` for error text

### Components to Use
- Use `FormInput` component from `src/components/ui/form-input.tsx`
- Use `LoadingSpinner` component from `src/components/ui/loading-spinner.tsx`
- Use `PasswordStrength` component for password fields
- Import validation utilities from `src/lib/form-validation.ts`

## Code Style
- Use arrow functions for React components
- Implement proper TypeScript interfaces for props and data structures
- Use descriptive variable and function names
- Follow consistent file naming conventions (kebab-case for files, PascalCase for components)
- Add JSDoc comments for complex functions

## Architecture
- Keep components in `src/components/` directory
- Store utilities in `src/lib/` or `src/utils/`
- Use `src/types/` for TypeScript type definitions
- Implement custom hooks in `src/hooks/`
- Store constants in `src/constants/`

## Authentication Patterns
- User data is stored in JSON files in the `data/` directory
- Use localStorage for client-side session management (development)
- Implement proper form validation using `src/lib/form-validation.ts`
- Follow the established API route patterns in `src/app/api/auth/`

## UI Component Patterns
- Create reusable UI components in `src/components/ui/`
- Use consistent color scheme: indigo primary, gray neutrals
- Implement loading states for all async operations
- Add proper error handling and user feedback
- Use responsive design with mobile-first approach

## Form Validation
- Always validate on both client and server side
- Use proper TypeScript interfaces for form data
- Implement real-time validation feedback
- Show password strength indicators for password fields
- Clear errors when user starts typing

## API Documentation Guidelines
When implementing new API routes, follow these documentation patterns:

### Swagger/OpenAPI Documentation
- Add comprehensive Swagger JSDoc comments to all API routes
- Use `@swagger` comments above route handlers
- Include all HTTP methods, request/response schemas, and examples
- Document error responses with proper status codes
- Use TypeScript interfaces from `src/types/` for consistent schemas

### API Route Structure
- Follow RESTful conventions for endpoint naming
- Use proper HTTP status codes (200, 201, 400, 401, 404, 409, 500)
- Include detailed error messages and validation feedback
- Implement consistent response format using `AuthResponse` interface
- Add request/response examples in Swagger documentation

### Documentation Components
- API documentation is available at `/docs` page
- JSON specification endpoint at `/api/docs`
- Use `src/lib/swagger.ts` for OpenAPI configuration
- Follow established schema patterns in components section
- Include authentication requirements and security considerations

### API Implementation Patterns
- Validate input data on both client and server side
- Use TypeScript interfaces for request/response types
- Implement proper error handling with descriptive messages
- Follow established patterns from `src/app/api/auth/` routes
- Include JSDoc comments for all functions and complex logic
