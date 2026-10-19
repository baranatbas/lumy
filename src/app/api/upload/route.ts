import { NextResponse } from 'next/server';

export const runtime = 'edge';

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'Dosya seçilmedi' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const mimeType = file.type || 'image/webp';
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');

    const imgId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    const key = `img_${imgId}`;

    // If KV credentials exist, store separately without bloating the main database
    if (KV_URL && KV_TOKEN) {
      const payload = JSON.stringify({ mimeType, data: base64Data });
      const res = await fetch(`${KV_URL}/set/${key}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${KV_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: payload
      });

      if (res.ok) {
        return NextResponse.json({ success: true, url: `/api/images/${imgId}` });
      }
    }

    // Fallback: return data URL if KV unavailable
    const dataUrl = `data:${mimeType};base64,${base64Data}`;
    return NextResponse.json({ success: true, url: dataUrl });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
