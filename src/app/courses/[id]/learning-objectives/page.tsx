import React from "react";
import CourseSubModuleManager from "@/components/courses/CourseSubModuleManager";

export default async function CourseLearningObjectivesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <CourseSubModuleManager
      courseId={id}
      moduleKey="learning-objectives"
      moduleTitle="Learning Objectives"
      moduleSubtitle="Define key psychological skills, clinical competencies, and career outcomes students achieve in this program."
      dataField="learnData"
      countField="learnCount"
      defaultType="objective"
      typeOptions={[
        "objective",
        "clinical_skill",
        "competency",
        "career_outcome",
      ]}
    />
  );
}
