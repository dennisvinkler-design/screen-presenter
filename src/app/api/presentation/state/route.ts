import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Slide {
  images: [string, string, string];
}

interface PresentationData {
  slides: Slide[];
  currentSlideIndex: number;
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('presentations')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error) {
      if ((error as any).code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Presentation state not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: {
        slides: (data as any).slides,
        currentSlideIndex: (data as any).current_slide_index,
      },
    });
  } catch (error) {
    console.error('Failed to get presentation state:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve presentation state' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: PresentationData = await request.json();

    if (typeof body.currentSlideIndex !== 'number' || !Array.isArray(body.slides)) {
      return NextResponse.json(
        { success: false, error: 'Invalid state format' },
        { status: 400 }
      );
    }

    for (const slide of body.slides) {
      if (!Array.isArray(slide.images) || (slide.images as any).length !== 3) {
        return NextResponse.json(
          { success: false, error: 'Each slide must have exactly 3 images' },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from('presentations')
      .upsert({
        id: 'default',
        slides: body.slides as any,
        current_slide_index: body.currentSlideIndex,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: {
        slides: (data as any).slides,
        currentSlideIndex: (data as any).current_slide_index,
      },
    });
  } catch (error) {
    console.error('Failed to set presentation state:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update presentation state' },
      { status: 500 }
    );
  }
}


