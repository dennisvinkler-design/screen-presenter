import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ success: false, error: 'Missing file' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const bucket = 'images';
    // Ensure bucket exists and is public (one-time setup expected in Supabase dashboard)
    const { error: upErr } = await supabase.storage.from(bucket).upload(filename, bytes, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    });
    if (upErr) throw upErr;

    const publicUrl = supabase.storage.from(bucket).getPublicUrl(filename).data.publicUrl;
    return NextResponse.json({ success: true, data: { url: publicUrl } });
  } catch (error) {
    console.error('Upload image failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload image' }, { status: 500 });
  }
}


