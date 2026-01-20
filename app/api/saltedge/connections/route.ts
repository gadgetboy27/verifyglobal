import { NextRequest, NextResponse } from 'next/server';
import { saltedgeRequest } from '../lib/saltedge';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get('customer_id');
    
    if (!customerId) {
      return NextResponse.json({ error: 'customer_id is required' }, { status: 400 });
    }

    const result = await saltedgeRequest(`/connections?customer_id=${customerId}`);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}