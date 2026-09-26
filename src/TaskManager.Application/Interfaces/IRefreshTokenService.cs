namespace TaskManager.Application.Interfaces
{
    public interface IRefreshTokenService
    {
        string GenerateRawToken();
        string Hash(string rawToken);
    }
}