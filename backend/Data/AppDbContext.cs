using Commissiestrijd.Models;
using Microsoft.EntityFrameworkCore;

namespace Commissiestrijd.Data;

/// <summary>
/// Represents the application's database context.
/// This context is used to interact with the database and manage the application's data.
/// It includes DbSet properties for each entity type in the application,
/// such as PossibleTasks, SubmittedTasks, Committees, and Periods.
/// The context is configured to use Entity Framework Core for database operations.
/// </summary>
public class AppDbContext : DbContext
{
    /// <summary>
    /// Initializes a new instance of the AppDbContext class with the specified options.
    /// This constructor is used to set up the database context with the provided options,
    /// allowing for configuration of the database connection and other settings.
    /// </summary>
    /// <param name="options">
    /// The options used to configure the database context.
    /// </param>
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    /// <summary>
    /// This property represents the set of possible tasks that can be submitted.
    /// It is used to query and save instances of the PossibleTask entity in the database.
    /// </summary>
    public DbSet<PossibleTask> PossibleTasks { get; set; } = null!;

    /// <summary>
    /// This property represents the set of submitted tasks in the application.
    /// It is used to query and save instances of the SubmittedTask entity in the database.
    /// </summary>
    public DbSet<SubmittedTask> SubmittedTasks { get; set; } = null!;

    /// <summary>
    /// This property represents the set of committees in the application.
    /// It is used to query and save instances of the Committee entity in the database.
    /// </summary>
    public DbSet<Committee> Committees { get; set; } = null!;

    /// <summary>
    /// This property represents the set of periods in the application.
    /// It is used to query and save instances of the Period entity in the database.
    /// </summary>
    public DbSet<Period> Periods { get; set; } = null!;

    /// <summary>
    /// Configures the model for the application.
    /// This method is called by the Entity Framework Core runtime to configure the model
    /// and set up the relationships between entities, indexes, and other configurations.
    /// It is used to define the database schema and constraints for the application's data.
    /// </summary>
    /// <param name="modelBuilder">
    /// The model builder used to configure the model.
    /// </param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<PossibleTask>()
            .HasIndex(t => t.Description)
            .IsUnique();

        modelBuilder.Entity<Period>()
            .HasIndex(t => t.Name)
            .IsUnique();
    }
}