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
    [Column("Id")]
    [Key]
    public required Guid Id { get; set; }

    [Column("Name")]
    [StringLength(50, ErrorMessage = "Name cannot exceed 50 characters.")]
    [Required(ErrorMessage = "Name is required.")]
    public required string Name { get; set; }

    [Column("StartDate")]
    [Required(ErrorMessage = "Start date is required.")]
    public required DateTime StartDate { get; set; }

    [Column("EndDate")]
    [Required(ErrorMessage = "End date is required.")]
    public required DateTime EndDate { get; set; }
}