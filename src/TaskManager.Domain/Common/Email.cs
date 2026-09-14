namespace TaskManager.Domain.Common
{
    public sealed record Email
    {
        public string Value { get; init; }

        private Email(string value) => Value = value;

        public static Email Create(string value) => new Email(value ?? string.Empty);

        public override string ToString() => Value;
    }
}
