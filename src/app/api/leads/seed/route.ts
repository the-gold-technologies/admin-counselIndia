import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { records } = body as { records: any[] };

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ success: false, error: 'No records provided' }, { status: 400 });
    }

    const data = records
      .filter((r) => r.category)
      .map((r) => ({
        category: r.category,
        liveId: r.liveId ? String(r.liveId) : undefined,
        name: r.name || undefined,
        email: r.email || undefined,
        mobile: r.mobile || undefined,
        countryCode: r.countryCode || undefined,
        state: r.state || undefined,
        city: r.city || undefined,
        medium: r.medium || undefined,
        source: r.source || undefined,
        content: r.content || undefined,
        message: r.message || undefined,
        hearFrom: r.hearFrom || undefined,
        courseType: r.courseType || undefined,
        courseName: r.courseName || undefined,
        addedOn: r.addedOn || undefined,
        extraData:
          r.extraData && Object.keys(r.extraData).length > 0
            ? r.extraData
            : undefined,
      }));

    const result = await prisma.inquiryLead.createMany({
      data,
      skipDuplicates: false,
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
