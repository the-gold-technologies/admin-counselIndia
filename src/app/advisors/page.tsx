import { redirect } from "next/navigation";

export default function AdvisorsPage() {
  redirect("/team?tab=advisor");
}
