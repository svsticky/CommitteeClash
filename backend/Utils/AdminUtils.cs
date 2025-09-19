using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;

namespace Commissiestrijd.Utils;

/// <summary>
/// Utility class for admin-related operations.
/// This class provides methods to set up the admin utilities and check if a user is an admin.
/// It retrieves the user information from the OpenID Connect provider
/// and checks if the user has admin privileges.
/// </summary>
public class AdminUtils
{
    private static string _userInfoUrl = "";

    /// <summary>
    /// Sets up the admin utilities by retrieving the user info endpoint from the OpenID Connect provider
    /// using the provided provider URI.
    /// This method should be called during application startup to ensure the user info URL is set correctly.
    /// </summary>
    public static async void Setup(Uri provider)
    {
        var client = new HttpClient();
        try
        {
            var discoveryJson = await client.GetStringAsync(new Uri(provider, ".well-known/openid-configuration"));
            using var doc = JsonDocument.Parse(discoveryJson);
            _userInfoUrl = doc.RootElement.GetProperty("userinfo_endpoint").GetString() ?? "";
        }
        catch (HttpRequestException e)
        {
            Uri target = new Uri(provider, ".well-known/openid-configuration");
            Console.WriteLine(target.AbsoluteUri);
            Console.WriteLine(provider.AbsoluteUri);
            Console.WriteLine("Failed to retrieve OpenID configuration: " + e.Message + " " + e.StatusCode);
        }
    }

    /// <summary>
    /// Checks if the current user is an admin by retrieving their user information from the OpenID
    /// Connect provider.
    /// This method uses the access token from the HTTP context to make a request to the user
    /// info endpoint and checks if the user has admin privileges.
    /// </summary>
    /// <param name="httpContext">
    /// The HTTP context containing the user's authentication information.
    /// </param>
    public static async Task<bool> IsAdmin(HttpContext httpContext)
    {
        // Retrieve the access token from the HTTP context
        var accessToken = await httpContext.GetTokenAsync("access_token");

        // Retrieve user information from the OpenID Connect provider
        var client = new HttpClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        var response = await client.GetAsync(_userInfoUrl);

        // Check if the response is successful and parse the user information
        if (response.IsSuccessStatusCode)
        {
            // Read the content and parse it as JSON
            var content = await response.Content.ReadAsStringAsync();
            var profile = JsonDocument.Parse(content);
            if (profile.RootElement.TryGetProperty("is_admin", out var isAdminProp))
            {
                return isAdminProp.GetBoolean();
            }
        }

        return false;
    }
}
