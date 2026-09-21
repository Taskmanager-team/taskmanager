using TaskManager.Domain.Entities;

namespace TaskManager.Application.Interfaces
{
    public interface ITokenService
    {
        Task<string> GenerateAccessTokenAsync(
            Guid identityUserId,
            string? identityUserEmail,
            User domainUser,
            IList<string> roles);
    }
}