using System;
using System.Net.Mail;
using TaskManager.Domain.Exceptions;

namespace TaskManager.Domain.ValueObjects
{
    public sealed class Email : IEquatable<Email>
    {
        public string Value { get; private set; } = string.Empty;

        private Email() { }

        public Email(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new DomainExceptions("Email est obligatoire");
            try
            {
                var mailAddress = new MailAddress(value);
                if (mailAddress.Address != value)
                    throw new DomainExceptions("Email n'est pas valide");
            }
            catch
            {
                throw new DomainExceptions("Email n'est pas valide");
            }
            Value = value.ToLowerInvariant();
        }

        public static Email Create(string value)
        {
            return new Email(value);
        }

        public bool Equals(Email? other)
        {
            if (other is null) return false;
            if (ReferenceEquals(this, other)) return true;
            return Value == other.Value;
        }

        public override bool Equals(object? obj)
        {
            return Equals(obj as Email);
        }

        public override int GetHashCode()
        {
            return Value.GetHashCode();
        }
    }
}
