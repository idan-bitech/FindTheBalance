import { PageLoading } from "@/components/app/page-loading";

export default function GroupLoading() {
  return (
    <PageLoading
      message="טוען קבוצה..."
      backHref="/dashboard"
      backLabel="חזרה למסך הראשי"
    />
  );
}
