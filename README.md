# Note Website

A modern note-taking application built with Next.js, React, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI Library**: React 18 with TypeScript
- **Styling**: Tailwind CSS v4
- **Code Quality**: ESLint with Next.js configuration
- **Package Manager**: npm

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## API Documentation

The project includes comprehensive API documentation using OpenAPI/Swagger:

- **Interactive Documentation**: Visit [http://localhost:3001/docs](http://localhost:3001/docs) for the full API documentation
- **JSON Specification**: Access the raw OpenAPI spec at [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

### Current API Endpoints

#### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/signin` - Authenticate user

All endpoints include detailed request/response schemas, examples, and error codes.

## Features

- **User Authentication**: Complete signup and signin functionality
- **Data Storage**: JSON file-based user storage
- **Form Validation**: Client and server-side validation
- **Responsive Design**: Mobile-first Tailwind CSS design
- **API Documentation**: Comprehensive Swagger/OpenAPI documentation

## Deployment

The application is containerized and ready for production deployment with Docker and Traefik.

### Quick Deployment

```bash
# Build the application
./scripts/build.sh

# Deploy to production
./scripts/deploy.sh
```

### Production URL
- **Application**: https://note.ngon.info
- **API Documentation**: https://note.ngon.info/docs

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Development

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
