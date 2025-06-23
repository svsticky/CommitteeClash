import EditPossibleTask from '@/components/manage-possible-tasks/edit-possible-task';

/**
 * CreateTask component that renders a form to create a new task.
 *
 * @returns {JSX.Element} A JSX element that contains the task creation interface.
 */
export default async function CreateTask() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Maak nieuwe opdracht</h1>
      <EditPossibleTask />
    </>
  );
}
