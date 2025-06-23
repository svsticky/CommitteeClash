using Microsoft.AspNetCore.Authorization;
using Commissiestrijd.Models;
using Microsoft.AspNetCore.Mvc;
using Commissiestrijd.Data;
using Commissiestrijd.Utils;

namespace Commissiestrijd.Controllers;

/// <summary>
/// Controller for handling submitted tasks.
/// This controller allows users to submit tasks, approve or reject submitted tasks,
/// and retrieve lists of submitted tasks based on their status.
/// It checks if the user is authorized before allowing access to the endpoints.
/// The submitted tasks are stored in the database and can be filtered by committee or status.
/// </summary>
[Authorize]
[ApiController]
[Route("[controller]")]
public class SubmittedTaskController : Controller
{
    private readonly AppDbContext _context;

    private readonly ILogger<SubmittedTaskController> _logger;

    private string[] imageExtensions = { ".jpg", ".jpeg", ".png", ".gif" };
    private const long maxFileSize = 5 * 1024 * 1024; // 5 MB

    /// <summary>
    /// Constructor for the SubmittedTaskController.
    /// Initializes the controller with the provided database context and logger.
    /// This constructor is used to set up the necessary dependencies for the controller,
    /// allowing it to access submitted task data and log information or errors during operations.
    /// </summary>
    /// <param name="context">
    /// The database context used to access the application's data.
    /// </param>
    /// <param name="logger">
    /// The logger used for logging information or errors during operations.
    /// </param>
    public SubmittedTaskController(AppDbContext context, ILogger<SubmittedTaskController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Submits a task for a committee.
    /// This method allows users to submit a task by providing the task ID, committee name, and an image file.
    /// It validates the request parameters, checks if the task and committee exist, and saves the
    /// submitted task to the database.
    /// </summary>
    /// <param name="SubmitTaskRequestDto">
    /// The request data transfer object containing the task ID, committee name, and image file.
    /// </param>
    /// <returns>
    /// An IActionResult containing the submitted task or an error response if validation fails.
    /// </returns>
    /// <response code="200">
    /// Returns the submitted task with its details if the submission is successful.
    /// </response>
    /// <response code="400">
    /// If the request parameters are invalid, such as empty task ID, committee name, or
    /// missing image file, a BadRequest response is returned with an appropriate error message.
    /// </response>
    /// <response code="404">
    /// If the specified committee or task does not exist, a NotFound response is returned with an appropriate error message.
    /// </response>
    /// <response code="500">
    /// If an error occurs while processing the request, a 500 Internal Server Error response is
    /// returned with an appropriate error message.
    /// </response>
    [HttpPost("SubmitTask")]
    public async Task<IActionResult> SubmitTask([FromForm] SubmitTaskRequestDto SubmitTaskRequestDto)
    {
        _logger.LogInformation("Received task submission request for TaskId: {TaskId}, Committee: {Committee}", 
            SubmitTaskRequestDto.TaskId, SubmitTaskRequestDto.Committee);

        // Validate the request parameters
        if (SubmitTaskRequestDto.TaskId == Guid.Empty)
        {
            _logger.LogWarning("Task ID is empty in the submission request.");
            return BadRequest("Task ID cannot be empty.");
        }

        if (string.IsNullOrEmpty(SubmitTaskRequestDto.Committee))
        {
            _logger.LogWarning("Committee is empty in the submission request.");
            return BadRequest("Committee cannot be empty.");
        }

        if (SubmitTaskRequestDto.Image == null || SubmitTaskRequestDto.Image.Length == 0)
        {
            _logger.LogWarning("Image file is missing in the submission request.");
            return BadRequest("Image file is required.");
        }

        Committee? committee = _context.Committees.Find(SubmitTaskRequestDto.Committee);
        if (committee == null)
        {
            _logger.LogWarning("Committee not found: {CommitteeName}", SubmitTaskRequestDto.Committee);
            return NotFound("Committee not found.");
        }

        // validate if it is a valid image file type
        string fileExtension = Path.GetExtension(SubmitTaskRequestDto.Image.FileName).ToLowerInvariant();
        if (!imageExtensions.Contains(fileExtension))
        {
            _logger.LogWarning("Invalid image file type: {FileExtension}. Allowed types are: {AllowedExtensions}", 
                fileExtension, string.Join(", ", imageExtensions));
            return BadRequest("Invalid image file type. Allowed types are: " + string.Join(", ", imageExtensions));
        }

        // validate size of image
        if (SubmitTaskRequestDto.Image.Length > maxFileSize)
        {
            _logger.LogWarning("Image file size exceeds the maximum limit of 5 MB. Size: {FileSize} bytes", 
                SubmitTaskRequestDto.Image.Length);
            return BadRequest("Image file size exceeds the maximum limit of 5 MB.");
        }

        // Check if the task exists
        PossibleTask? task = _context.PossibleTasks.Find(SubmitTaskRequestDto.TaskId);
        if (task == null)
        {
            _logger.LogWarning("Task not found for TaskId: {TaskId}", SubmitTaskRequestDto.TaskId);
            return NotFound("Task not found.");
        }

        // Check if the task is active
        if (!task.IsActive)
        {
            _logger.LogWarning("Task is not active for TaskId: {TaskId}", SubmitTaskRequestDto.TaskId);
            return BadRequest("Task is not active.");
        }

        // Find the pathname for the submitted image
        string uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(SubmitTaskRequestDto.Image.FileName);
        string filePath = Path.Combine("submittedimages", uniqueFileName);

        // Save the image to the server
        await using (FileStream stream = new FileStream(filePath, FileMode.Create))
        {
            await SubmitTaskRequestDto.Image.CopyToAsync(stream);
        }

        // Get the submission time in the Netherlands timezone and specify it as UTC so that the database can handle it correctly
        DateTime nowUtc = DateTime.UtcNow;
        DateTime nowNetherlands = DateTime.SpecifyKind(TimeZoneInfo.ConvertTimeFromUtc(nowUtc, TimeZoneInfo.FindSystemTimeZoneById("Europe/Amsterdam")), DateTimeKind.Utc);

        // Create a new SubmittedTask object and save it to the database
        SubmittedTask submittedTask = new SubmittedTask
        {
            Id = Guid.NewGuid(),
            PossibleTaskId = SubmitTaskRequestDto.TaskId,
            Committee = committee.Name,
            SubmittedAt = nowNetherlands,
            ImagePath = uniqueFileName,
            Points = task.Points,
            Status = SubmittedTask.TaskStatus.Pending,
            MaxPerPeriod = task.MaxPerPeriod
        };

        _context.SubmittedTasks.Add(submittedTask);
        _context.SaveChanges();

        _logger.LogInformation("Task submitted successfully with ID: {SubmittedTaskId}", submittedTask.Id);

        return Ok(submittedTask);
    }

    /// <summary>
    /// Approves a submitted task.
    /// This method allows an admin to approve a submitted task by providing the task ID, points
    /// to award, and an optional maximum points per period.
    /// It validates the request parameters, checks if the task exists,
    /// and updates the task status to approved with the specified points.
    /// </summary>
    /// <param name="TaskId">
    /// The ID of the task to approve.
    /// </param>
    /// <param name="Points">
    /// The number of points to award for the approved task.
    /// </param>
    /// <param name="MaxPerPeriod">
    /// The maximum points that can be awarded per period for this task.
    /// This parameter is optional.
    /// </param>
    /// <returns>
    /// An IActionResult containing the approved task or an error response if validation fails.
    /// </returns>
    /// <response code="200">
    /// Returns the approved task with its details if the approval is successful.
    /// </response>
    /// <response code="400">
    /// If the request parameters are invalid, such as empty task ID, invalid points value,
    /// or points exceeding the maximum limit, a BadRequest response is returned with an appropriate error message.
    /// </response>
    /// <response code="401">
    /// If the user is not an admin, an Unauthorized response is returned.
    /// </response>
    /// <response code="404">
    /// If the specified task does not exist, a NotFound response is returned with an appropriate error message.
    /// </response>
    /// <response code="500">
    /// If an error occurs while processing the request, a 500 Internal Server Error response is
    /// returned with an appropriate error message.
    /// </response>
    [HttpPut("ApproveTask")]
    public async Task<IActionResult> ApproveTask([FromQuery] Guid TaskId, [FromQuery] int Points, [FromQuery] int? MaxPerPeriod = null)
    {
        _logger.LogInformation("ApproveTask called with TaskId: {TaskId}, Points: {Points}, MaxPerPeriod: {MaxPerPeriod}", 
            TaskId, Points, MaxPerPeriod);

        // Check if the user is an admin
        bool isAdmin = await AdminUtils.IsAdmin(HttpContext);
        if (!isAdmin)
        {
            _logger.LogWarning("Unauthorized access attempt to ApproveTask for TaskId: {TaskId}", TaskId);
            return Unauthorized("You do not have permission to delete committees.");
        }

        // Validate the TaskId and Points
        if (TaskId == Guid.Empty)
        {
            _logger.LogWarning("Task ID is empty in the approval request.");
            return BadRequest("Task ID cannot be empty.");
        }

        SubmittedTask? submittedTask = _context.SubmittedTasks.FirstOrDefault(t => t.Id == TaskId);
        if (submittedTask == null)
        {
            _logger.LogWarning("Submitted task not found for TaskId: {TaskId}", TaskId);
            return NotFound("Submitted task not found.");
        }

        if (Points <= 0)
        {
            _logger.LogWarning("Invalid points value: {Points}. Points must be greater than zero.", Points);
            return BadRequest("Points must be greater than zero.");
        }

        if (Points > 100)
        {
            _logger.LogWarning("Points value exceeds maximum limit: {Points}. Points cannot exceed 100.", Points);
            return BadRequest("Points cannot exceed 100.");
        }

        // Update the submitted task with the approval details and save it
        submittedTask.Status = SubmittedTask.TaskStatus.Approved;
        submittedTask.RejectionReason = null;
        submittedTask.Points = Points;
        submittedTask.MaxPerPeriod = MaxPerPeriod;

        _context.SaveChanges();

        _logger.LogInformation("Task approved successfully with ID: {SubmittedTaskId}", submittedTask.Id);

        return Ok(submittedTask);
    }

    /// <summary>
    /// Rejects a submitted task.
    /// This method allows an admin to reject a submitted task by providing the task ID and a reason for rejection.
    /// It validates the request parameters, checks if the task exists,
    /// and updates the task status to rejected with the specified reason.
    /// </summary>
    /// <param name="TaskId">
    /// The ID of the task to reject.
    /// </param>
    /// <param name="Reason">
    /// The reason for rejecting the task.
    /// </param>
    /// <returns>
    /// An IActionResult containing the rejected task or an error response if validation fails.
    /// </returns>
    /// <response code="200">
    /// Returns the rejected task with its details if the rejection is successful.
    /// </response>
    /// <response code="400">
    /// If the request parameters are invalid, such as empty task ID or reason,
    /// a BadRequest response is returned with an appropriate error message.
    /// </response>
    /// <response code="401">
    /// If the user is not an admin, an Unauthorized response is returned.
    /// </response>
    /// <response code="404">
    /// If the specified task does not exist, a NotFound response is returned with an appropriate error message.
    /// </response>
    /// <response code="500">
    /// If an error occurs while processing the request, a 500 Internal Server Error response is
    /// returned with an appropriate error message.
    /// </response>
    [HttpPut("RejectTask")]
    public async Task<IActionResult> RejectTask([FromQuery] Guid TaskId, string Reason)
    {
        _logger.LogInformation("RejectTask called with TaskId: {TaskId}, Reason: {Reason}", TaskId, Reason);

        // Check if the user is an admin
        bool isAdmin = await AdminUtils.IsAdmin(HttpContext);
        if (!isAdmin)
        {
            _logger.LogWarning("Unauthorized access attempt to RejectTask for TaskId: {TaskId}", TaskId);
            return Unauthorized("You do not have permission to delete committees.");
        }

        // Validate the TaskId and Reason
        if (TaskId == Guid.Empty)
        {
            _logger.LogWarning("Task ID is empty in the rejection request.");
            return BadRequest("Task ID cannot be empty.");
        }

        SubmittedTask? submittedTask = _context.SubmittedTasks.FirstOrDefault(t => t.Id == TaskId);
        if (submittedTask == null)
        {
            _logger.LogWarning("Submitted task not found for TaskId: {TaskId}", TaskId);
            return NotFound("Submitted task not found.");
        }

        if( string.IsNullOrEmpty(Reason))
        {
            _logger.LogWarning("Rejection reason is empty for TaskId: {TaskId}", TaskId);
            return BadRequest("Rejection reason cannot be empty.");
        }

        // Update the submitted task with the rejection details and save it
        submittedTask.Status = SubmittedTask.TaskStatus.Rejected;
        submittedTask.RejectionReason = Reason;

        _context.SaveChanges();

        _logger.LogInformation("Task rejected successfully with ID: {SubmittedTaskId}", submittedTask.Id);

        return Ok(submittedTask);
    }

    /// <summary>
    /// Retrieves a list of all submitted tasks.
    /// This method allows users to retrieve a list of all submitted tasks,
    /// optionally filtered by committee.
    /// It returns the tasks ordered by submission date in descending order.
    /// </summary>
    /// <param name="committee">
    /// The name of the committee to filter the tasks by.
    /// This parameter is optional.
    /// </param>
    /// <returns>
    /// An IActionResult containing a list of submitted tasks or an empty list if no tasks are found.
    /// </returns>
    /// <response code="200">
    /// Returns a list of submitted tasks, ordered by submission date in descending order.
    /// </response>
    /// <response code="500">
    /// If an error occurs while processing the request, a 500 Internal Server Error response is
    /// returned with an appropriate error message.
    /// </response>
    [HttpGet("GetSubmittedTasks")]
    public IActionResult GetSubmittedTasks([FromQuery] string? committee = null)
    {
        _logger.LogInformation("GetSubmittedTasks called with Committee: {Committee}", committee);

        // Load the submitted tasks from the database
        IQueryable<SubmittedTask> query = _context.SubmittedTasks
            .OrderByDescending(t => t.SubmittedAt);

        // If a committee is specified, filter the tasks by committee
        if (!string.IsNullOrEmpty(committee))
        {
            query = query
                .Where(t => t.Committee == committee);
        }

        // Execute the query and convert the result to a list
        List<SubmittedTask> submittedTasks = query.ToList();

        _logger.LogInformation("Retrieved {Count} submitted tasks for Committee: {Committee}", submittedTasks.Count, committee);

        return Ok(submittedTasks);
    }

    /// <summary>
    /// Retrieves a specific submitted task by its ID.
    /// This method allows users to retrieve a submitted task
    /// by providing the task ID.
    /// It returns the task details if found,
    /// or a NotFound response if the task does not exist.
    /// </summary>
    /// <param name="TaskId">
    /// The ID of the submitted task to retrieve.
    /// </param>
    /// <returns>
    /// An IActionResult containing the submitted task details or a NotFound response if the task does not exist.
    /// </returns>
    /// <response code="200">
    /// Returns the submitted task with its details if found.
    /// </response>
    /// <response code="400">
    /// If the request parameters are invalid, such as an empty task ID,
    /// a BadRequest response is returned with an appropriate error message.
    /// </response>
    /// <response code="404">
    /// If the specified task does not exist, a NotFound response is returned with an appropriate error message.
    /// </response>
    /// <response code="500">
    /// If an error occurs while processing the request, a 500 Internal Server Error response is
    /// returned with an appropriate error message.
    /// </response>
    [HttpGet("GetSubmittedTask")]
    public IActionResult GetSubmittedTask([FromQuery] Guid TaskId)
    {
        _logger.LogInformation("GetSubmittedTask called with TaskId: {TaskId}", TaskId);

        // Validate the TaskId
        if (TaskId == Guid.Empty)
        {
            _logger.LogWarning("Task ID is empty in the request.");
            return BadRequest("Task ID cannot be empty.");
        }

        // Find the submitted task by TaskId
        SubmittedTask? submittedTask = _context.SubmittedTasks.Find(TaskId);
        if (submittedTask == null)
        {
            _logger.LogWarning("Submitted task not found for TaskId: {TaskId}", TaskId);
            return NotFound("Submitted task not found.");
        }

        _logger.LogInformation("Retrieved submitted task with ID: {SubmittedTaskId}", submittedTask.Id);

        return Ok(submittedTask);
    }

    /// <summary>
    /// Retrieves a list of pending tasks.
    /// This method allows users to retrieve a list of tasks that are currently pending approval,
    /// optionally filtered by committee.
    /// It returns the pending tasks ordered by submission date in descending order.
    /// </summary>
    /// <param name="committee">
    /// The name of the committee to filter the tasks by.
    /// This parameter is optional.
    /// </param>
    /// <returns>
    /// An IActionResult containing a list of pending tasks or an empty list if no tasks are
    /// found.
    /// </returns>
    /// <response code="200">
    /// Returns a list of pending tasks, ordered by submission date in descending order.
    /// </response>
    /// <response code="500">
    /// If an error occurs while processing the request, a 500 Internal Server Error response is
    /// returned with an appropriate error message.
    /// </response>
    [HttpGet("GetPendingTasks")]
    public IActionResult GetPendingTasks([FromQuery] string? committee = null)
    {
        _logger.LogInformation("GetPendingTasks called with Committee: {Committee}", committee);

        // Load the pending tasks from the database
        IQueryable<SubmittedTask> query = _context.SubmittedTasks
            .Where(t => t.Status == SubmittedTask.TaskStatus.Pending)
            .OrderByDescending(t => t.SubmittedAt);

        // If a committee is specified, filter the tasks by committee
        if (!string.IsNullOrEmpty(committee))
        {
            query = query.Where(t => t.Committee == committee);
        }

        // Execute the query and convert the result to a list
        List<SubmittedTask> pendingTasks = query.ToList();

        _logger.LogInformation("Retrieved {Count} pending tasks for Committee: {Committee}", pendingTasks.Count, committee);

        return Ok(pendingTasks);
    }

    /// <summary>
    /// Retrieves a list of approved tasks.
    /// This method allows users to retrieve a list of tasks that have been approved,
    /// optionally filtered by committee.
    /// It returns the approved tasks ordered by submission date in descending order.
    /// </summary>
    /// <param name="committee">
    /// The name of the committee to filter the tasks by.
    /// This parameter is optional.
    /// </param>
    /// <returns>
    /// An IActionResult containing a list of approved tasks or an empty list if no tasks are
    /// found.
    /// </returns>
    /// <response code="200">
    /// Returns a list of approved tasks, ordered by submission date in descending order.
    /// </response>
    /// <response code="500">
    /// If an error occurs while processing the request, a 500 Internal Server Error response is
    /// returned with an appropriate error message.
    /// </response>
    [HttpGet("GetApprovedTasks")]
    public IActionResult GetApprovedTasks([FromQuery] string? committee = null)
    {
        _logger.LogInformation("GetApprovedTasks called with Committee: {Committee}", committee);

        // Load the approved tasks from the database
        IQueryable<SubmittedTask> query = _context.SubmittedTasks
            .Where(t => t.Status == SubmittedTask.TaskStatus.Approved)
            .OrderByDescending(t => t.SubmittedAt);

        // If a committee is specified, filter the tasks by committee
        if (!string.IsNullOrEmpty(committee))
        {
            query = query.Where(t => t.Committee == committee);
        }

        // Execute the query and convert the result to a list
        List<SubmittedTask> approvedTasks = query.ToList();

        _logger.LogInformation("Retrieved {Count} approved tasks for Committee: {Committee}", approvedTasks.Count, committee);

        return Ok(approvedTasks);
    }

    /// <summary>
    /// Retrieves a list of rejected tasks.
    /// This method allows users to retrieve a list of tasks that have been rejected,
    /// optionally filtered by committee.
    /// It returns the rejected tasks ordered by submission date in descending order.
    /// </summary>
    /// <param name="committee">
    /// The name of the committee to filter the tasks by.
    /// This parameter is optional.
    /// </param>
    /// <returns>
    /// An IActionResult containing a list of rejected tasks or an empty list if no tasks are
    /// found.
    /// </returns>
    /// <response code="200">
    /// Returns a list of rejected tasks, ordered by submission date in descending order.
    /// </response>
    /// <response code="500">
    /// If an error occurs while processing the request, a 500 Internal Server Error response is
    /// returned with an appropriate error message.
    /// </response> 
    [HttpGet("GetRejectedTasks")]
    public IActionResult GetRejectedTasks([FromQuery] string? committee = null)
    {
        _logger.LogInformation("GetRejectedTasks called with Committee: {Committee}", committee);

        // Load the rejected tasks from the database
        IQueryable<SubmittedTask> query = _context.SubmittedTasks
            .Where(t => t.Status == SubmittedTask.TaskStatus.Rejected)
            .OrderByDescending(t => t.SubmittedAt);

        // If a committee is specified, filter the tasks by committee
        if (!string.IsNullOrEmpty(committee))
        {
            query = query.Where(t => t.Committee == committee);
        }

        // Execute the query and convert the result to a list
        List<SubmittedTask> rejectedTasks = query.ToList();

        _logger.LogInformation("Retrieved {Count} rejected tasks for Committee: {Committee}", rejectedTasks.Count, committee);

        return Ok(rejectedTasks);
    }
}
