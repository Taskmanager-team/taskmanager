import { NavLink, Outlet } from 'react-router-dom';
import { USE_MOCKS } from '../api/config';

/** Cadre commun a toutes les pages : le contenu de la route s'affiche dans <Outlet />. */
export function Layout() {
  return (
    <div className="layout">
      <header className="layout-header">
        <NavLink to="/" className="brand">
          TaskManager
        </NavLink>
        <span className={USE_MOCKS ? 'badge badge-mock' : 'badge badge-live'}>
          {USE_MOCKS ? 'Donnees mockees (MSW)' : 'API reelle'}
        </span>
      </header>

      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}
