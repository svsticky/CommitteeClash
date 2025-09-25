/**
 * Scorebar Component
 * This component renders a horizontal score bar that visually represents a score as a percentage.
 * The score is clamped between 0 and 100 to ensure it does not exceed the valid range.
 * The bar's width is animated to transition smoothly when the score changes.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {number} props.score - The score to be represented as a percentage (0-100).
 * @param {number} [props.height=20] - The height of the score bar, default is 20 pixels.
 * @param {string} [props.className=''] - Optional additional class names for styling the score bar.
 * @returns {JSX.Element} A JSX element that represents the score bar.
 */
export default function Scorebar({
  score,
  height = 20,
  className = '',
}: {
  score: number;
  height?: number;
  className?: string;
}) {
  const clampedPercentage = Math.max(0, Math.min(score, 100));
  return (
    <div
      className={className}
      style={{
        width: '100%',
        backgroundColor: '#eee',
        borderRadius: '10px',
        overflow: 'hidden',
        height: `${height}px`,
      }}
    >
      <div
        style={{
          width: `${clampedPercentage}%`,
          backgroundColor: 'var(--theme)',
          height: '100%',
          transition: 'width 0.3s ease-in-out',
        }}
      />
    </div>
  );
}
