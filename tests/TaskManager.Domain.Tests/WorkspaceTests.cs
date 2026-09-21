using FluentAssertions;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Exceptions;

namespace TaskManager.Domain.Tests.Entities;

public class WorkspaceTests
{
    [Fact]
    public void ChangeMemberRole_ShouldThrow_WhenDemotingTheLastAdmin()
    {
        var workspace = new Workspace("Workspace", Guid.NewGuid());
        var adminId = Guid.NewGuid();
        workspace.InviteMember(adminId, WorkspaceRole.Admin);
        Action act = () => workspace.ChangeMemberRole(adminId, WorkspaceRole.Member);
        act.Should().Throw<DomainExceptions>().WithMessage("A workspace must always have at least one Admin.");
        workspace.Members.Should().ContainSingle(member => member.Role == WorkspaceRole.Admin);
    }

    [Fact]
    public void ChangeMemberRole_ShouldAllowDemotingAnAdmin_WhenAnotherAdminRemains()
    {
        var workspace = new Workspace("Workspace", Guid.NewGuid());
        var firstAdminId = Guid.NewGuid();
        workspace.InviteMember(firstAdminId, WorkspaceRole.Admin);
        workspace.InviteMember(Guid.NewGuid(), WorkspaceRole.Admin);
        workspace.ChangeMemberRole(firstAdminId, WorkspaceRole.Member);
        workspace.Members.Should().ContainSingle(member => member.Role == WorkspaceRole.Admin);
    }
}
