import React from 'react'
import AdminDashboard from './pages/Home/admin/AdminDashboard'
import Navbar from './components/Layout/admin/Navbar'
import AdminEvents from './pages/Home/admin/AdminEvents'
import AdminLayout from './components/Layout/admin/AdminLayout'
import InternalEventCard from './components/Global/cards/InternalEventCard'

const App = () => {
  return (
    <div>
      {/* <AdminEvents /> */}
      <InternalEventCard />
    </div>
  )
}

export default App
