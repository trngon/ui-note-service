import { NextResponse } from 'next/server';
import swaggerSpec from '@/lib/swagger';

/**
 * GET /api/docs
 * Returns the OpenAPI/Swagger specification for the API
 */
export async function GET() {
  return NextResponse.json(swaggerSpec);
}
