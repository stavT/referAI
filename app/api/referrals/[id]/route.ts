import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import JobSearch from '@/models/JobSearch';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const search = await JobSearch.findOne({
      _id: params.id,
      userId: session.user.id,
    });

    if (!search) {
      return NextResponse.json({ error: 'Search not found' }, { status: 404 });
    }

    return NextResponse.json({ search });
  } catch (error) {
    console.error('Search fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search' },
      { status: 500 }
    );
  }
}

