import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET() {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 500 });
    }

    const bucket = 'images';
    const { data, error } = await supabase.storage.from(bucket).list('', { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } });
    if (error) throw error;

    const files = (data || [])
      .filter((f) => f && f.name)
      .map((f) => ({
        name: f.name,
        url: supabase.storage.from(bucket).getPublicUrl(f.name).data.publicUrl,
      }));

    return NextResponse.json({ success: true, data: files });
  } catch (error) {
    console.error('List images failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to list images' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 500 });
    }
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    if (!name) {
      return NextResponse.json({ success: false, error: 'Missing name' }, { status: 400 });
    }
    const bucket = 'images';
    const { error } = await supabase.storage.from(bucket).remove([name]);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete image failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete image' }, { status: 500 });
  }
}


