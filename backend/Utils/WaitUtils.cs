namespace Commissiestrijd.Utils;

/// <summary>
/// Utility class for waiting until a specific time.
/// This class provides a method to wait until a specified time of day,
/// taking into account the current date and time.
/// The method normalizes the time to ensure it is within the same day,
/// and calculates the delay needed to reach that time.
/// </summary>
public static class WaitUtils
{
    /// <summary>
    /// Waits until the specified time of day.
    /// This method calculates the next occurrence of the specified time,
    /// normalizing it to ensure it is within the same day.
    /// If the current time is already past the specified time,
    /// it will wait until the next occurrence on the following day.
    /// </summary>
    /// <param name="runTime">
    /// The time of day to wait until.
    /// </param>
    /// <param name="stoppingToken">
    /// A cancellation token to cancel the waiting operation.
    /// </param>
    public static async Task WaitUntilTime(TimeSpan runTime, CancellationToken stoppingToken)
    {
        TimeSpan normalizedRunTime = runTime.Add(TimeSpan.FromDays(runTime.TotalDays % 1));
        DateTime now = DateTime.Now;
        DateTime nextRun = now.Date.Add(runTime);

        if (now > nextRun)
            nextRun = nextRun.AddDays(1);

        TimeSpan delay = nextRun - now;
        await Task.Delay(delay, stoppingToken);
    }
}
