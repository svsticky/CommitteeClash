using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Commissiestrijd.Models;

/// <summary>
/// Represents a submitted task in the application.
/// This class is used to define the properties of a task that has been submitted by a user
/// including its unique identifier, the ID of the possible task it relates to,
/// the date it was submitted, the committee it was submitted to,
/// the path to the image associated with the submission, its status, points awarded,
/// and any rejection reason if applicable.
/// The Id property serves as the primary key for the submitted task,
/// the PossibleTaskId property is a foreign key linking to the PossibleTask entity,
/// the SubmittedAt property indicates when the task was submitted,
/// the Committee property indicates which committee the task was submitted to,
/// the ImagePath property stores the path to the image associated with the submission,
/// the Status property indicates the current status of the task (Pending, Approved, or Rejected),
/// the Points property indicates the points awarded for the task,
/// and the RejectionReason property provides a reason for rejection if the task was not approved.
/// The MaxPerPeriod property indicates the maximum number of times this task can be completed in a given period.
/// </summary>
public class SubmittedTask
{
    /// <summary>
    /// Represents the status of the submitted task.
    /// This enum defines the possible states of a submitted task:
    /// Pending, Approved, and Rejected.
    /// Each status indicates the current state of the task in the submission process.
    /// </summary>
    public enum TaskStatus
    {
        /// <summary>
        /// Indicates that the task is pending review.
        /// This status is set when the task has been submitted but not yet reviewed.
        /// </summary>
        Pending,

        /// <summary>
        /// Indicates that the task has been approved.
        /// This status is set when the task has been reviewed and accepted.
        /// </summary>
        Approved,

        /// <summary>
        /// Indicates that the task has been rejected.
        /// This status is set when the task has been reviewed and not accepted,
        /// and a reason for rejection may be provided.
        /// </summary>
        Rejected
    }

    /// <summary>
    /// The unique identifier for the submitted task.
    /// This property is required and serves as the primary key for the task.
    /// </summary>
    [Column("Id")]
    [Key]
    public required Guid Id { get; set; }

    /// <summary>
    /// The unique identifier for the possible task that this submission relates to.
    /// This property is required and serves as a foreign key linking to the PossibleTask entity.
    /// It indicates which possible task this submission is based on.
    /// </summary>
    [Column("PossibleTaskId")]
    [ForeignKey("PossibleTask")]
    [Required(ErrorMessage = "Possible Task ID is required.")]
    public required Guid PossibleTaskId { get; set; }

    /// <summary>
    /// The date and time when the task was submitted.
    /// This property is required and indicates when the submission occurred.
    /// It is used to track the submission time for the task.
    /// </summary>
    [Column("SubmittedAt")]
    [Required(ErrorMessage = "Submission date is required.")]
    public required DateTime SubmittedAt { get; set; }

    /// <summary>
    /// The committee to which the task was submitted.
    /// This property is required and serves as a foreign key linking to the Committee entity.
    /// It indicates which committee the task was submitted to for review.
    /// </summary>
    [Column("Committee")]
    [ForeignKey("Committee")]
    [Required(ErrorMessage = "Committee is required.")]
    public required string Committee { get; set; }

    /// <summary>
    /// The path to the image associated with the submission.
    /// This property is required and has a maximum length of 255 characters.
    /// It stores the file path or URL of the image that was uploaded with the task submission.
    /// </summary>
    [Column("ImagePath")]
    [StringLength(255, ErrorMessage = "Image path cannot exceed 255 characters.")]
    [Required(ErrorMessage = "Image path is required.")]
    public required string ImagePath { get; set; }

    /// <summary>
    /// The current status of the submitted task.
    /// This property is required and indicates the state of the task in the submission process.
    /// It can be one of the values defined in the TaskStatus enum (Pending, Approved
    /// or Rejected).
    /// /// </summary>
    [Column("Status")]
    [Required(ErrorMessage = "Task status is required.")]
    [EnumDataType(typeof(TaskStatus), ErrorMessage = "Invalid task status.")]
    public required TaskStatus Status { get; set; }

    /// <summary>
    /// The points awarded for the submitted task.
    /// This property is required and indicates the number of points that the task has been awarded.
    /// It is used to track the points earned by the user for completing the task.
    /// </summary>
    [Column("Points")]
    [Range(1, 100, ErrorMessage = "Points must be greater than zero and max 100.")]
    [Required(ErrorMessage = "Points are required.")]
    public required int Points { get; set; }

    /// <summary>
    /// The reason for rejection if the task was not approved.
    /// This property is optional and can be null.
    /// It provides a reason for why the task was rejected,
    /// allowing users to understand the feedback on their submission.
    /// If the task is approved or pending, this property can be left null.
    /// </summary>
    [Column("RejectionReason")]
    [StringLength(500, ErrorMessage = "Rejection reason cannot exceed 500 characters.")]
    public string? RejectionReason { get; set; } = null;

    /// <summary>
    /// The maximum number of times this task can be completed in a given period.
    /// This property is optional and can be null,
    /// indicating that there is no limit on the number of times the task can be completed.
    /// If specified, it must be a non-negative integer.
    /// </summary>
    [Column("MaxPerPeriod")]
    public int? MaxPerPeriod { get; set; } = null;
}

/// <summary>
/// Represents a data transfer object (DTO) for submitting a task.
/// This class is used to encapsulate the data required to submit a task,
/// including the task ID, committee name, and the image file associated with the submission.
/// </summary>
public class SubmitTaskRequestDto
{
    /// <summary>
    /// The unique identifier for the task being submitted.
    /// This property is required and indicates which possible task the submission relates to.
    /// </summary>
    public required Guid TaskId { get; set; }

    /// <summary>
    /// The name of the committee to which the task is being submitted.
    /// This property is required and indicates which committee the task is being submitted to for review.
    /// </summary>
    public required string Committee { get; set; }

    /// <summary>
    /// The image file associated with the task submission.
    /// This property is required and represents the image that the user uploads as part of the task
    /// submission process.
    /// It is expected to be an IFormFile, which allows for file uploads in ASP.NET Core applications.
    /// </summary>
    public required IFormFile Image { get; set; }
}