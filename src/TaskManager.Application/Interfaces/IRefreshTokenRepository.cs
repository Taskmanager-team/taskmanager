using TaskManager.Domain.Entities;

namespace TaskManager.Application.Interfaces
{
    public interface IRefreshTokenRepository
    {
        Task<RefreshToken?> GetByTokenHashAsync(string tokenHash,CancellationToken ct = default );
        Task AddAsync(RefreshToken token , CancellationToken ct = default);
        void Update(RefreshToken token);
        Task RevokeFamilyAsync(Guid familyId, CancellationToken ct = default );
    }
}