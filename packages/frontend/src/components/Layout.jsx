import { Outlet } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import Sidebar from './Sidebar'
import ProtectedRoute from './ProtectedRoute'
import './Layout.css'

function Layout() {
  return (
    <ProtectedRoute>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Container fluid>
            <Outlet />
          </Container>
        </main>
      </div>
    </ProtectedRoute>
  )
}

export default Layout