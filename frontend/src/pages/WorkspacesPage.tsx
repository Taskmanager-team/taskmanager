import { Link } from 'react-router-dom'
import { useWorkspaces } from '../api/queries'

export function WorkspacesPage() {
  const { data, isPending, error } = useWorkspaces()

  if (isPending) return <p className="state">Chargement des workspaces...</p>
  if (error) return <p className="state state-error">{error.message}</p>

  return (
    <section>
      <h1>Mes workspaces</h1>
      <ul className="card-list">
        {data?.map((workspace) => (
          <li key={workspace.id} className="card">
            <Link to={`/workspaces/${workspace.id}`}>{workspace.name}</Link>
            <span className="meta">{workspace.myRole}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
