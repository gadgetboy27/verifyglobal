import { NextRequest, NextResponse } from 'next/server';
import { accounts } from '../lib/saltedge';

// GET /api/saltedge/accounts - List accounts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get('customer_id') || undefined;
    const connectionId = searchParams.get('connection_id') || undefined;

    const result = await accounts.list(customerId, connectionId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}