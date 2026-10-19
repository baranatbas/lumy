import { NextResponse } from 'next/server';
import { getCategories, createCategory, deleteCategory } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export const runtime = 'edge';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ success: true, data: categories }, {
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
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ success: false, error: 'Kategori adı zorunludur' }, { status: 400 });
    }
    const newCat = await createCategory(body.name);

    try {
      revalidatePath('/', 'page');
    } catch (e) {}

    return NextResponse.json({ success: true, data: newCat }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Kategori ID gereklidir' }, { status: 400 });
    }
    const result = await deleteCategory(id);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    try {
      revalidatePath('/', 'page');
    } catch (e) {}

    return NextResponse.json({ success: true, message: 'Kategori başarıyla silindi' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
