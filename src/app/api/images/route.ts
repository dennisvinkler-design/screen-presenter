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

    const urls = (data || [])
      .filter((f) => f && f.name)
      .map((f) => supabase.storage.from(bucket).getPublicUrl(f.name).data.publicUrl);

    return NextResponse.json({ success: true, data: urls });
  } catch (error) {
    console.error('List images failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to list images' }, { status: 500 });
  }
}


