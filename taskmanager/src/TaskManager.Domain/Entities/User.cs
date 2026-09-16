using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaskManager.Domain.Common;
using TaskManager.Domain.Exceptions;

namespace TaskManager.Domain.Entities
{
    public class User : BaseEntity
    {
        public string FirstName { get; private set; }
        public string LastName { get; private set; }
        public string Email { get; private set; }
        private User() { } // requis par EF Core
        public User(string firstName, string lastName, string email, string passwordHash)
        {
            if (string.IsNullOrWhiteSpace(firstName))
                throw new DomainExceptions("Le prénom est obligatoire.");
            if (string.IsNullOrWhiteSpace(lastName))
                throw new DomainExceptions("Le nom est obligatoire.");
            if (string.IsNullOrWhiteSpace(email))
                throw new DomainExceptions("L'email est obligatoire.");
            if (string.IsNullOrWhiteSpace(passwordHash))
                throw new DomainExceptions("Le mot de passe est obligatoire.");
            FirstName = firstName;
            LastName = lastName;
            Email = email;
      
        }
    }
}
