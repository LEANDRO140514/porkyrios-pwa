import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { postalCodes } from '@/db/schema';
import { sql, eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    // Validation: code is required
    if (!code || typeof code !== 'string' || code.trim() === '') {
      return NextResponse.json(
        { 
          error: 'El código postal es requerido',
          code: 'MISSING_CODE' 
        },
        { status: 400 }
      );
    }

    // Sanitize input
    const trimmedCode = code.trim();

    // Search for postal code (case-insensitive)
    const result = await db
      .select()
      .from(postalCodes)
      .where(sql`UPPER(${postalCodes.code}) = UPPER(${trimmedCode})`)
      .limit(1);

    // Postal code not found
    if (result.length === 0) {
      return NextResponse.json(
        {
          valid: false,
          deliveryCost: 0,
          message: 'Código postal no disponible para entrega',
          postalCode: null
        },
        { status: 200 }
      );
    }

    const postalCode = result[0];

    // Postal code exists but is not active
    if (!postalCode.active) {
      return NextResponse.json(
        {
          valid: false,
          deliveryCost: 0,
          message: 'Código postal temporalmente no disponible',
          postalCode: null
        },
        { status: 200 }
      );
    }

    // Postal code is valid and active
    return NextResponse.json(
      {
        valid: true,
        deliveryCost: postalCode.deliveryCost,
        message: 'Código postal válido para entrega',
        postalCode: {
          id: postalCode.id,
          code: postalCode.code,
          municipality: postalCode.municipality,
          state: postalCode.state,
          deliveryCost: postalCode.deliveryCost
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}