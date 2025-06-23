import CommitteeItem from '@/components/manage-committee/committee-item';
import CreateCommittee from '@/components/manage-committee/create-committee';
import { FetchWithValidation } from '@/lib/fetchWithValidation';
import { CommitteeListSchema } from '@/types/Committee';

/**
 * ManageCommittees component that fetches and displays a list of committees
 * and allows the user to create new committees.
 *
 * @returns {JSX.Element} A JSX element that contains the committee management interface.
 */
export default async function ManageCommittees() {
  // Fetch the list of committees from the backend using the FetchWithValidation function
  const res = await FetchWithValidation(
    CommitteeListSchema,
    'http://backend:8080/Committee/GetCommittees'
  );

  // Check if the response was successful, if not throw an error
  if (!res.success) {
    throw new Error(`Failed to load committees: ${res.error}`);
  }

  // Extract the committees from the response data
  const committees = res.data;

  return (
    <>
      {/* Part to create committee */}
      <h1 className="text-2xl font-bold mb-4">Voeg commissie toe</h1>
      <CreateCommittee className="mb-4" />

      {/* List with existing committees */}
      <h1 className="text-2xl font-bold mb-4">Commissies</h1>
      <div className="flex flex-col gap-2">
        {committees.map((committee) => (
          <CommitteeItem committee={committee} key={committee.name} />
        ))}
      </div>

      {/* If no committees, show message */}
      {committees.length === 0 && (
        <p className="text-gray-500">Er zijn geen commissies.</p>
      )}
    </>
  );
}
