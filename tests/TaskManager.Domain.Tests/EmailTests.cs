using FluentAssertions;
using TaskManager.Domain.Exceptions;
using Email = TaskManager.Domain.ValueObjects.Email;

namespace TaskManager.Domain.Tests.ValueObjects;

public class EmailTests
{
    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("not-an-email")]
    [InlineData("user@")]
    public void Constructor_ShouldThrow_WhenEmailIsInvalid(string value)
    {
        Action act = () => _ = new Email(value);
        act.Should().Throw<DomainExceptions>();
    }

    [Fact]
    public void Constructor_ShouldNormalizeValue_WhenEmailIsValid()
    {
        var email = new Email("User@example.com");
        email.Value.Should().Be("user@example.com");
    }
}
