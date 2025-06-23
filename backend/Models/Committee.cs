using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Commissiestrijd.Models;

/// <summary>
/// Represents a committee in the application.
/// This class is used to define the properties of a committee,
/// including its name.
/// The Name property is marked as required and serves as the primary key for the committee.
/// </summary>
public class Committee
{
    [Column("Name")]
    [Key]
    public required string Name { get; set; }
}