import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 500 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (id) {
      const { data, error } = await supabase
        .from('presentations')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }
    const { data, error } = await supabase
      .from('presentations')
      .select('id, updated_at')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('List/get presentation failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch presentations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 500 });
    const body = await req.json();
    const { id, slides, currentSlideIndex } = body || {};
    if (!id || !Array.isArray(slides) || typeof currentSlideIndex !== 'number') {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('presentations')
      .upsert({ id, slides, current_slide_index: currentSlideIndex, updated_at: new Date().toISOString() })
      .select('id, updated_at')
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Save presentation failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to save presentation' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 500 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    const { error } = await supabase.from('presentations').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete presentation failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete presentation' }, { status: 500 });
  }
}


