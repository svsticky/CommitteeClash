import CreatePeriod from '@/components/manage-periods/create-period';
import ManagePeriodItem from '@/components/manage-periods/manage-period-item';
import { FetchWithValidation } from '@/lib/fetchWithValidation';
import { PeriodListSchema } from '@/types/Period';

/**
 * ManagePeriods component that fetches and displays a list of periods
 * and allows the user to create new periods.
 *
 * @returns {JSX.Element} A JSX element that contains the period management interface.
 */
export default async function ManagePeriods() {
  // Fetch the list of periods from the backend using the FetchWithValidation function
  const res = await FetchWithValidation(
    PeriodListSchema,
    'http://backend:8080/Period/GetPeriods'
  );

  // Check if the response was successful, if not throw an error
  if (!res.success) {
    throw new Error(`Failed to load periods: ${res.error}`);
  }

  // Extract the periods from the response data
  const periods = res.data;

  return (
    <>
      {/* Part to create period */}
      <h1 className="text-2xl font-bold mb-4">Nieuwe periode maken</h1>
      <CreatePeriod className="mb-4" />

      {/* List with existing periods */}
      <h1 className="text-2xl font-bold mb-4">Periodes beheren</h1>
      {periods.length > 0 ? (
        <div className="flex flex-col gap-0">
          {periods.map((period) => (
            <ManagePeriodItem
              period={period}
              key={period.id}
              className="mb-2"
            />
          ))}
        </div>
      ) : (
        // If no periods, show message
        <p className="text-gray-500">Er zijn geen periodes.</p>
      )}
    </>
  );
}
