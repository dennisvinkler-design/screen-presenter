import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Slide {
  images: [string, string, string];
}

interface PresentationData {
  slides: Slide[];
  currentSlideIndex: number;
}

// Get the current presentation state
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('presentations')
      .select('*')
      .eq('id', 'default') // Using a single default presentation for now
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - return 404
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
        slides: data.slides,
        currentSlideIndex: data.current_slide_index
      }
    });
  } catch (error) {
    console.error('Failed to get presentation state:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve presentation state' },
      { status: 500 }
    );
  }
}

// Set the presentation state
export async function POST(request: NextRequest) {
  try {
    const body: PresentationData = await request.json();

    // Basic validation
    if (typeof body.currentSlideIndex !== 'number' || !Array.isArray(body.slides)) {
      return NextResponse.json(
        { success: false, error: 'Invalid state format' },
        { status: 400 }
      );
    }

    // Validate slides structure
    for (const slide of body.slides) {
      if (!Array.isArray(slide.images) || slide.images.length !== 3) {
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
        slides: body.slides,
        current_slide_index: body.currentSlideIndex,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: {
        slides: data.slides,
        currentSlideIndex: data.current_slide_index
      }
    });
  } catch (error) {
    console.error('Failed to set presentation state:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update presentation state' },
      { status: 500 }
    );
  }
}
