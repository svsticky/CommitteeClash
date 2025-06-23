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
    public enum TaskStatus
    {
        Pending,
        Approved,
        Rejected
    }

    [Column("Id")]
    [Key]
    public required Guid Id { get; set; }

    [Column("PossibleTaskId")]
    [ForeignKey("PossibleTask")]
    [Required(ErrorMessage = "Possible Task ID is required.")]
    public required Guid PossibleTaskId { get; set; }

    [Column("SubmittedAt")]
    [Required(ErrorMessage = "Submission date is required.")]
    public required DateTime SubmittedAt { get; set; }

    [Column("Committee")]
    [ForeignKey("Committee")]
    [Required(ErrorMessage = "Committee is required.")]
    public required string Committee { get; set; }

    [Column("ImagePath")]
    [StringLength(255, ErrorMessage = "Image path cannot exceed 255 characters.")]
    [Required(ErrorMessage = "Image path is required.")]
    public required string ImagePath { get; set; }

    [Column("Status")]
    [Required(ErrorMessage = "Task status is required.")]
    [EnumDataType(typeof(TaskStatus), ErrorMessage = "Invalid task status.")]
    public required TaskStatus Status { get; set; }

    [Column("Points")]
    [Range(1, 100, ErrorMessage = "Points must be greater than zero and max 100.")]
    [Required(ErrorMessage = "Points are required.")]
    public required int Points { get; set; }

    [Column("RejectionReason")]
    [StringLength(500, ErrorMessage = "Rejection reason cannot exceed 500 characters.")]
    public string? RejectionReason { get; set; } = null;

    [Column("MaxPerPeriod")]
    public int? MaxPerPeriod { get; set; } = null;
}

public class SubmitTaskRequestDto
{
    public required Guid TaskId { get; set; }
    public required string Committee { get; set; }
    public required IFormFile Image { get; set; }
}