import React from "react";
import CourseSubModuleManager from "@/components/courses/CourseSubModuleManager";

export default async function CourseCurriculumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <CourseSubModuleManager
      courseId={id}
      moduleKey="curriculum"
      moduleTitle="Curriculum & Course Outline"
      moduleSubtitle="Manage syllabus modules, lecture topics, case study segments, and practical assessment schedules."
      dataField="curriculumData"
      countField="curriculumCount"
      defaultType="curriculum"
      typeOptions={["curriculum", "module", "practical", "case_study"]}
    />
  );
}
