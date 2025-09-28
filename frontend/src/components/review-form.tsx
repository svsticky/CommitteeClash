'use client';

import { ApproveTask, RejectTask } from '@/actions/review';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PossibleTask } from '@/types/PossibleTask';
import { SubmittedTask } from '@/types/SubmittedTask';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Input } from './ui/input';

/**
 * ReviewSubmittedTaskForm component that allows admins to review and approve or reject submitted tasks.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {SubmittedTask} props.submittedTask - The submitted task object containing its details.
 * @param {PossibleTask} props.possibleTask - The possible task object related to the submitted task.
 * @returns {JSX.Element} A JSX element that represents the review form for a submitted task.
 */
export default function ReviewSubmittedTaskForm({
  submittedTask,
  possibleTask,
}: {
  submittedTask: SubmittedTask;
  possibleTask: PossibleTask;
}) {
  // State variables to manage the form and loading states
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [points, setPoints] = useState(submittedTask.points.toString());
  const [maxPerPeriod, setMaxPerPeriod] = useState(
    submittedTask.maxPerPeriod && submittedTask.maxPerPeriod !== null
      ? submittedTask.maxPerPeriod?.toString()
      : ''
  );
  const [maxPerPeriodActive, setMaxPerPeriodActive] = useState(
    submittedTask.maxPerPeriod !== null
  );

  // Use Next.js router to navigate after actions
  const router = useRouter();

  // Function to handle task approval
  const handleApprove = async (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent default form submission behavior
    e.preventDefault();

    // Set loading state to true while processing
    setIsApproving(true);

    try {
      // Approve the task using the provided action
      const res = await ApproveTask(
        submittedTask.id,
        parseInt(points),
        maxPerPeriodActive ? parseInt(maxPerPeriod) : null
      );

      // If the approval is successful, show a success message and redirect
      if (res.succeed) {
        toast.success('Opdracht succesvol goedgekeurd!');

        router.push('/Admin/ManageSubmittedTasks');
        return;
      }

      // If the approval fails, log the error and show an error message
      toast.error(
        `Er is iets misgegaan met het goedkeuren van de opdracht: ${res.error}`
      );

      console.error('Failed to approve task:', res.error);
    } catch (error) {
      toast.error(
        'Er is een fout opgetreden bij het goedkeuren van de opdracht. Probeer het later opnieuw.'
      );

      console.error('Error approving task:', error);
    }

    // Reset loading state after processing
    setIsApproving(false);
  };

  // Function to handle task rejection
  const handleReject = async (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent default form submission behavior
    e.preventDefault();

    // Set loading state to true while processing
    setIsRejecting(true);

    try {
      // Reject the task using the provided action
      const res = await RejectTask(submittedTask.id, reason);

      // If the rejection is successful, show a success message and redirect
      if (res.succeed) {
        toast.success('Opdracht succesvol afgekeurd!');

        router.push('/Admin/ManageSubmittedTasks');
        return;
      }

      // If the rejection fails, log the error and show an error message
      toast.error(
        `Er is iets misgegaan met het afkeuren van de opdracht: ${res.error}`
      );

      console.error('Failed to reject task:', res.error);
    } catch (error) {
      toast.error(
        'Er is een fout opgetreden bij het afkeuren van de opdracht. Probeer het later opnieuw.'
      );

      console.error('Error rejecting task:', error);
    }

    // Reset loading state after processing
    setIsRejecting(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row w-full gap-2">
        <div
          className="relative w-full sm:w-1/2 aspect-[4/3] z-20 bg-gray-100 bg-opacity-50 rounded overflow-hidden"
          style={{ minWidth: 0, minHeight: 0 }}
        >
          {/* Show a loading spinner while the image is loading */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-theme"></div>
            </div>
          )}

          {/* Display the submitted image using Next.js Image component */}
          <Image
            src={`${process.env.NEXT_PUBLIC_HOST_URL}/api/image-proxy?filename=${encodeURIComponent(submittedTask.imagePath)}`}
            alt="Ingediende afbeelding"
            fill
            className="object-contain"
            sizes="(min-width: 640px) 50vw, 100vw"
            onLoad={() => setLoading(false)}
            hidden={isLoading}
            priority
            unoptimized
          />
        </div>

        {/* Display the task details and submission information */}
        <div className="flex flex-col w-full sm:w-[50%] gap-2">
          <div>
            <h1 className="text-2xl font-bold">Opdracht:</h1>
            <p className="text-gray-700">{possibleTask.description}</p>
          </div>
          <div>
            <label className="text-lg font-semibold">Ingediend door:</label>
            <p className="text-gray-700">{submittedTask.committee}</p>
          </div>
          <div>
            <label className="text-lg font-semibold">Ingediend op:</label>
            <p className="text-gray-700">{submittedTask.submittedAt}</p>
          </div>
          <div>
            <label className="text-lg font-semibold">Status:</label>
            <p className="text-gray-700">{submittedTask.status}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row w-full gap-15 sm:gap-30 mt-10">
        {/* Form for rejecting the task */}
        <form
          onSubmit={handleReject}
          className="flex flex-col gap-2 w-full sm:w-1/2"
        >
          {/* Textarea for entering rejection reason */}
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Reden voor afkeuren:
          </label>
          <Textarea
            maxLength={500}
            placeholder="Reden voor afkeuring"
            className={`w-full h-[112px] resize-none ${isApproving || isRejecting ? 'pointer-events-none' : ''}`}
            onChange={(e) => setReason(e.target.value)}
          />

          {/*Button to submit the rejection form */}
          <Button
            className="w-full sm:w-full mt-auto"
            type="submit"
            disabled={
              isRejecting || isApproving || reason.trim() === '' || !reason
            }
          >
            {isRejecting ? 'Afkeuren...' : 'Afkeuren'}
          </Button>
        </form>

        {/* Form for approving the task */}
        <form className="w-full sm:w-1/2" onSubmit={handleApprove}>
          {/* Field for entering points */}
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Punten:
          </label>
          <Input
            type="number"
            step="1"
            min="1"
            max="100"
            placeholder="Punten"
            className={`w-full mb-4 ${isApproving || (isRejecting && 'pointer-events-none')}`}
            defaultValue={points}
            onChange={(e) => setPoints(e.target.value)}
          />

          {/* Checkbox and input for maximum submissions per period */}
          <div className="flex gap-2">
            <Input
              type="checkbox"
              className={`h-4 w-4 mt-[2px] ${isApproving || (isRejecting && 'pointer-events-none')}`}
              defaultChecked={maxPerPeriodActive}
              onChange={(e) => setMaxPerPeriodActive(e.target.checked)}
            />
            <div className="w-full">
              <label
                className={`block mb-1 text-sm font-medium ${maxPerPeriodActive ? 'text-gray-700' : 'text-gray-400'}`}
              >
                Maximaal aantal keer voor deze opdracht per periode:
              </label>
              <Input
                type="number"
                step="1"
                min="1"
                placeholder="Maximaal aantal keer voor deze opdracht per periode"
                className={`w-full mb-4 ${isApproving || (isRejecting && 'pointer-events-none')}`}
                defaultValue={maxPerPeriod}
                onChange={(e) => setMaxPerPeriod(e.target.value)}
                disabled={!maxPerPeriodActive}
              />
            </div>
          </div>

          {/* Button to submit the approval form */}
          <Button
            type="submit"
            className="w-full"
            disabled={
              isRejecting ||
              isApproving ||
              points.trim() === '' ||
              !points ||
              (maxPerPeriodActive &&
                (maxPerPeriod?.trim() === '' ||
                  !maxPerPeriod ||
                  parseInt(maxPerPeriod) < 1))
            }
          >
            {isApproving ? 'Goedkeuren...' : 'Goedkeuren'}
          </Button>
        </form>
      </div>
    </>
  );
}
