import { createSwaggerSpec } from 'next-swagger-doc';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const spec = createSwaggerSpec({
    apiFolder: 'app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Insmart API',
        version: '1.0.0',
      },
    },
  });
  return NextResponse.json(spec);
}
