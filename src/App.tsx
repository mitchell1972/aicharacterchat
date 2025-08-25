import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import ChatPage from './pages/ChatPage'
import QRCodeModal from './components/QRCodeModal'
import { Character } from './lib/supabase'
import './index.css'

function AppContent() {
  const { user, loading } = useAuth()
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)

  const handleViewQR = () => {
    setShowQRModal(true)
  }

  const handleCloseQR = () => {
    setShowQRModal(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-2xl mx-auto animate-pulse"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route 
            path="/auth" 
            element={user ? <Navigate to="/" replace /> : <AuthPage />} 
          />
          <Route 
            path="/" 
            element={
              user ? (
                <Dashboard 
                  onViewQR={handleViewQR}
                />
              ) : (
                <Navigate to="/auth" replace />
              )
            } 
          />
          <Route 
            path="/chat/:characterId" 
            element={
              user ? (
                <ChatPage onViewQR={handleViewQR} />
              ) : (
                <Navigate to="/auth" replace />
              )
            } 
          />
          <Route path="*" element={<Navigate to={user ? "/" : "/auth"} replace />} />
        </Routes>
        
        {/* QR Code Modal */}
        <QRCodeModal 
          isOpen={showQRModal} 
          onClose={handleCloseQR} 
        />
      </div>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App