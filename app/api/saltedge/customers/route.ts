import { NextRequest, NextResponse } from 'next/server';
import { customers } from '../lib/saltedge';

// GET /api/saltedge/customers - List all customers
export async function GET() {
  try {
    const result = await customers.list();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/saltedge/customers - Create new customer
export async function POST(request: NextRequest) {
  try {
    const { identifier } = await request.json();
    
    if (!identifier) {
      return NextResponse.json(
        { error: 'Identifier is required' },
        { status: 400 }
      );
    }

    const result = await customers.create(identifier);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}