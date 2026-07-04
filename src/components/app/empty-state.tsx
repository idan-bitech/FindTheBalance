type EmptyStateProps = {
  title: string;
  description?: string;
  boxed?: boolean;
};

export function EmptyState({ title, description, boxed }: EmptyStateProps) {
  if (boxed) {
    return (
      <div className="rounded-2xl bg-neutral-50 px-5 py-10 text-center">
        <p className="mb-2 text-lg font-semibold text-neutral-900">{title}</p>
        {description ? <p className="text-neutral-600">{description}</p> : null}
      </div>
    );
  }

  return (
    <div className="text-neutral-600">
      <p>{title}</p>
      {description ? <p className="mt-1 text-sm text-neutral-500">{description}</p> : null}
    </div>
  );
}
