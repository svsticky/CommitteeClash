using Commissiestrijd.Data;
using Commissiestrijd.Models;
using Commissiestrijd.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Commissiestrijd.Controllers;

/// <summary>
/// Controller for handling period operations.
/// This controller allows users to create, retrieve, update, and delete periods.
/// It checks if the user is authorized before retrieving periods, and it checks if the user is an admin before
/// creating, updating, or deleting periods.
/// The periods are defined by a name, start date, and end date.
/// </summary>
[Authorize]
[ApiController]
[Route("[controller]")]
public class PeriodController : Controller
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
    private readonly ILogger<PeriodController> _logger;

    /// <summary>
    /// Constructor for the PeriodController.
    /// Initializes the controller with the provided database context and logger.
    /// This constructor is used to set up the necessary dependencies for the controller,
    /// allowing it to access period data and log information or errors during operations.
    /// </summary>
    /// <param name="context">
    /// The database context used to access the application's data.
    /// </param>
    /// <param name="logger">
    /// The logger used for logging information or errors during operations.
    /// </param>
    public PeriodController(AppDbContext context, ILogger<PeriodController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Retrieves all periods from the database and sorts them into future, current, and past periods
    /// based on the current date in the Netherlands timezone.
    /// The future periods are sorted by start date and then by the duration of the period.
    /// The current periods are sorted by the duration of the period in descending order.
    /// The past periods are sorted by end date and then by the duration of the period in
    /// descending order.
    /// </summary>
    /// <returns>
    /// An IActionResult containing a list of sorted periods.
    /// </returns>
    /// <response code="200">
    /// Returns a list of sorted periods.
    /// </response>
    /// <response code="500">
    /// If an error occurs while retrieving the periods, a 500 Internal Server Error response is returned.
    /// </response>
    [HttpGet("GetPeriods")]
    [SwaggerOperation(Summary = "Get Periods", Description = "This endpoint retrieves all periods from the database and sorts them into future, current, and past periods based on the current date in the Netherlands timezone.")]
    [SwaggerResponse(200, "Returns a list of sorted periods.")]
    [ProducesResponseType(typeof(List<Period>), 200)]
    [SwaggerResponse(500, "If an error occurs while retrieving the periods, a 500 Internal Server Error response is returned.")]
    public IActionResult GetPeriods()
    {
        _logger.LogInformation("Retrieving periods");

        // Get the current date in the Netherlands timezone
        TimeZoneInfo dutchTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Amsterdam");
        DateTime nowInNL = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, dutchTimeZone);
        DateTime today = nowInNL.Date;

        // Retrieve all periods from the database
        List<Period> tasks = _context.Periods.ToList();

        // Retrieve periods and sort them into future, current, and past
        IOrderedEnumerable<Period> future = tasks
            .Where(p => p.StartDate > today)
            .OrderBy(p => p.StartDate)
            .ThenByDescending(p => (p.EndDate - p.StartDate).TotalDays);

        IOrderedEnumerable<Period> current = tasks
            .Where(p => p.StartDate <= today && p.EndDate >= today)
            .OrderByDescending(p => (p.EndDate - p.StartDate).TotalDays);

        IOrderedEnumerable<Period> past = tasks
            .Where(p => p.EndDate < today)
            .OrderByDescending(p => p.EndDate)
            .ThenByDescending(p => (p.EndDate - p.StartDate).TotalDays);

        // Combine the sorted periods into a single list
        List<Period> sorted = future
            .Concat(current)
            .Concat(past)
            .ToList();

        _logger.LogInformation($"Retrieved {sorted.Count} periods");

        return Ok(sorted);
    }

    /// <summary>
    /// Creates a new period with the specified name, start date, and end date.
    /// This method checks if the user is an admin before allowing the creation of a period.
    /// It validates that the name is not empty, that the start date is not after the end date,
    /// and that a period with the same name does not already exist.
    /// </summary>
    /// <param name="Name">
    /// The name of the period to be created.
    /// </param>
    /// <param name="StartDate">
    /// The start date of the period to be created.
    /// </param>
    /// <param name="EndDate">
    /// The end date of the period to be created.
    /// </param>
    /// <returns>
    /// An IActionResult containing the created period or an error message if the creation fails.
    /// </returns>
    /// <response code="201">
    /// Returns the created period.
    /// </response>
    /// <response code="400">
    /// If the name is empty, the start date is after the end date, or a
    /// period with the same name already exists, a BadRequest response is returned with an error message.
    /// </response>
    /// <response code="401">
    /// If the user is not an admin, an Unauthorized response is returned.
    /// </response>
    /// <response code="500">
    /// If an error occurs while creating the period, a 500 Internal Server Error response is returned.
    /// </response>
    [HttpPost("CreatePeriod")]
    [SwaggerOperation(Summary = "Create Period", Description = "This endpoint allows an admin user to create a new period with a specified name, start date, and end date.")]
    [SwaggerResponse(201, "Returns the created period.")]
    [SwaggerResponse(400, "If the name is empty, the start date is after the end date, or a period with the same name already exists, a BadRequest response is returned with an error message.")]
    [SwaggerResponse(401, "If the user is not an admin, an Unauthorized response is returned.")]
    [SwaggerResponse(500, "If an error occurs while creating the period, a 500 Internal Server Error response is returned.")]
    public async Task<IActionResult> CreatePeriod([FromQuery] string Name, DateTime StartDate, DateTime EndDate)
    {
        _logger.LogInformation("CreatePeriod called with Name: {Name}, StartDate: {StartDate}, EndDate: {EndDate}", Name, StartDate, EndDate);

        // Check if the user is an admin
        bool isAdmin = await AdminUtils.IsAdmin(HttpContext);
        if (!isAdmin)
        {
            _logger.LogWarning("Unauthorized attempt to create period");
            return Unauthorized("You do not have permission to delete committees.");
        }

        // Trim the name
        string trimmedName = Name?.Trim() ?? string.Empty;

        // Validate that the name is not empty
        if (string.IsNullOrEmpty(trimmedName))
        {
            _logger.LogWarning("Attempt to create period with empty name");
            return BadRequest("Name cannot be empty.");
        }

        // Set the dates to UTC such that the database accepts them correctly
        DateTime UtcStartDate = DateTime.SpecifyKind(StartDate, DateTimeKind.Utc).Date;
        DateTime UtcEndDate = DateTime.SpecifyKind(EndDate, DateTimeKind.Utc).Date;

        // Validate that the start date is not after the end date
        if (UtcStartDate > UtcEndDate)
        {
            _logger.LogWarning("Start date {StartDate} is after end date {EndDate}.", UtcStartDate, UtcEndDate);
            return BadRequest("Start date must be earlier than end date.");
        }

        // Check if a period with the same name already exists
        if (_context.Periods.Any(p => p.Name == Name))
        {
            _logger.LogWarning("Attempt to create period with duplicate name: {Name}", trimmedName);
            return BadRequest("Period with this name already exists.");
        }

        // Create a new period and add it to the database
        Period period = new Period
        {
            Id = Guid.NewGuid(),
            Name = trimmedName,
            StartDate = UtcStartDate,
            EndDate = UtcEndDate
        };

        _context.Periods.Add(period);
        _context.SaveChanges();

        _logger.LogInformation("Period created successfully with ID: {PeriodId}", period.Id);

        return CreatedAtAction(nameof(CreatePeriod), period);
    }

    /// <summary>
    /// Retrieves a specific period by its ID.
    /// This method checks if the user is authorized before allowing access to the period.
    /// It validates that the period exists and returns it if found.
    /// If the period does not exist, it returns a NotFound response.
    /// </summary>
    /// <param name="PeriodId">
    /// The ID of the period to be retrieved.
    /// </param>
    /// <returns>
    /// An IActionResult containing the period if found, or a NotFound response if the period does not exist.
    /// If an error occurs while retrieving the period, a 500 Internal Server Error response is returned.
    /// </returns>
    /// <response code="200">
    /// Returns the period if found.
    /// </response>
    /// <response code="404">
    /// If the period does not exist, a NotFound response is returned with an error message.
    /// </response>
    /// <response code="500">
    /// If an error occurs while retrieving the period, a 500 Internal Server Error response is returned.
    /// </response>
    [HttpGet("GetPeriod")]
    [SwaggerOperation(Summary = "Get Period", Description = "This endpoint retrieves a specific period by its ID.")]
    [SwaggerResponse(200, "Returns the period if found.")]
    [ProducesResponseType(typeof(Period), 200)]
    [SwaggerResponse(404, "If the period does not exist, a NotFound response is returned with an error message.")]
    [SwaggerResponse(500, "If an error occurs while retrieving the period, a 500 Internal Server Error response is returned.")]
    public IActionResult GetPeriod([FromQuery] Guid PeriodId)
    {
        _logger.LogInformation("GetPeriod called with PeriodId: {PeriodId}", PeriodId);

        // Validate that the period exists and return it
        Period? period = _context.Periods.FirstOrDefault(p => p.Id == PeriodId);
        if (period == null)
        {
            _logger.LogWarning("Period not found with ID: {PeriodId}", PeriodId);
            return NotFound("Period not found.");
        }

        _logger.LogInformation("Period retrieved successfully with ID: {PeriodId}", PeriodId);

        return Ok(period);
    }

    /// <summary>
    /// Deletes a specific period by its ID.
    /// This method checks if the user is an admin before allowing the deletion of a period.
    /// It validates that the period exists and removes it from the database if found.
    /// If the period does not exist, it returns a NotFound response.
    /// </summary>
    /// <param name="PeriodId">
    /// The ID of the period to be deleted.
    /// </param>
    /// <returns>
    /// An IActionResult indicating the result of the deletion operation.
    /// </returns>
    /// <response code="200">
    /// Returns a success message if the period is deleted successfully.
    /// </response>
    /// <response code="401">
    /// If the user is not an admin, an Unauthorized response is returned with an error message
    /// indicating that the user does not have permission to delete committees.
    /// </response>
    /// <response code="404">
    /// If the period does not exist, a NotFound response is returned with an error message
    /// indicating that the period was not found.
    /// </response>
    /// <response code="500">
    /// If an error occurs while deleting the period, a 500 Internal Server Error response is
    /// returned.
    /// </response>
    [HttpDelete("DeletePeriod")]
    [SwaggerOperation(Summary = "Delete Period", Description = "This endpoint allows an admin user to delete a specific period by its ID.")]
    [SwaggerResponse(200, "Returns a success message if the period is deleted successfully.")]
    [SwaggerResponse(401, "If the user is not an admin, an Unauthorized response is returned with an error message indicating that the user does not have permission to delete committees.")]
    [SwaggerResponse(404, "If the period does not exist, a NotFound response is returned with an error message indicating that the period was not found.")]
    [SwaggerResponse(500, "If an error occurs while deleting the period, a 500 Internal Server Error response is returned.")]
    public async Task<IActionResult> DeletePeriod([FromQuery] Guid PeriodId)
    {
        _logger.LogInformation("DeletePeriod called with PeriodId: {PeriodId}", PeriodId);

        // Check if the user is an admin
        bool isAdmin = await AdminUtils.IsAdmin(HttpContext);
        if (!isAdmin)
        {
            _logger.LogWarning("Unauthorized attempt to delete period with ID: {PeriodId}", PeriodId);
            return Unauthorized("You do not have permission to delete committees.");
        }

        // Validate that the period exists
        Period? period = _context.Periods.FirstOrDefault(p => p.Id == PeriodId);
        if (period == null)
        {
            _logger.LogWarning("Period not found with ID: {PeriodId}", PeriodId);
            return NotFound("Period not found.");
        }

        // Remove the period from the database
        _context.Periods.Remove(period);
        _context.SaveChanges();

        _logger.LogInformation("Period deleted successfully with ID: {PeriodId}", PeriodId);

        return Ok("Period deleted successfully.");
    }

    /// <summary>
    /// Updates an existing period with the specified ID, name, start date, and end date
    /// This method checks if the user is an admin before allowing the update of a period.
    /// It validates that the name is not empty, that the start date is not after the
    /// end date, and that the period exists.
    /// If a period with the same name already exists (excluding the current period),
    /// it returns a BadRequest response.
    /// </summary>
    /// <param name="PeriodId">
    /// The ID of the period to be updated.
    /// </param>
    /// <param name="Name">
    /// The new name for the period.
    /// </param>
    /// <param name="StartDate">
    /// The new start date for the period.
    /// </param>
    /// <param name="EndDate">
    /// The new end date for the period.
    /// </param>
    /// <returns>
    /// An IActionResult containing the updated period or an error message if the update fails.
    /// </returns>
    /// <response code="200">
    /// Returns the updated period if the update is successful.
    /// </response>
    /// <response code="400">
    /// If the name is empty, the start date is after the end date, or a
    /// period with the same name already exists, a BadRequest response is returned with an error message.
    /// </response>
    /// <response code="401">
    /// If the user is not an admin, an Unauthorized response is returned.
    /// </response>
    /// <response code="404">
    /// If the period does not exist, a NotFound response is returned with an error message.
    /// </response>
    /// <response code="500">
    /// If an error occurs while updating the period, a 500 Internal Server Error response is
    /// returned.
    /// </response>
    [HttpPut("UpdatePeriod")]
    [SwaggerOperation(Summary = "Update Period", Description = "This endpoint allows an admin user to update an existing period with a specified ID, name, start date, and end date.")]
    [SwaggerResponse(200, "Returns the updated period if the update is successful.")]
    [ProducesResponseType(typeof(Period), 200)]
    [SwaggerResponse(400, "If the name is empty, the start date is after the end date, or a period with the same name already exists, a BadRequest response is returned with an error message.")]
    [SwaggerResponse(401, "If the user is not an admin, an Unauthorized response is returned.")]
    [SwaggerResponse(404, "If the period does not exist, a NotFound response is returned with an error message.")]
    [SwaggerResponse(500, "If an error occurs while updating the period, a 500 Internal Server Error response is returned.")]
    public async Task<IActionResult> UpdatePeriod([FromQuery] Guid PeriodId, [FromQuery] string Name, [FromQuery] DateTime StartDate, [FromQuery] DateTime EndDate)
    {
        _logger.LogInformation("UpdatePeriod called with PeriodId: {PeriodId}, Name: {Name}, StartDate: {StartDate}, EndDate: {EndDate}", PeriodId, Name, StartDate, EndDate);

        // Check if the user is an admin
        bool isAdmin = await AdminUtils.IsAdmin(HttpContext);
        if (!isAdmin)
        {
            _logger.LogWarning("Unauthorized attempt to update period with ID: {PeriodId}", PeriodId);
            return Unauthorized("You do not have permission to delete committees.");
        }

        // Trim the name
        string trimmedName = Name?.Trim() ?? string.Empty;

        // Validate that the name is not empty
        if (string.IsNullOrEmpty(trimmedName))
        {
            _logger.LogWarning("Attempt to update period with empty name");
            return BadRequest("Name cannot be empty.");
        }

        // Set the dates to UTC such that the database accepts them correctly
        DateTime UtcStartDate = DateTime.SpecifyKind(StartDate, DateTimeKind.Utc).Date;
        DateTime UtcEndDate = DateTime.SpecifyKind(EndDate, DateTimeKind.Utc).Date;

        // Validate that the start date is not after the end date
        if (UtcStartDate > UtcEndDate)
        {
            _logger.LogWarning("Start date {StartDate} is after end date {EndDate}.", UtcStartDate, UtcEndDate);
            return BadRequest("Start date must be earlier than end date.");
        }

        // Validate that the period exists
        Period? period = _context.Periods.FirstOrDefault(p => p.Id == PeriodId);
        if (period == null)
        {
            _logger.LogWarning("Period not found with ID: {PeriodId}", PeriodId);
            return NotFound("Period not found.");
        }

        // Check if a period with the same name already exists, excluding the current period
        if (_context.Periods.Any(p => p.Name == Name && p.Id != PeriodId))
        {
            _logger.LogWarning("Attempt to update period with duplicate name: {Name}", trimmedName);
            return BadRequest("Period with this name already exists.");
        }

        // Update the period's properties and save it to the database
        period.Name = trimmedName;
        period.StartDate = UtcStartDate;
        period.EndDate = UtcEndDate;

        _context.Periods.Update(period);
        _context.SaveChanges();

        _logger.LogInformation("Period updated successfully with ID: {PeriodId}", PeriodId);

        return Ok(period);
    }
}