import { NextResponse } from 'next/server';

export const runtime = 'edge';

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id || !KV_URL || !KV_TOKEN) {
      return new NextResponse('Not found', { status: 404 });
    }

    const key = id.startsWith('img_') ? id : `img_${id}`;
    const res = await fetch(`${KV_URL}/get/${key}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
    });

    if (!res.ok) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const json = await res.json();
    if (!json || !json.result) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const payload = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
    const { mimeType = 'image/webp', data } = payload;

    const buffer = Buffer.from(data, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    return new NextResponse('Error loading image', { status: 500 });
  }
}
