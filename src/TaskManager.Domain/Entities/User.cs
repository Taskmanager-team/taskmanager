using TaskManager.Domain.Common;
using TaskManager.Domain.Exceptions;

namespace TaskManager.Domain.Entities
{
    public class User : BaseEntity
    {
        public Guid IdentityUserId { get; private set; }
        public string FirstName { get; private set; } = string.Empty;
        public string LastName { get; private set; } = string.Empty;
        public string Email { get; private set; } = string.Empty;

        private User() { } // requis par EF Core

        private User(Guid identityUserId, string firstName, string lastName, string email)
        {
            if (identityUserId == Guid.Empty)
                throw new DomainExceptions("L'identifiant d'identité est obligatoire.");
            if (string.IsNullOrWhiteSpace(firstName))
                throw new DomainExceptions("Le prénom est obligatoire.");
            if (string.IsNullOrWhiteSpace(lastName))
                throw new DomainExceptions("Le nom est obligatoire.");
            if (string.IsNullOrWhiteSpace(email))
                throw new DomainExceptions("L'email est obligatoire.");

            IdentityUserId = identityUserId;
            FirstName = firstName;
            LastName = lastName;
            Email = email;
        }

        public static User Create(Guid identityUserId, string firstName, string lastName, string email)
        {
            return new User(identityUserId, firstName, lastName, email);
        }

        public void ChangeEmail(string newEmail)
        {
            if (string.IsNullOrWhiteSpace(newEmail))
                throw new DomainExceptions("L'email est obligatoire.");
            Email = newEmail;
        }
    }
}