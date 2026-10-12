import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseCsvText, mapCsvRecordToLead } from '@/lib/csvParser';

export const maxDuration = 120; // 2 minutes max duration for large CSV files

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as string)?.trim() || 'subscription';
    const mode = (formData.get('mode') as string)?.trim() || 'append'; // 'append' or 'replace'

    if (!file) {
      return NextResponse.json({ success: false, error: 'No CSV file provided' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json({ success: false, error: 'Please upload a valid .csv file' }, { status: 400 });
    }

    // Sanitize any raw null bytes or UTF-8 0x00 sequences
    const rawText = await file.text();
    const text = rawText ? rawText.replace(/\0/g, '').replace(/\\u0000/g, '').replace(/\u0000/g, '') : '';
    if (!text || text.trim() === '') {
      return NextResponse.json({ success: false, error: 'The uploaded file is empty' }, { status: 400 });
    }

    // Parse the CSV with smart legacy header auto-detection
    const parsed = parseCsvText(text);
    if (parsed.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'No data rows found in the CSV file' }, { status: 400 });
    }

    // If replace mode, clear existing leads for this category
    if (mode === 'replace') {
      await prisma.inquiryLead.deleteMany({
        where: { category },
      });
    }

    // Map records into Prisma InquiryLead shape
    const timestamp = Date.now();
    const leadsToInsert = parsed.rows.map((row, index) => {
      const mapped = mapCsvRecordToLead(row, category, index);
      const uniqueId = `lead_${category}_${mapped.liveId || index + 1}_${timestamp}_${Math.random().toString(36).slice(2, 8)}`;
      return {
        id: uniqueId,
        ...mapped,
      };
    });

    // Bulk insert in chunks of 1,000 for maximum PostgreSQL speed & safety
    const CHUNK_SIZE = 1000;
    let insertedCount = 0;

    for (let i = 0; i < leadsToInsert.length; i += CHUNK_SIZE) {
      const chunk = leadsToInsert.slice(i, i + CHUNK_SIZE);
      try {
        const result = await prisma.inquiryLead.createMany({
          data: chunk,
          skipDuplicates: true,
        });
        insertedCount += result.count;
      } catch (chunkErr: any) {
        console.warn(`Chunk ${Math.floor(i / CHUNK_SIZE) + 1} insert error, falling back to resilient row-by-row import:`, chunkErr?.message);
        for (const singleLead of chunk) {
          try {
            await prisma.inquiryLead.create({
              data: singleLead,
            });
            insertedCount++;
          } catch (rowErr: any) {
            console.error('Skipping problematic lead record:', singleLead.liveId, rowErr?.message);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${insertedCount.toLocaleString()} leads into "${category}"`,
      count: insertedCount,
      totalParsed: parsed.rows.length,
      category,
      mode,
      headers: parsed.headers,
    });
  } catch (error: any) {
    console.error('Failed to upload/import CSV leads:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process CSV file' },
      { status: 500 }
    );
  }
}
