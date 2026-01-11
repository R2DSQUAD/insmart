import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// 1. Define an interface for the metadata
interface UploadMeta {
  originalName: string;
  savedName: string;
  savedPath: string;
  upload_type: string;
  created_at: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Destructure with types
    const { filename, contentBase64, upload_type } = body as { 
      filename?: string; 
      contentBase64?: string; 
      upload_type?: string 
    };

    if (!filename || !contentBase64) {
      return NextResponse.json({ success: false, error: 'filename or contentBase64 missing' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'uploads');
    // Ensure directory exists
    await fs.mkdir(uploadsDir, { recursive: true });

    const safeName = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const savedPath = path.join(uploadsDir, safeName);
    const buffer = Buffer.from(contentBase64, 'base64');
    
    // Write the actual file
    await fs.writeFile(savedPath, buffer);

    // Create the metadata object
    const meta: UploadMeta = {
      originalName: filename,
      savedName: safeName,
      savedPath: `/uploads/${safeName}`, // Note: This path assumes you have a way to serve static files from /uploads
      upload_type: upload_type || 'all',
      created_at: new Date().toISOString()
    };

    // Save metadata
    await fs.writeFile(path.join(uploadsDir, `${safeName}.meta.json`), JSON.stringify(meta, null, 2));

    return NextResponse.json({ success: true, data: meta });
  } catch (error) {
    console.error('upload error', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'all';
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    // 2. Use the interface instead of any[]
    const list: UploadMeta[] = [];

    try {
      // Check if directory exists before reading
      await fs.access(uploadsDir);
      
      const files = await fs.readdir(uploadsDir);
      for (const f of files) {
        if (f.endsWith('.meta.json')) {
          try {
            const content = await fs.readFile(path.join(uploadsDir, f), 'utf-8');
            const meta: UploadMeta = JSON.parse(content);
            
            if (type === 'all' || meta.upload_type === type) {
              list.push(meta);
            }
          } catch (e) {
            // ignore corrupt meta files
            console.warn(`Failed to parse meta file: ${f}`, e);
          }
        }
      }
    } catch (e) {
      // If directory doesn't exist, just return empty list (not an error)
      return NextResponse.json({ success: true, data: [] });
    }

    // 3. Sort by Date (Newest first)
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error('upload list error', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}