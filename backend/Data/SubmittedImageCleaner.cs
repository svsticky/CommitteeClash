using Commissiestrijd.Models;
using Commissiestrijd.Utils;
using Microsoft.EntityFrameworkCore;
using Serilog.Core;

namespace Commissiestrijd.Data;

/// <summary>
/// Service for cleaning up old submitted images.
/// This service runs in the background and periodically checks for submitted tasks
/// that are older than a year and have an associated image.
/// It deletes the image files and clears the image path in the database.
/// The service is designed to run at midnight every day.
/// It uses a background service to perform the cleanup operation asynchronously.
/// </summary>
public class SubmittedImageCleaningService : BackgroundService
{
    /// <summary>
    /// The service provider used to create a scope for accessing the database context.
    /// This service provider is used to resolve dependencies and access the application's services,
    /// such as the database context for performing operations on submitted tasks.
    /// </summary>
    private readonly IServiceProvider _serviceProvider;

    /// <summary>
    /// The logger used for logging information and errors in the service.
    /// This logger is used to log various events and errors that occur during the execution of the service,
    /// helping with debugging and monitoring the application's behavior.
    /// </summary>
    private ILogger<SubmittedImageCleaningService> _logger;

    /// <summary>
    /// Initializes a new instance of the SubmittedImageCleaningService class.
    /// This constructor is used to set up the service with the provided service provider and logger.
    /// </summary>
    public SubmittedImageCleaningService(IServiceProvider serviceProvider, ILogger<SubmittedImageCleaningService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    /// <summary>
    /// Executes the background service.
    /// This method runs in a loop, waiting until midnight to perform the cleanup operation.
    /// It retrieves all submitted tasks that are older than a year and have an associated image,
    /// deletes the image files from the filesystem, and clears the image path in the database.
    /// The service handles exceptions during the cleanup process and logs any errors encountered.
    /// The cleanup operation is performed asynchronously to avoid blocking the main thread.
    /// </summary>
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("SubmittedImageCleaningService started.");

        // Run as long as the service is running and not cancelled.
        while (!stoppingToken.IsCancellationRequested)
        {
            // Wait until midnight to perform the cleanup operation.
            await WaitUtils.WaitUntilTime(new TimeSpan(0, 0, 0), stoppingToken);

            _logger.LogInformation("Starting cleanup of old submitted images...");
            try
            {
                // Create a scope to access the database context.
                using (IServiceScope scope = _serviceProvider.CreateScope())
                {
                    // Get the AppDbContext from the service provider.
                    AppDbContext dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                    // Define the threshold date for tasks older than one year.
                    DateTime treshold = DateTime.UtcNow.AddYears(-1);

                    // Retrieve all submitted tasks that are older than the threshold and have an associated image.
                    List<SubmittedTask> oldTasks = await dbContext.SubmittedTasks
                        .Where(t => t.SubmittedAt < treshold && t.ImagePath != "")
                        .ToListAsync(stoppingToken);

                    _logger.LogInformation($"Found {oldTasks.Count} old submitted tasks with images to clean up.");

                    // If there are old tasks, proceed to delete their images.
                    if (oldTasks.Any())
                    {
                        // Define the uploads folder path where images are stored.
                        string uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "submittedimages");

                        // Delete each old task's image file and clear the image path in the database.
                        foreach (SubmittedTask task in oldTasks)
                        {
                            _logger.LogInformation($"Deleting image for task {task.Id} with image path {task.ImagePath}");

                            // Begin a transaction to ensure that the path is only deleted from the database if the image is deleted successfully.
                            var transaction = dbContext.Database.BeginTransaction();
                            try
                            {
                                // Clear the image path in the database.
                                task.ImagePath = "";
                                dbContext.SubmittedTasks.Update(task);
                                await dbContext.SaveChangesAsync(stoppingToken);

                                _logger.LogInformation($"Cleared image path for task {task.Id} in the database.");

                                // Delete the image file from the filesystem.
                                string filePath = Path.Combine(uploadsFolder, task.ImagePath);
                                if (System.IO.File.Exists(filePath))
                                {
                                    System.IO.File.Delete(filePath);
                                }
                                
                                _logger.LogInformation($"Deleted image file for task {task.Id} at {filePath}");

                                // Commit the transaction after successfully deleting the image and updating the database.
                                await transaction.CommitAsync(stoppingToken);
                            }
                            catch (Exception ex)
                            {
                                await transaction.RollbackAsync(stoppingToken);
                                _logger.LogError($"Error deleting image for task {task.Id}: {ex.Message}");
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"An error occured during the cleanup of old submitted images: {ex.Message}");
            }

            // Wait until the next midnight to perform the cleanup operation again.
            _logger.LogInformation("Cleanup of old submitted images completed. Waiting until next midnight...");
            await WaitUtils.WaitUntilTime(new TimeSpan(0, 0, 0), stoppingToken);
        }
    }
}


