using TaskManager.Domain.Common;

namespace TaskManager.Domain.Entities
{
    public class RefreshToken : BaseEntity
    {
        public Guid IdentityUserId {get;private set;}
        public string TokenHash {get;private set;} = string.Empty;
        public Guid FamilyId {get;private set;}
        public DateTime ExpiresAt {get;private set;}
        public DateTime? RevokedAt {get;private set;}
        public Guid? ReplacedByTokenId{get;private set;}

        private RefreshToken(){}

        private RefreshToken(Guid identityUserId ,string tokenHash,Guid familyId,DateTime expiresAt)
        {
            IdentityUserId = identityUserId;
            TokenHash = tokenHash;
            FamilyId = familyId;
            ExpiresAt = expiresAt;
        }
        public static RefreshToken CreateNew(Guid IdentityUserId , string TokenHash,DateTime ExpiresAt)
        {
            return new RefreshToken(IdentityUserId,TokenHash,Guid.NewGuid(),ExpiresAt);
        }
        public static RefreshToken CreateInFamily(Guid identityUserId, string tokenHash, Guid familyId, DateTime expiresAt)
        {
            return new RefreshToken(identityUserId, tokenHash, familyId, expiresAt);
        }
        
        public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
        public bool IsRevoked => RevokedAt.HasValue;

        public void Revoke()
        {
            RevokedAt = DateTime.UtcNow;
        }
         public void MarkReplacedBy(Guid newTokenId)
        {
            RevokedAt = DateTime.UtcNow;
            ReplacedByTokenId = newTokenId;
        }

    }
}