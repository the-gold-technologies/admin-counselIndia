import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_ADMISSIONS } from '@/lib/initialData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const status = searchParams.get('status') || '';
    const course = searchParams.get('course') || '';

    let admissions: any[] = [];
    try {
      admissions = await prisma.admission.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (dbErr) {
      console.warn('Prisma query fallback to initial data:', dbErr);
    }

    if (!admissions || admissions.length === 0) {
      admissions = INITIAL_ADMISSIONS.map(a => ({
        ...a,
        courseExpectations: JSON.stringify(a.courseExpectations),
        educationHistory: JSON.stringify(a.educationHistory),
      }));
    }

    // Filter in-memory
    let filtered = admissions.filter(item => {
      const matchSearch =
        !search ||
        item.name.toLowerCase().includes(search) ||
        item.email.toLowerCase().includes(search) ||
        item.mobile.includes(search) ||
        item.courseName.toLowerCase().includes(search);

      const matchStatus = !status || status === 'All' || item.status.toLowerCase() === status.toLowerCase();
      const matchCourse = !course || course === 'All' || item.courseName === course;

      return matchSearch && matchStatus && matchCourse;
    });

    return NextResponse.json({ success: true, count: filtered.length, data: filtered });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = await prisma.admission.create({
      data: {
        name: body.name,
        email: body.email,
        mobile: body.mobile,
        courseName: body.courseName,
        courseSlug: body.courseSlug || body.courseName.toLowerCase().replace(/\s+/g, '-'),
        status: body.status || 'Enrolled',
        academicCounselor: body.academicCounselor || 'Anand Prakash',
        feeAmount: Number(body.feeAmount) || 24999,
        paymentStatus: body.paymentStatus || 'Paid',
        batchName: body.batchName || 'Batch Oct-2026',
        dob: body.dob || '',
        age: Number(body.age) || 25,
        gender: body.gender || 'Not specified',
        maritalStatus: body.maritalStatus || 'Single',
        nationality: body.nationality || 'Indian',
        aadharNumber: body.aadharNumber || '',
        panNumber: body.panNumber || '',
        category: body.category || 'General',
        fatherName: body.fatherName || '',
        fatherMobile: body.fatherMobile || '',
        permanentAddress: body.permanentAddress || '',
        correspondenceAddress: body.correspondenceAddress || '',
        city: body.city || '',
        state: body.state || '',
        pincode: body.pincode || '',
        courseExpectations: JSON.stringify(body.courseExpectations || ['Skill development']),
        educationHistory: JSON.stringify(body.educationHistory || []),
      },
    });
    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status, counselor } = await request.json();
    const updated = await prisma.admission.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(counselor && { academicCounselor: counselor }),
      },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });
    await prisma.admission.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
