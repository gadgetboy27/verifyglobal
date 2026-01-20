import { NextRequest, NextResponse } from 'next/server';
import { connect } from '../lib/saltedge';

// POST /api/saltedge/connect - Create connect session
export async function POST(request: NextRequest) {
  try {
    const { customer_id, return_to } = await request.json();
    
    if (!customer_id) {
      return NextResponse.json(
        { error: 'customer_id is required' },
        { status: 400 }
      );
    }

    const result = await connect.createSession(customer_id, return_to);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error creating connect session:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}