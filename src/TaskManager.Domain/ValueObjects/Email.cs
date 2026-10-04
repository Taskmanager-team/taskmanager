using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using TaskManager.Domain.Exceptions;

namespace TaskManager.Domain.ValueObjects
{
    public sealed class Email : IEquatable<Email>
    {
        public string Value { get; } = null!;

        private Email() { }
        public Email(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new DomainExceptions("Email est obligatoire");
            try
            {
                var mailAddress = new MailAddress(value);
                if(mailAddress.Address != value)
                    throw new DomainExceptions("Email n'est pas valide");
            }
            catch
            {
                throw new DomainExceptions("Email n'est pas valide");
            }
            Value = value.ToLowerInvariant();
        }

        public bool Equals(Email? other) => other is not null && Value == other.Value;

        public override bool Equals(object? obj) => Equals(obj as Email);

        public override int GetHashCode() => Value.GetHashCode(StringComparison.Ordinal);
    }
}
