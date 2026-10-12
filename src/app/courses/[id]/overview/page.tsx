import React from "react";
import CourseSubModuleManager from "@/components/courses/CourseSubModuleManager";

export default async function CourseOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <CourseSubModuleManager
      courseId={id}
      moduleKey="overview"
      moduleTitle="Course Overview & Key Features"
      moduleSubtitle="Manage high-impact highlights, program roadmap points, and feature cards displayed on the course details page."
      dataField="overviewData"
      countField="overviewCount"
      defaultType="key_features"
      typeOptions={["key_features", "highlights", "roadmap", "general"]}
    />
  );
}
