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
      components: {
        schemas: {
          Admin: {
            type: 'object',
            properties: {
              admin_id: { type: 'integer' },
              name: { type: 'string' },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' }
            },
            required: ['admin_id', 'name']
          }
        }
      },
    },
  });
  return NextResponse.json(spec);
}
