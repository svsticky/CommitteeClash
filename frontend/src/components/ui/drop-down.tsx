import { cn } from '@/lib/utils';

export default function DropDown({
  title = '',
  options = [],
  setSelected = () => {},
  selected = '',
  required = false,
  className = '',
  disabled = false,
}: {
  title?: string;
  options?: string[];
  setSelected?: (value: string) => void;
  selected?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <label className={cn('w-full', className)}>
      <p className="text-s font-bold">{title}:</p>
      <select
        name={title}
        value={selected ?? ''}
        onChange={(e) => setSelected(e.target.value)}
        required={required}
        disabled={disabled}
        className={cn(
          'border border-gray-300 rounded-sm p-2 justify-self-end cursor-pointer w-full',
          disabled && 'cursor-default bg-gray-100'
        )}
      >
        <option value="" disabled>
          -- Kies een optie --
        </option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
