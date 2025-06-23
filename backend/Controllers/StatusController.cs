using Microsoft.AspNetCore.Mvc;

namespace Commissiestrijd.Controllers;

/// <summary>
/// Controller for handling status operations.
/// This controller allows users to check the status of the application.
/// It provides a simple endpoint to verify if the application is online.
/// </summary>
[ApiController]
[Route("[controller]")]
public class StatusController : Controller
{
    /// <summary>
    /// Checks the status of the application.
    /// This method provides a simple endpoint to verify if the application is online.
    /// It returns a 200 OK response with the message "online" if the application is running.
    /// If the application is not running, it will return an appropriate error response.
    /// </summary>
    /// <returns>
    /// An IActionResult containing the status message.
    /// </returns>
    /// <response code="200">
    /// Returns a 200 OK response with the message "online".
    /// </response>
    /// <response code="500">
    /// If the application is not running, it will return a 500 Internal Server Error response
    /// with an appropriate error message.
    /// </response>
    [HttpGet]
    public IActionResult Status()
    {
        return Ok("online");
    }
}
