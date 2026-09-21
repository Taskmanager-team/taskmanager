using FluentAssertions;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Exceptions;

namespace TaskManager.Domain.Tests.Entities;

public class TaskItemTests
{
    [Fact]
    public void Create_ShouldSetToDoStatus_WhenProjectIsActive()
    {
        var project = CreateActiveProject();
        var task = project.CreateTask("Develop authentication", TaskPriority.High, null);
        task.Status.Should().Be(TaskStatu.ToDo);
        task.ProjectId.Should().Be(project.Id);
    }

    [Fact]
    public void Create_ShouldThrow_WhenProjectIsArchived()
    {
        var project = CreateActiveProject();
        project.Archive();
        Action act = () => project.CreateTask("Blocked task", TaskPriority.Low, null);
        act.Should().Throw<DomainExceptions>().WithMessage("Impossible de créer une tâche dans un projet archivé.");
    }

    [Theory]
    [InlineData(TaskStatu.ToDo, TaskStatu.InProgress)]
    [InlineData(TaskStatu.InProgress, TaskStatu.InReview)]
    public void MoveTo_ShouldChangeStatus_WhenTransitionIsValid(TaskStatu initialStatus, TaskStatu targetStatus)
    {
        var task = CreateTaskAt(initialStatus);
        task.MoveTo(targetStatus);
        task.Status.Should().Be(targetStatus);
    }

    [Fact]
    public void MoveTo_ShouldChangeStatusToDone_WhenTaskHasAssignee()
    {
        var task = CreateTaskAt(TaskStatu.InReview, true);
        task.MoveTo(TaskStatu.Done);
        task.Status.Should().Be(TaskStatu.Done);
    }

    [Fact]
    public void MoveTo_ShouldThrow_WhenTaskHasNoAssignee()
    {
        var task = CreateTaskAt(TaskStatu.InReview);
        Action act = () => task.MoveTo(TaskStatu.Done);
        act.Should().Throw<DomainExceptions>().WithMessage("Impossible de terminer une tâche non assignée.");
    }

    [Theory]
    [InlineData(TaskStatu.ToDo, TaskStatu.ToDo)]
    [InlineData(TaskStatu.ToDo, TaskStatu.InReview)]
    [InlineData(TaskStatu.ToDo, TaskStatu.Done)]
    [InlineData(TaskStatu.InProgress, TaskStatu.ToDo)]
    [InlineData(TaskStatu.InProgress, TaskStatu.Done)]
    [InlineData(TaskStatu.InReview, TaskStatu.ToDo)]
    [InlineData(TaskStatu.InReview, TaskStatu.InProgress)]
    [InlineData(TaskStatu.Done, TaskStatu.ToDo)]
    [InlineData(TaskStatu.Done, TaskStatu.InProgress)]
    [InlineData(TaskStatu.Done, TaskStatu.InReview)]
    public void MoveTo_ShouldThrowInvalidTaskTransition_WhenTransitionIsInvalid(TaskStatu initialStatus, TaskStatu targetStatus)
    {
        var task = CreateTaskAt(initialStatus, true);
        Action act = () => task.MoveTo(targetStatus);
        act.Should().Throw<InvalidTaskTransitionException>();
    }

    private static TaskItem CreateTaskAt(TaskStatu status, bool assignUser = false)
    {
        var task = CreateActiveProject().CreateTask("Implement feature", TaskPriority.Medium, null);
        if (assignUser) task.AssignTo(Guid.NewGuid());
        if (status is TaskStatu.InProgress or TaskStatu.InReview or TaskStatu.Done) task.MoveTo(TaskStatu.InProgress);
        if (status is TaskStatu.InReview or TaskStatu.Done) task.MoveTo(TaskStatu.InReview);
        if (status == TaskStatu.Done) task.MoveTo(TaskStatu.Done);
        return task;
    }

    private static Project CreateActiveProject() => Project.Create(Guid.NewGuid(), "Project", null);
}
