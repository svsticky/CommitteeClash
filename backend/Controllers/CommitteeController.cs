using Commissiestrijd.Data;
using Commissiestrijd.Models;
using Commissiestrijd.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Storage;
using Swashbuckle.AspNetCore.Annotations;

/// <summary>
/// Controller for managing committees.
/// This controller provides endpoints to create, delete, and rename committees,
/// as well as to retrieve a list of all committees.
/// It requires the user to be authenticated and authorized as an admin to perform
/// create, delete, or rename operations on committees.
/// The controller interacts with the AppDbContext to perform database operations
/// related to committees.
/// </summary>
[Authorize]
[ApiController]
[Route("[controller]")]
public class CommitteeController : Controller
{
    /// <summary>
    /// The database context used to interact with the application's data.
    /// </summary>
    private readonly AppDbContext _context;

    /// <summary>
    /// The logger used for logging information and errors in the controller.
    /// This logger is used to log various events and errors that occur during the execution of the controller's actions,
    /// helping with debugging and monitoring the application's behavior.
    /// </summary>
    private ILogger<CommitteeController> _logger;

    /// <summary>
    /// Constructor for CommitteeController.
    /// Initializes the controller with the provided database context and logger.
    /// This constructor is used to set up the necessary dependencies for the controller,
    /// allowing it to access committee data and log information or errors during operations.
    /// </summary>
    /// <param name="context">
    /// The database context to be used for accessing committee data.
    /// </param>
    /// <param name="logger">
    /// The logger to be used for logging information and errors.
    /// </param>
    public CommitteeController(AppDbContext context, ILogger<CommitteeController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Retrieves a list of all committees.
    /// This endpoint returns a list of committees ordered by their names.
    /// It does not require any parameters and is accessible to all authenticated users.
    /// Returns a JSON response containing the list of committees.
    /// </summary>
    /// <returns>
    /// An IActionResult containing the list of committees in JSON format.
    /// </returns>
    /// <response code="200">
    /// Returns a list of committees ordered by name.
    /// </response>
    /// <response code="401">
    /// Unauthorized if the user is not authenticated.
    /// </response>
    /// <response code="500">
    /// Internal server error if there is an issue retrieving the committees.
    /// </response>
    [HttpGet("GetCommittees")]
    [SwaggerOperation(Summary = "Get Committees", Description = "This endpoint returns a list of committees ordered by their names. It does not require any parameters and is accessible to all authenticated users. Returns a JSON response containing the list of committees.")]
    public IActionResult GetCommittees()
    {
        _logger.LogInformation("Fetching list of committees.");

        List<Committee> tasks = _context.Committees.OrderBy(c => c.Name).ToList();

        _logger.LogInformation($"Retrieved {tasks.Count} committees.");

        return Ok(tasks);
    }

    /// <summary>
    /// Creates a new committee with the specified name.
    /// This endpoint allows an admin user to create a new committee.
    /// </summary>
    /// <param name="Name">
    /// The name of the committee to be created.
    /// This parameter is required and must not be empty.
    /// If the name is already taken, an error will be returned.
    /// </param>
    /// <returns>
    /// An IActionResult indicating the result of the operation.
    /// If successful, it returns the created committee.
    /// If the user is not an admin, it returns an Unauthorized response.
    /// If the name is empty or already exists, it returns a BadRequest response.
    /// </returns>
    /// <response code="201">
    /// Returns the created committee if successful.
    /// </response>
    /// <response code="400">
    /// BadRequest if the name is empty or already exists.
    /// </response>
    /// <response code="401">
    /// Unauthorized if the user is not an admin.
    /// </response>
    /// <response code="500">
    /// Internal server error if there is an issue creating the committee.
    /// </response>
    [HttpPost("CreateCommittee")]
    [SwaggerOperation(Summary = "Create Committee", Description = "This endpoint allows an admin user to create a new committee with a specified name.")]
    [SwaggerResponse(201, "Returns the created committee if successful.")]
    [ProducesResponseType(typeof(Committee), 201)]
    [SwaggerResponse(400, "BadRequest if the name is empty or already exists.")]
    [SwaggerResponse(401, "Unauthorized if the user is not an admin.")]
    [SwaggerResponse(500, "Internal server error if there is an issue creating the committee.")]
    
    public async Task<IActionResult> CreateCommittee([FromQuery] string Name)
    {
        _logger.LogInformation("Attempting to create a new committee.");

        // Check if the user is an admin
        bool isAdmin = await AdminUtils.IsAdmin(HttpContext);
        if (!isAdmin)
        {
            _logger.LogWarning("Unauthorized attempt to create a committee.");

            return Unauthorized("You do not have permission to create committees.");
        }

        // Trim the name to remove leading and trailing whitespace
        string trimmedName = Name?.Trim() ?? string.Empty;

        // Check if the name is empty
        if (string.IsNullOrEmpty(trimmedName))
        {
            _logger.LogWarning("Committee creation failed: Name cannot be empty.");
            return BadRequest("Description cannot be empty.");
        }

        // Check if a committee with the same name already exists
        if (_context.Committees.Any(c => c.Name == Name))
        {
            _logger.LogWarning($"Committee creation failed: Committee with name '{trimmedName}' already exists.");
            return BadRequest("Committee with this name already exists.");
        }

        // Create a new committee instance and add it to the context
        Committee committee = new Committee
        {
            Name = trimmedName
        };

        _context.Committees.Add(committee);
        _context.SaveChanges();

        _logger.LogInformation($"Committee '{trimmedName}' created successfully.");

        return CreatedAtAction(nameof(CreateCommittee), committee);
    }

    /// <summary>
    /// Deletes a committee with the specified name.
    /// This endpoint allows an admin user to delete a committee.
    /// </summary>
    /// <param name="name">
    /// The name of the committee to be deleted.
    /// This parameter is required and must not be empty.
    /// If the committee does not exist, an error will be returned.
    /// </param>
    /// <returns>
    /// An IActionResult indicating the result of the operation.
    /// If successful, it returns a success message.
    /// If the user is not an admin, it returns an Unauthorized response.
    /// If the committee does not exist, it returns a NotFound response.
    /// </returns>
    /// <response code="200">
    /// Returns a success message if the committee is deleted successfully.
    /// </response>
    /// <response code="401">
    /// Unauthorized if the user is not an admin.
    /// </response>
    /// <response code="404">
    /// BadRequest if the committee does not exist.
    /// </response>
    /// <response code="500">
    /// Internal server error if there is an issue deleting the committee.
    /// </response>
    [HttpDelete("DeleteCommittee")]
    [SwaggerOperation(Summary = "Delete Committee", Description = "This endpoint allows an admin user to delete a committee with a specified name.")]
    [SwaggerResponse(200, "Returns a success message if the committee is deleted successfully.")]
    [SwaggerResponse(401, "Unauthorized if the user is not an admin.")]
    [SwaggerResponse(404, "NotFound if the committee does not exist.")]
    [SwaggerResponse(500, "Internal server error if there is an issue deleting the committee.")]
    public async Task<IActionResult> DeleteCommittee([FromQuery] string name)
    {
        _logger.LogInformation("Attempting to delete a committee.");

        // Check if the user is an admin
        bool isAdmin = await AdminUtils.IsAdmin(HttpContext);
        if (!isAdmin)
        {
            _logger.LogWarning("Unauthorized attempt to delete a committee.");
            return Unauthorized("You do not have permission to delete committees.");
        }

        // Check if the committee exists
        Committee? committee = _context.Committees.FirstOrDefault(c => c.Name == name);
        if (committee == null)
        {
            _logger.LogWarning($"Committee deletion failed: Committee with name '{name}' not found.");
            return NotFound("Committee not found.");
        }

        // Remove the committee from the context and save changes
        _context.Committees.Remove(committee);
        _context.SaveChanges();

        _logger.LogInformation($"Committee '{name}' deleted successfully.");

        return Ok("Committee deleted successfully.");
    }

    /// <summary>
    /// Renames a committee from the specified name to a new name.
    /// This endpoint allows an admin user to rename a committee.
    /// </summary>
    /// <param name="name">
    /// The current name of the committee to be renamed.
    /// This parameter is required and must not be empty.
    /// If the committee does not exist, an error will be returned.
    /// </param>
    /// <param name="newName">
    /// The new name for the committee.
    /// This parameter is required and must not be empty.
    /// If the new name is already taken, an error will be returned.
    /// </param>
    /// <returns>
    /// An IActionResult indicating the result of the operation.
    /// If successful, it returns the new name of the committee.
    /// If the user is not an admin, it returns an Unauthorized response.
    /// If the committee does not exist, it returns a NotFound response.
    /// If the new name is already taken, it returns a BadRequest response.
    /// </returns>
    /// <response code="200">
    /// Returns the new name of the committee if renamed successfully.
    /// </response>
    /// <response code="400">
    /// BadRequest if the new name is empty or already exists.
    /// </response>
    /// <response code="401">
    /// Unauthorized if the user is not an admin.
    /// </response>
    /// <response code="404">
    /// NotFound if the committee does not exist.
    /// </response>
    /// <response code="500">
    /// Internal server error if there is an issue renaming the committee.
    /// </response>
    [HttpPut("RenameCommittee")]
    [SwaggerOperation(Summary = "Rename Committee", Description = "This endpoint allows an admin user to rename a committee.")]
    [SwaggerResponse(200, "Returns the new name of the committee if renamed successfully.")]
    [SwaggerResponse(400, "BadRequest if the new name is empty or already exists.")]
    [SwaggerResponse(401, "Unauthorized if the user is not an admin.")]
    [SwaggerResponse(404, "NotFound if the committee does not exist.")]
    [SwaggerResponse(500, "Internal server error if there is an issue renaming the committee.")]
    public async Task<IActionResult> RenameCommittee([FromQuery] string name, [FromQuery] string newName)
    {
        _logger.LogInformation("Attempting to rename a committee.");

        // Check if the user is an admin
        bool isAdmin = await AdminUtils.IsAdmin(HttpContext);
        if (!isAdmin)
        {
            _logger.LogWarning("Unauthorized attempt to rename a committee.");
            return Unauthorized("You do not have permission to delete committees.");
        }

        // Trim the names to remove leading and trailing whitespace
        string trimmedName = name?.Trim() ?? string.Empty;
        string trimmedNewName = newName?.Trim() ?? string.Empty;

        // Check if the new name is empty
        if (string.IsNullOrEmpty(trimmedNewName))
        {
            _logger.LogWarning("Committee renaming failed: New name cannot be empty.");
            return BadRequest("New name cannot be empty.");
        }

        // Check if the committee with the current name exists
        Committee? committee = _context.Committees.FirstOrDefault(c => c.Name == trimmedName);
        if (committee == null)
        {
            _logger.LogWarning($"Committee renaming failed: Committee with name '{trimmedName}' not found.");
            return NotFound("Committee not found.");
        }

        // Check if a committee with the new name already exists
        if (_context.Committees.Any(c => c.Name == newName))
        {
            _logger.LogWarning($"Committee renaming failed: Committee with new name '{trimmedNewName}' already exists.");
            return BadRequest("Committee with this new name already exists.");
        }

        // Use a transaction to ensure atomicity of the rename operation
        using (IDbContextTransaction transaction = _context.Database.BeginTransaction())
        {
            try
            {
                // Remove the old committee and add a new one with the new name
                _context.Committees.Remove(committee);
                _context.Committees.Add(new Committee { Name = trimmedNewName });

                // Update all submitted tasks associated with the old committee name
                List<SubmittedTask> tasks = _context.SubmittedTasks.Where(t => t.Committee == name).ToList();
                foreach (SubmittedTask task in tasks)
                {
                    task.Committee = trimmedNewName;
                    _context.SubmittedTasks.Update(task);
                }
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error renaming committee: {ex.Message}");
                transaction.Rollback();
                return BadRequest($"Error renaming committee: {ex.Message}");
            }
            transaction.Commit();
        }

        _logger.LogInformation($"Committee '{trimmedName}' renamed to '{trimmedNewName}' successfully.");

        return Ok(newName);
    }
}