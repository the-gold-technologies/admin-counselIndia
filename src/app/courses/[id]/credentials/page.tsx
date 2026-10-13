import React from "react";
import CourseSubModuleManager from "@/components/courses/CourseSubModuleManager";

export default async function CourseCredentialsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <CourseSubModuleManager
      courseId={id}
      moduleKey="credentials"
      moduleTitle="Credentials & Certifications"
      moduleSubtitle="Manage certificates, Letters of Recommendation (LOR), and institutional accreditations awarded upon graduation."
      dataField="credentialData"
      countField="credentialCount"
      defaultType="credential"
      typeOptions={[
        "credential",
        "certificate",
        "recommendation_letter",
        "diploma",
      ]}
    />
  );
}
