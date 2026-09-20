/** Squelettes de chargement : evite le saut de mise en page d'un simple texte. */
export function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div className="skeleton-list" aria-busy="true" aria-live="polite">
      <span className="visually-hidden">Chargement...</span>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="skeleton" />
      ))}
    </div>
  );
}
