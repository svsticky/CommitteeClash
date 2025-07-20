using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Commissiestrijd.Models;

/// <summary>
/// Represents a period in the application.
/// This class is used to define the properties of a period,
/// including its unique identifier, name, start date, and end date.
/// The Id property serves as the primary key for the period,
/// and the Name property is required with a maximum length of 50 characters.
/// The StartDate and EndDate properties are also required,
/// indicating the beginning and end of the period.
/// </summary>
public class Period
{
    /// <summary>
    /// The unique identifier for the period.
    /// This property is required and serves as the primary key for the period.
    /// </summary>
    [Column("Id")]
    [Key]
    public required Guid Id { get; set; }

    /// <summary>
    /// The name of the period.
    /// This property is required and has a maximum length of 50 characters.
    /// It serves as a descriptive label for the period.
    /// </summary>
    [Column("Name")]
    [StringLength(50, ErrorMessage = "Name cannot exceed 50 characters.")]
    [Required(ErrorMessage = "Name is required.")]
    public required string Name { get; set; }

    /// <summary>
    /// The start date of the period.
    /// This property is required and indicates when the period begins.
    /// </summary>
    [Column("StartDate")]
    [Required(ErrorMessage = "Start date is required.")]
    public required DateTime StartDate { get; set; }

    /// <summary>
    /// The end date of the period.
    /// This property is required and indicates when the period ends.
    /// It must be after the start date.
    /// </summary>
    [Column("EndDate")]
    [Required(ErrorMessage = "End date is required.")]
    public required DateTime EndDate { get; set; }
}