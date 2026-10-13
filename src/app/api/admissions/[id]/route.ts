import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { INITIAL_ADMISSIONS } from "@/lib/initialData";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    let admission: any = null;
    try {
      admission = await prisma.admission.findUnique({
        where: { id },
      });
    } catch (dbErr) {
      console.warn("DB query failed, falling back to initial data:", dbErr);
    }

    if (!admission) {
      // Find by id or sNo in initial data
      admission = INITIAL_ADMISSIONS.find((a) => a.id === id || String(a.sNo) === id);
    }

    if (!admission) {
      return NextResponse.json({ success: false, error: "Learner not found" }, { status: 404 });
    }

    // Normalize JSON fields
    let courseExpectations = [];
    try {
      courseExpectations =
        typeof admission.courseExpectations === "string"
          ? JSON.parse(admission.courseExpectations)
          : admission.courseExpectations || [];
    } catch {
      courseExpectations = [admission.courseExpectations || "Upskilling & professional competence"];
    }

    let educationHistory = [];
    try {
      educationHistory =
        typeof admission.educationHistory === "string"
          ? JSON.parse(admission.educationHistory)
          : admission.educationHistory || [];
    } catch {
      educationHistory = [];
    }

    // If personalDetails or address are separate columns in Prisma vs nested in initialData
    const personalDetails = admission.personalDetails || {
      dob: admission.dob || "1989-02-08",
      age: admission.age || 37,
      gender: admission.gender || "Female",
      maritalStatus: admission.maritalStatus || "Single",
      nationality: admission.nationality || "Indian",
      aadharNumber: admission.aadharNumber || "XXXX-XXXX-4589",
      panNumber: admission.panNumber || "XXXXX8901F",
      category: admission.category || "General",
      fatherName: admission.fatherName || "Devdas Shetty",
      fatherMobile: admission.fatherMobile || "9845012345",
    };

    const address = admission.address || {
      permanent: admission.permanentAddress || "Flat 402, Green Meadows, 5th Main, Indiranagar",
      correspondence:
        admission.correspondenceAddress || "Flat 402, Green Meadows, 5th Main, Indiranagar",
      city: admission.city || "Bengaluru",
      state: admission.state || "Karnataka",
      pincode: admission.pincode || "560038",
    };

    const normalized = {
      ...admission,
      personalDetails,
      address,
      courseExpectations,
      educationHistory,
    };

    return NextResponse.json({ success: true, data: normalized });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
