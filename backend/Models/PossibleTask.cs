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
    [Column("Id")]
    [Key]
    public required Guid Id { get; set; }

    [Column("Description")]
    [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
    [Required(ErrorMessage = "Description is required.")]
    public required string Description { get; set; }

    [Column("ShortDescription")]
    [StringLength(50, ErrorMessage = "Short description cannot exceed 50 characters.")]
    [Required(ErrorMessage = "Short description is required.")]
    public required string ShortDescription { get; set; }

    [Column("Points")]
    [Range(1, 100, ErrorMessage = "Points must be greater than zero and max 100.")]
    [Required(ErrorMessage = "Points are required.")]
    public required int Points { get; set; }

    [Column("IsActive")]
    [Required]
    public required bool IsActive { get; set; }

    [Column("MaxPerPeriod")]
    public int? MaxPerPeriod { get; set; }
}