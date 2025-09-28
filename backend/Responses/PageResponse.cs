using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Commissiestrijd.Responses;

/// <summary>
/// Represents a paginated response for a collection of items.
/// This class is used to encapsulate a list of items along with pagination information,
/// including the total number of pages based on the specified page size.
/// The PageAmount property indicates how many pages of items are available,
/// and the Items property contains the actual list of items for the current page.
/// </summary>
public class PageResponse<T>
{
    /// <summary>
    /// Gets the total number of pages available for the current set of items.
    /// </summary>
    public int PageAmount { get; }

    /// <summary>
    /// Gets the list of items for the current page.
    /// </summary>
    public List<T> Items { get; }

    /// <summary>
    /// Initializes a new instance of the PageResponse class.
    /// This constructor takes a list of items and a page size as parameters,
    /// and calculates the total number of pages based on the number of items and the specified page size.
    /// </summary>
    public PageResponse(List<T> items, int pageSize)
    {
        Items = items;
        PageAmount = (int)Math.Ceiling((double)items.Count / pageSize);
    }
}