using Commissiestrijd.Data;
using Commissiestrijd.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Commissiestrijd.Controllers;

/// <summary>
/// Controller for handling image retrieval.
/// This controller allows users to retrieve images by filename.
/// It checks if the user is an admin before allowing access to the images.
/// The images are stored in the "submittedimages" directory within the current working directory.
/// The images are served with the appropriate MIME type based on their file extension.
/// If the image does not exist, a 404 Not Found response is returned.
/// </summary>
[Authorize]
[ApiController]
[Route("[controller]")]
public class ImageController : Controller
{
    /// <summary>
    /// The logger used for logging information and errors in the controller.
    /// This logger is used to log various events and errors that occur during the execution of the controller's actions,
    /// helping with debugging and monitoring the application's behavior.
    /// </summary>
    private readonly ILogger<ImageController> _logger;

    /// <summary>
    /// Constructor for the ImageController.
    /// Initializes the controller with the provided database context and logger.
    /// This constructor is used to set up the necessary dependencies for the controller,
    /// allowing it to access submitted task data and log information or errors during operations.
    /// </summary>
    public ImageController(ILogger<ImageController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Retrieves an image by its filename.
    /// This method checks if the user is an admin before allowing access to the image.
    /// The image is expected to be stored in the "submittedimages" directory within the current working directory.
    /// If the image exists, it is returned with the appropriate MIME type based on its file extension.
    /// If the image does not exist, a 404 Not Found response is returned.
    /// </summary>
    /// <param name="filename">
    /// The name of the image file to retrieve.</param>
    /// <returns>
    /// An IActionResult containing the image file or a NotFound result if the image does not exist.
    /// </returns>
    /// <response code="200">
    /// Returns the image file with the appropriate MIME type.
    /// </response>
    /// <response code="401">
    /// If the user is not an admin, an Unauthorized result is returned.
    /// </response>
    /// <response code="404">
    /// If the image file does not exist, a NotFound result is returned.
    /// </response>
    /// <response code="500">
    /// If an error occurs while processing the request, a 500 Internal Server Error result is returned.
    /// </response>
    [HttpGet("GetImage/{filename}")]
    [SwaggerOperation(Summary = "Get Image", Description = "This endpoint retrieves an image by its filename.")]
    [SwaggerResponse(200, "Returns the image file with the appropriate MIME type.")]
    [ProducesResponseType(typeof(FileResult), 200)]
    [SwaggerResponse(401, "Unauthorized if the user is not an admin.")]
    [SwaggerResponse(404, "NotFound if the image file does not exist.")]
    [SwaggerResponse(500, "Internal Server Error if an error occurs while processing the request.")]
    public async Task<IActionResult> GetImage(string filename)
    {
        _logger.LogInformation("GetImage called with filename: {Filename}", filename);

        // Check if the user is an admin
        bool isAdmin = await AdminUtils.IsAdmin(HttpContext);
        if (!isAdmin)
        {
            _logger.LogWarning("Unauthorized access attempt to GetImage");
            return Unauthorized("You do not have permission to delete committees.");
        }

        // Get the path to the uploaded images folder
        string uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "submittedimages");
        string filePath = Path.Combine(uploadsFolder, filename);

        // Check if the file exists
        if (!System.IO.File.Exists(filePath))
        {
            _logger.LogWarning("Image file not found: {FilePath}", filePath);
            return NotFound();
        }

        // Determine the MIME type based on the file extension
        string mimeType = "application/octet-stream";
        string ext = Path.GetExtension(filePath).ToLowerInvariant();
        if (ext == ".jpg" || ext == ".jpeg") mimeType = "image/jpeg";
        else if (ext == ".png") mimeType = "image/png";
        else if (ext == ".gif") mimeType = "image/gif";

        // Read the file bytes
        byte[] bytes = System.IO.File.ReadAllBytes(filePath);

        _logger.LogInformation("Image file found and read successfully: {FilePath}", filePath);

        return File(bytes, mimeType);
    }
}
