import { Outlet } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import Sidebar from './Sidebar'
import './Layout.css'

function Layout() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Container fluid>
          <Outlet />
        </Container>
      </main>
    </div>
  )
}

export default Layout