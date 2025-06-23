using Commissiestrijd.Data;
using Commissiestrijd.Utils;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Serilog;
using Swashbuckle.AspNetCore.SwaggerGen;
using Swashbuckle.AspNetCore.SwaggerUI;
using System.Text.Json.Serialization;

namespace Commissiestrijd
{
    /// <summary>
    /// Represents the main entry point of the Commissiestrijd application.
    /// This class sets up the web application, configures services, logging, and middleware,
    /// and runs the application.
    /// </summary>
    public class Program
    {
        public static string HostUrl { get; private set; } = "http://localhost:3000";

        /// <summary>
        /// The main entry point for the application.
        /// This method initializes the web application,
        /// configures services, logging, and middleware,
        /// and starts the application.
        /// </summary>
        /// <param name="args">
        /// Command-line arguments passed to the application.
        /// </param>
        public static void Main(string[] args)
        {
            // # Builder
            WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
            ConfigureLogging();

            // # Services
            builder.Services.AddControllers().AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                });

            builder.Services.AddOpenApi();
            builder.Services.AddSwaggerGen(ConfigureSwagger);


            // # Database context
            builder.Services.AddDbContext<AppDbContext>(
                // CONNECTION_STRING is set in docker-compose.dev.yml file
                options => options.UseNpgsql(builder.Configuration.GetValue<string>("CONNECTION_STRING")
            ));

            HostUrl = builder.Configuration.GetValue<string>("HOST_URL") ?? HostUrl;

            // CORS to allow Cross Origin Resource Sharing
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.WithOrigins(HostUrl)
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            });

            // # Authentication
            builder.Services.AddAuthentication("Bearer")
                .AddOAuth2Introspection("Bearer", options =>
                {
                    options.Authority = builder.Configuration.GetValue<string>("OAUTH_PROVIDER_URL");
                    options.ClientId = builder.Configuration.GetValue<string>("OAUTH_CLIENT_ID");
                    options.ClientSecret = builder.Configuration.GetValue<string>("OAUTH_CLIENT_SECRET");
                });

            // # Cleanup
            builder.Services.AddHostedService<SubmittedImageCleaningService>();

            // # Application
            WebApplication app = builder.Build();

            // # Middleware
            if (app.Environment.IsDevelopment())
            {
                // Run only in development environment:
                app.MapOpenApi();
                app.UseSwagger();
                app.UseSwaggerUI(ConfigureSwaggerUI);
                app.UseDeveloperExceptionPage();
            }

            app.UseHttpsRedirection();
            app.UseRouting();
            app.UseCors("AllowFrontend");
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();

            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                db.Database.Migrate();
            }

            AdminUtils.Setup(new Uri(builder.Configuration["OAUTH_PROVIDER_URL"] ?? "https://koala.dev.svsticky.nl"));

            app.Run();
        }


        /// <summary>
        /// Configures Swagger documentation settings.
        /// </summary>
        /// <param name="c">The <see cref="SwaggerGenOptions"/> instance to configure.</param>
        /// <remarks>
        /// This method sets up Swagger with API information and enables annotations.
        /// </remarks>
        private static void ConfigureSwagger(SwaggerGenOptions c)
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "Commissiestrijd", Version = "v1" });
            c.EnableAnnotations();

            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Description = "Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
            });

            c.AddSecurityRequirement(new OpenApiSecurityRequirement()
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
        }


        /// <summary>
        /// Configures the Swagger UI settings.
        /// </summary>
        /// <param name="c">The Swagger UI options to configure.</param>
        /// <remarks>
        /// This method sets up the Swagger endpoint, route prefix, and document title for the API documentation.
        /// The documentation will be available at the "/docs" route.
        /// </remarks>
        private static void ConfigureSwaggerUI(SwaggerUIOptions c)
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "Version-1");
            c.RoutePrefix = "docs";
            c.DocumentTitle = "Commissiestrijd API";
        }


        /// <summary>
        /// Configures the application logging system using Serilog.
        /// </summary>
        /// <remarks>
        /// This method sets up Serilog with configuration from "serilogsettings.json" file
        /// and establishes two logging sinks:
        /// 1. Console output for immediate visibility
        /// 2. Daily rolling text files stored in the "logs" directory with the naming pattern "log-YYYYMMDD.txt"
        /// </remarks>
        private static void ConfigureLogging()
        {
            IConfigurationRoot configuration = new ConfigurationBuilder()
                                        .SetBasePath(Directory.GetCurrentDirectory())
                                        .AddJsonFile("serilogsettings.json")
                                        .Build();

            Log.Logger = new LoggerConfiguration()
                                .ReadFrom.Configuration(configuration)
                                .CreateLogger();
        }


        /// <summary>
        /// Configures the OpenAPI operation metadata for identity API endpoints.
        /// </summary>
        /// <param name="operation">The OpenAPI operation to configure.</param>
        /// <returns>The configured OpenAPI operation with updated summary information.</returns>
        /// <remarks>
        /// This method sets the summary description for identity-related API endpoints that handle user management operations.
        /// </remarks>
        private static OpenApiOperation ConfigureIdentityApiOptions(OpenApiOperation operation)
        {
            operation.Summary = "Identity endpoints for user management";
            return operation;
        }
    }
}