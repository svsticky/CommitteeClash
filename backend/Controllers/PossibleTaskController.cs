using Commissiestrijd.Data;
using Commissiestrijd.Models;
using Commissiestrijd.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Commissiestrijd.Controllers;

/// <summary>
/// Controller for handling possible task operations.
/// This controller allows administrators to manage possible tasks,
/// including creating, editing, retrieving, and activating/deactivating tasks.
/// It checks if the user is an admin before allowing access to these operations.
/// The possible tasks are stored in the application's database and can be retrieved or modified as needed.
/// </summary>
[Authorize]
[ApiController]
[Route("[controller]")]
public class PossibleTaskController : Controller
{
    private readonly AppDbContext _context;

    private readonly ILogger<PossibleTaskController> _logger;

    /// <summary>
    /// Constructor for the PossibleTaskController.
    /// Initializes the controller with the provided database context and logger.
    /// This constructor is used to set up the necessary dependencies for the controller,
    /// allowing it to access possible task data and log information or errors during operations.
    /// </summary>
    /// <param name="context">
    /// The database context used to access the application's data.
    /// </param>
    /// <param name="logger">
    /// The logger used for logging information or errors during operations.
    /// </param>
    public PossibleTaskController(AppDbContext context, ILogger<PossibleTaskController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Retrieves a list of all possible tasks.
    /// This method allows users to get a list of all possible tasks stored in the database.
    /// </summary>
    /// <returns>
    /// An IActionResult containing a list of possible tasks or an Unauthorized result if the user is not an admin.
    /// </returns>
    /// <response code="200">
    /// Returns a list of possible tasks.
    /// </response>
    /// <response code="500">
    /// If an error occurs while retrieving the tasks, a 500 Internal Server Error result is
    /// returned.
    /// </response>
    [HttpGet("GetPossibleTasks")]
    public IActionResult GetPossibleTasks()
    {
        _logger.LogInformation("GetPossibleTasks called");
        
        List<PossibleTask> tasks = _context.PossibleTasks.ToList();

        _logger.LogInformation("Retrieved {Count} possible tasks", tasks.Count);

        return Ok(tasks);
    }

    /// <summary>
    /// Retrieves a list of active possible tasks.
    /// This method allows administrators to get a list of all active possible tasks stored in the database.
    /// It checks if the user is an admin before allowing access to the tasks.
    /// </summary>
    /// <returns>
    /// An IActionResult containing a list of active possible tasks or an Unauthorized result if the user is not an admin.
    /// </returns>
    /// <response code="200">
    /// Returns a list of active possible tasks.
    /// </response>
    /// <response code="400">
    /// If the the description or short description is empty or longer then 500 characters, 
    /// a BadRequest result is returned.
    /// If the point value is not between 1 and 100, a BadRequest result is returned.
    /// If the task ID is empty, a BadRequest result is returned.
    /// </response>
    /// <response code="401">
    /// If the user is not an admin, an Unauthorized result is returned.
    /// </response>
    /// <response code="404">
    /// If the task is not found, a NotFound result is returned.
    /// </response>
    /// <response code="500">
    /// If an error occurs while retrieving the tasks, a 500 Internal Server Error result is
    /// returned.
    /// </response>
    [HttpGet("GetActivePossibleTasks")]
    public IActionResult GetActivePossibleTasks()
    {
        _logger.LogInformation("GetActivePossibleTasks called");

        List<PossibleTask> tasks = _context.PossibleTasks.Where(pt => pt.IsActive).ToList();

        _logger.LogInformation("Retrieved {Count} active possible tasks", tasks.Count);

        return Ok(tasks);
    }

    /// <summary>
    /// Creates a new possible task.
    /// This method allows administrators to create a new possible task by providing a description,
    /// short description, points, and an optional maximum number of tasks per period.
    /// It checks if the user is an admin before allowing access to this operation.
    /// The method validates the input parameters to ensure they meet the required criteria,
    /// including non-empty descriptions, valid point values, and character limits.
    /// If the input is valid, a new PossibleTask object is created and added to the
    /// database.
    /// </summary>
    /// <param name="Description">
    /// The description of the task, which must not be empty and cannot exceed 500 characters.
    /// </param>
    /// <param name="ShortDescription">
    /// The short description of the task, which must not be empty and cannot exceed 50 characters.
    /// </param>
    /// <param name="Points">
    /// The point value of the task, which must be greater than zero and not exceed 100.
    /// </param>
    /// <param name="MaxPerPeriod">
    /// An optional parameter specifying the maximum number of tasks that can be completed per period.
    /// If not provided, it defaults to null.
    /// </param>
    /// <returns>
    /// An IActionResult containing the created task or a BadRequest result if the input is invalid.
    /// </returns>
    /// <response code="201">
    /// Returns the created task with a 201 Created status.
    /// </response>
    /// <response code="400">
    /// If the description or short description is empty or longer than the allowed character limits,
    /// a BadRequest result is returned.
    /// If the point value is not between 1 and 100, a BadRequest result is returned.
    /// </response>
    /// <response code="401">
    /// If the user is not an admin, an Unauthorized result is returned.
    /// </response>
    /// <response code="500">
    /// If an error occurs while creating the task, a 500 Internal Server Error result is
    /// returned.
    /// </response>
    [HttpPost("CreatePossibleTask")]
    public async Task<IActionResult> CreateCommitteeTask([FromQuery] string Description, [FromQuery] string ShortDescription, [FromQuery] int Points, [FromQuery] int? MaxPerPeriod = null)
    {
        _logger.LogInformation("CreatePossibleTask called with Description: {Description}, ShortDescription: {ShortDescription}, Points: {Points}, MaxPerPeriod: {MaxPerPeriod}", Description, ShortDescription, Points, MaxPerPeriod);

        // Check if the user is an admin
        bool isAdmin = await AdminUtils.IsAdmin(HttpContext);
        if (!isAdmin)
        {
            _logger.LogWarning("Unauthorized access attempt to CreatePossibleTask");
            return Unauthorized("You do not have permission to delete committees.");
        }

        // Trim the input strings to remove leading and trailing whitespace
        string trimmedDescription = Description?.Trim() ?? string.Empty;
        string trimmedShortDescription = ShortDescription?.Trim() ?? string.Empty;

        // Validate the input parameters
        if (string.IsNullOrEmpty(trimmedDescription))
        {
            _logger.LogWarning("Description is empty");
            return BadRequest("Description cannot be empty.");
        }

        if (string.IsNullOrEmpty(trimmedShortDescription))
        {
            _logger.LogWarning("Short description is empty");
            return BadRequest("Short description cannot be empty.");
        }

        if (trimmedDescription.Length > 500)
        {
            _logger.LogWarning("Description exceeds 500 characters");
            return BadRequest("Description cannot exceed 500 characters.");
        }

        if (trimmedShortDescription.Length > 50)
        {
            _logger.LogWarning("Short description exceeds 50 characters");
            return BadRequest("Short description cannot exceed 50 characters.");
        }

        if (Points <= 0)
        {
            _logger.LogWarning("Point value is not greater than zero");
            return BadRequest("Point value must be greater than zero.");
        }

        if (Points > 100)
        {
            _logger.LogWarning("Point value exceeds 100");
            return BadRequest("Point value cannot exceed 100.");
        }

        // Create a new PossibleTask object with the provided parameters and add it to the database
        PossibleTask task = new PossibleTask
        {
            Id = Guid.NewGuid(),
            Description = trimmedDescription,
            ShortDescription = trimmedShortDescription,
            Points = Points,
            IsActive = true,
            MaxPerPeriod = MaxPerPeriod
        };

        _context.PossibleTasks.Add(task);
        _context.SaveChanges();

        _logger.LogInformation("Possible task created with ID: {TaskId}", task.Id);

        return CreatedAtAction(nameof(CreateCommitteeTask), new { id = task.Id }, task);
    }

    /// <summary>
    /// Edits an existing possible task.
    /// This method allows administrators to modify the details of an existing possible task
    /// by providing the task ID, description, short description, points, active state,
    /// and an optional maximum number of tasks per period.
    /// It checks if the user is an admin before allowing access to this operation.
    /// The method validates the input parameters to ensure they meet the required criteria,
    /// including non-empty descriptions, valid point values, and character limits.
    /// If the input is valid, the existing PossibleTask object is updated with the new values
    /// and saved to the database.
    /// </summary>
    /// <param name="TaskId">
    /// The ID of the task to be edited, which must not be empty.
    /// </param>
    /// <param name="Description">
    /// The new description of the task, which must not be empty and cannot exceed 500 characters.
    /// </param>
    /// <param name="ShortDescription">
    /// The new short description of the task, which must not be empty and cannot exceed 50 characters.
    /// </param>
    /// <param name="Points">
    /// The new point value of the task, which must be greater than zero and not exceed 100.
    /// </param>
    /// <param name="IsActive">
    /// A boolean indicating whether the task is active or not.
    /// </param>
    /// <param name="MaxPerPeriod">
    /// An optional parameter specifying the maximum number of tasks that can be completed per period.
    /// If not provided, it defaults to null.
    /// </param>
    /// <returns>
    /// An IActionResult containing the updated task or a BadRequest result if the input is invalid
    /// or the task is not found.
    /// </returns>
    /// <response code="200">
    /// Returns the updated task with a 200 OK status.
    /// </response>
    /// <response code="400">
    /// If the task ID is empty, the description or short description is empty or longer than
    /// the allowed character limits,
    /// a BadRequest result is returned.
    /// If the point value is not between 1 and 100, a BadRequest result is returned.
    /// </response>
    /// <response code="401">
    /// If the user is not an admin, an Unauthorized result is returned.
    /// </response>
    /// <response code="404">
    /// If the task is not found, a NotFound result is returned.
    /// </response>
    /// <response code="500">
    /// If an error occurs while editing the task, a 500 Internal Server Error result is
    /// returned.
    /// </response>
    [HttpPut("EditPossibleTask")]
    public async Task<IActionResult> EditPossibleTask([FromQuery] Guid TaskId, [FromQuery] string Description, [FromQuery] string ShortDescription, [FromQuery] int Points, [FromQuery] bool IsActive, [FromQuery] int? MaxPerPeriod = null)
    {
        _logger.LogInformation("EditPossibleTask called with TaskId: {TaskId}, Description: {Description}, ShortDescription: {ShortDescription}, Points: {Points}, IsActive: {IsActive}, MaxPerPeriod: {MaxPerPeriod}", TaskId, Description, ShortDescription, Points, IsActive, MaxPerPeriod);

        // Check if the user is an admin
        bool isAdmin = await AdminUtils.IsAdmin(HttpContext);
        if (!isAdmin)
        {
            _logger.LogWarning("Unauthorized access attempt to EditPossibleTask");
            return Unauthorized("You do not have permission to delete committees.");
        }

        // Trim the input strings to remove leading and trailing whitespace
        string trimmedDescription = Description?.Trim() ?? string.Empty;
        string trimmedShortDescription = ShortDescription?.Trim() ?? string.Empty;

        // Validate the input parameters
        if (TaskId == Guid.Empty)
        {
            _logger.LogWarning("Task ID is empty");
            return BadRequest("Task ID cannot be empty.");
        }

        if (string.IsNullOrEmpty(trimmedDescription))
        {
            _logger.LogWarning("Description is empty");
            return BadRequest("Description cannot be empty.");
        }

        if (string.IsNullOrEmpty(trimmedShortDescription))
        {
            _logger.LogWarning("Short description is empty");
            return BadRequest("Short description cannot be empty.");
        }

        if (trimmedDescription.Length > 500)
        {
            _logger.LogWarning("Description exceeds 500 characters");
            return BadRequest("Description cannot exceed 500 characters.");
        }

        if (trimmedShortDescription.Length > 50)
        {
            _logger.LogWarning("Short description exceeds 50 characters");
            return BadRequest("Short description cannot exceed 50 characters.");
        }

        if (Points <= 0)
        {
            _logger.LogWarning("Point value is not greater than zero");
            return BadRequest("Point value must be greater than zero.");
        }

        if (Points > 100)
        {
            _logger.LogWarning("Point value exceeds 100");
            return BadRequest("Point value cannot exceed 100.");
        }

        // Find the existing task by ID and check if it exists
        PossibleTask? task = _context.PossibleTasks.Find(TaskId);
        if (task == null)
        {
            _logger.LogWarning("Possible task with ID {TaskId} not found", TaskId);
            return NotFound("Task not found.");
        }

        // Update the task properties with the new values and save changes to the database
        task.Description = trimmedDescription;
        task.ShortDescription = trimmedShortDescription;
        task.Points = Points;
        task.IsActive = IsActive;
        task.MaxPerPeriod = MaxPerPeriod;
        _context.SaveChanges();

        _logger.LogInformation("Possible task with ID {TaskId} updated successfully", TaskId);

        return Ok(task);
    }

    /// <summary>
    /// Retrieves a possible task by its ID.
    /// This method allows administrators to get the details of a specific possible task
    /// by providing the task ID.
    /// It checks if the user is an admin before allowing access to this operation.
    /// The method validates the task ID to ensure it is not empty,
    /// and if the task is found, it returns the task details.
    /// </summary>
    /// <param name="TaskId">
    /// The ID of the task to be retrieved, which must not be empty.
    /// </param>
    /// <returns>
    /// An IActionResult containing the possible task details or a BadRequest result if the task ID is empty,
    /// or a NotFound result if the task is not found.
    /// </returns>
    /// <response code="200">
    /// Returns the possible task with a 200 OK status.
    /// </response>
    /// <response code="400">
    /// If the task ID is empty, a BadRequest result is returned.
    /// </response>
    /// <response code="401">
    /// If the user is not an admin, an Unauthorized result is returned.
    /// </response>
    /// <response code="404">
    /// If the task is not found, a NotFound result is returned.
    /// </response>
    /// <response code="500">
    /// If an error occurs while retrieving the task, a 500 Internal Server Error result is
    /// returned.
    /// </response>
    [HttpGet("GetPossibleTask")]
    public IActionResult GetPossibleTask([FromQuery] Guid TaskId)
    {
        _logger.LogInformation("GetPossibleTask called with TaskId: {TaskId}", TaskId);

        // Check if the TaskId is not empty
        if (TaskId == Guid.Empty)
        {
            _logger.LogWarning("Task ID is empty");
            return BadRequest("Task ID cannot be empty.");
        }

        // Get the task by ID and check if it exists
        PossibleTask? task = _context.PossibleTasks.Find(TaskId);
        if (task == null)
        {
            _logger.LogWarning("Possible task with ID {TaskId} not found", TaskId);
            return NotFound("Task not found.");
        }

        _logger.LogInformation("Possible task with ID {TaskId} retrieved successfully", TaskId);

        return Ok(task);
    }

    /// <summary>
    /// Sets the active state of a possible task.
    /// This method allows administrators to activate or deactivate a possible task
    /// by providing the task ID and the desired state (true for active, false for inactive).
    /// It checks if the user is an admin before allowing access to this operation.
    /// The method validates the task ID to ensure it is not empty,
    /// and if the task is found, it updates the IsActive property of the task.
    /// </summary>
    /// <param name="TaskId">
    /// The ID of the task to be updated, which must not be empty.
    /// </param>
    /// <param name="State">
    /// A boolean indicating whether the task should be active (true) or inactive (false).
    /// </param>
    /// <returns>
    /// An IActionResult indicating the result of the operation.
    /// </returns>
    /// <response code="204">
    /// Returns a NoContent result if the task state is successfully updated.
    /// </response>
    /// <response code="400">
    /// If the task ID is empty, a BadRequest result is returned.
    /// </response>
    /// <response code="401">
    /// If the user is not an admin, an Unauthorized result is returned.
    /// </response>
    /// <response code="404">
    /// If the task is not found, a NotFound result is returned.
    /// </response>
    /// <response code="500">
    /// If an error occurs while updating the task state, a 500 Internal Server Error result
    /// is returned.
    /// </summary>
    [HttpPost("SetPossibleTaskState")]
    public async Task<IActionResult> SetPossibleTaskState([FromQuery] Guid TaskId, [FromQuery] bool State)
    {
        _logger.LogInformation("SetPossibleTaskState called with TaskId: {TaskId}, State: {State}", TaskId, State);

        // Check if the user is an admin
        bool isAdmin = await AdminUtils.IsAdmin(HttpContext);
        if (!isAdmin)
        {
            _logger.LogWarning("Unauthorized access attempt to SetPossibleTaskState");
            return Unauthorized("You do not have permission to delete committees.");
        }

        // Validate the TaskId
        if (TaskId == Guid.Empty)
        {
            _logger.LogWarning("Task ID is empty");
            return BadRequest("Task ID cannot be empty.");
        }

        // Get the task by ID and check if it exists
        PossibleTask? task = _context.PossibleTasks.Find(TaskId);
        if (task == null)
        {
            _logger.LogWarning("Possible task with ID {TaskId} not found", TaskId);
            return NotFound("Task not found.");
        }

        // Update the IsActive state of the task and save changes to the database
        task.IsActive = State;
        _context.SaveChanges();

        _logger.LogInformation("Possible task with ID {TaskId} state updated to {State}", TaskId, State);

        return NoContent();
    }
}
