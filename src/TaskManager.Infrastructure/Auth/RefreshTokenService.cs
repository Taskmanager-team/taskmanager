using System.Security.Cryptography;
using System.Text;
using TaskManager.Application.Interfaces;

namespace TaskManager.Infrastructure.Auth
{
    public class RefreshTokenService : IRefreshTokenService
    {
        public string GenerateRawToken()
        {
            var randomBytes = RandomNumberGenerator.GetBytes(64);
            return Convert.ToBase64String(randomBytes);
        }

        public string Hash(string rawToken)
        {
            var bytes = Encoding.UTF8.GetBytes(rawToken);
            var hashBytes = SHA256.HashData(bytes);
            return Convert.ToBase64String(hashBytes);
        }
    }
}