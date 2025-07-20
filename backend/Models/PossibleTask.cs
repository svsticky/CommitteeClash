using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Commissiestrijd.Models;

/// <summary>
/// Represents a possible task in the application.
/// This class is used to define the properties of a task,
/// including its unique identifier, description, short description, points,
/// active status, and maximum allowed tasks per period.
/// The Id property serves as the primary key for the task,
/// and the Description and ShortDescription properties are required with specified maximum lengths.
/// The Points property is required and must be within a specified range.
/// The IsActive property indicates whether the task is currently active,
/// and the MaxPerPeriod property indicates the maximum number of times this task can be completed in a given period.
/// </summary>
public class PossibleTask
{
    /// <summary>
    /// The unique identifier for the possible task.
    /// This property is required and serves as the primary key for the task.
    /// </summary>
    [Column("Id")]
    [Key]
    public required Guid Id { get; set; }

    /// <summary>
    /// The description of the possible task.
    /// This property is required and has a maximum length of 500 characters.
    /// It provides a detailed explanation of what the task entails.
    /// </summary>
    [Column("Description")]
    [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
    [Required(ErrorMessage = "Description is required.")]
    public required string Description { get; set; }

    /// <summary>
    /// The short description of the possible task.
    /// This property is required and has a maximum length of 50 characters.
    /// It provides a brief summary of the task for quick reference.
    /// </summary>
    [Column("ShortDescription")]
    [StringLength(50, ErrorMessage = "Short description cannot exceed 50 characters.")]
    [Required(ErrorMessage = "Short description is required.")]
    public required string ShortDescription { get; set; }

    /// <summary>
    /// The points awarded for completing the possible task.
    /// This property is required and must be greater than zero and a maximum of 100.
    /// It indicates the value of the task in terms of points that can be earned.
    /// </summary>
    [Column("Points")]
    [Range(1, 100, ErrorMessage = "Points must be greater than zero and max 100.")]
    [Required(ErrorMessage = "Points are required.")]
    public required int Points { get; set; }

    /// <summary>
    /// Indicates whether the possible task is currently active.
    /// This property is required and determines if the task can be submitted.
    /// </summary>
    [Column("IsActive")]
    [Required]
    public required bool IsActive { get; set; }

    /// <summary>
    /// The maximum number of times this task can be completed in a given period.
    /// This property is optional and can be null,
    /// indicating that there is no limit on the number of times the task can be completed.
    /// If specified, it must be a non-negative integer.
    /// </summary>
    [Column("MaxPerPeriod")]
    public int? MaxPerPeriod { get; set; }
}