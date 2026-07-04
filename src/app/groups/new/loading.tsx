import { PageLoading } from "@/components/app/page-loading";

export default function NewGroupLoading() {
  return (
    <PageLoading
      message="טוען..."
      backHref="/dashboard"
      backLabel="חזרה ללוח הבקרה"
    />
  );
}
