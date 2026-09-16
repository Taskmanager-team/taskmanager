using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


using TaskManager.Domain.Common;
using TaskManager.Domain.Exceptions;
namespace TaskManager.Domain.Entities
{
    public class Comments: BaseEntity
    {
        public String Content { get; private set; }
        public Guid TaskItemId { get; private set; }
        public Guid AuthorId { get; private set; }

        private Comments() { }

        private Comments(string content, Guid taskItemId, Guid authorId)
        {
            if(TaskItemId==Guid.Empty)throw new DomainExceptions("TaskItemId est obligatoire");
            if(AuthorId==Guid.Empty)throw new DomainExceptions("AuthorId est obligatoire");
            if(string.IsNullOrWhiteSpace(content))throw new DomainExceptions("Content est obligatoire");

            Content = content;
            TaskItemId = taskItemId;
            AuthorId = authorId;
        }
        public static Comments create(string content, Guid taskItemId, Guid authorId)
        {
            return new Comments(content, taskItemId, authorId);
        }
        public void update(string content)
        {
            if(string.IsNullOrWhiteSpace(content))throw new DomainExceptions("Content est obligatoire");
            if(content.Length>1000)throw new DomainExceptions("Content ne doit pas dépasser 500 caractères");
            Content = content;
        }
    }
}
