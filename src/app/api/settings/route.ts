import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { settings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    // Validate key parameter
    if (!key || key.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Key parameter is required',
          code: 'KEY_REQUIRED'
        },
        { status: 400 }
      );
    }

    // Query setting by key
    const setting = await db.select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);

    if (setting.length === 0) {
      // Return default values for known settings
      if (key === 'reviews_section_enabled') {
        return NextResponse.json({
          key: 'reviews_section_enabled',
          value: 'true',
          description: 'Enable/disable reviews section on homepage',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { status: 200 });
      }
      if (key === 'tracking_section_enabled') {
        return NextResponse.json({
          key: 'tracking_section_enabled',
          value: 'true',
          description: 'Enable/disable order tracking section',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { status: 200 });
      }
      
      return NextResponse.json(
        { 
          error: 'Setting not found',
          code: 'SETTING_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(setting[0], { status: 200 });

  } catch (error) {
    console.error('GET settings error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    // Validate key parameter
    if (!key || key.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Key parameter is required',
          code: 'KEY_REQUIRED'
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { value, description } = body;

    // Validate value field
    if (value === undefined || value === null) {
      return NextResponse.json(
        { 
          error: 'Value field is required',
          code: 'VALUE_REQUIRED'
        },
        { status: 400 }
      );
    }

    if (typeof value !== 'string') {
      return NextResponse.json(
        { 
          error: 'Value must be a string',
          code: 'INVALID_VALUE_TYPE'
        },
        { status: 400 }
      );
    }

    // Check if setting exists
    const existingSetting = await db.select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);

    if (existingSetting.length === 0) {
      // Create new setting if it doesn't exist
      const newSetting = await db.insert(settings)
        .values({
          key,
          value,
          description: description || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .returning();
      
      return NextResponse.json(newSetting[0], { status: 201 });
    }

    // Prepare update data
    const updateData: {
      value: string;
      updatedAt: string;
      description?: string | null;
    } = {
      value,
      updatedAt: new Date().toISOString()
    };

    // Include description if provided
    if (description !== undefined) {
      updateData.description = description;
    }

    // Update the setting
    const updated = await db.update(settings)
      .set(updateData)
      .where(eq(settings.key, key))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PUT settings error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}