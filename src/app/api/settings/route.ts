import { NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export const runtime = 'edge';

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({ success: true, data: settings }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updated = await updateSettings(body);
    try {
      revalidatePath('/', 'page');
    } catch (e) {}
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
