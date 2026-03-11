import { PERSONS, INITIAL_PROJECTS } from '../../data/mockProjects';
import { Project, Task, SubTask, Comment } from '../../types';

function getPersonName(id: string) {
  const p = PERSONS.find(x => x.id === id);
  return p ? p.name : id;
}

function flattenComments() {
  const rows: Array<{ date: string; employee: string; status: string; comment: string }> = [];
  INITIAL_PROJECTS.forEach((proj: Project) => {
    proj.tasks.forEach((task: Task) => {
      // Task-level comments
      task.comments.forEach((c: Comment) => {
        rows.push({
          date: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—',
          employee: getPersonName(c.authorId),
          status: task.status === 'completed' ? 'Completed' : 'Not Completed',
          comment: c.text,
        });
      });
      // Subtask-level comments
      task.subtasks.forEach((sub: SubTask) => {
        if (sub.incompleteReason) {
          rows.push({
            date: sub.completedAt ? new Date(sub.completedAt).toLocaleDateString('en-IN') : '—',
            employee: getPersonName(sub.assigneeId),
            status: sub.status === 'completed' ? 'Completed' : 'Not Completed',
            comment: sub.incompleteReason,
          });
        }
        sub.comments && sub.comments.forEach((c: Comment) => {
          rows.push({
            date: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—',
            employee: getPersonName(c.authorId),
            status: sub.status === 'completed' ? 'Completed' : 'Not Completed',
            comment: c.text,
          });
        });
      });
    });
  });
  return rows;
}

export default function CommentHistory() {
  const history = flattenComments();
  return (
    <div className="max-w-2xl mx-auto mt-10 card p-6">
      <h1 className="page-title">Comment / Reason History</h1>
      <table className="w-full mt-4">
        <thead>
          <tr>
            <th className="table-header">Date</th>
            <th className="table-header">Employee</th>
            <th className="table-header">Status</th>
            <th className="table-header">Comment</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h, i) => (
            <tr key={i} className="hover:bg-slate-50">
              <td className="table-cell">{h.date}</td>
              <td className="table-cell">{h.employee}</td>
              <td className="table-cell">{h.status}</td>
              <td className="table-cell">{h.comment}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}