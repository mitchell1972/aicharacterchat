import React, { useState, useEffect } from 'react'
import QRCode from 'react-qr-code'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Badge } from '../components/ui/badge'
import { X, Copy, Check, Download, Share2, Smartphone, Globe, TestTube } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function QRCodeModal({ isOpen, onClose }: QRCodeModalProps) {
  const { user, profile, isDemoMode } = useAuth()
  const [customText, setCustomText] = useState('')
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden' // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  // Generate different QR code values
  const currentUrl = window.location.href
  const profileData = JSON.stringify({
    name: profile?.full_name || 'User',
    email: user?.email,
    platform: 'AI Character Chat',
    demo: isDemoMode
  })

  const qrValues = {
    profile: profileData,
    website: currentUrl,
    custom: customText || 'Hello from AI Character Chat!'
  }

  const qrDescriptions = {
    profile: 'Share your profile information',
    website: 'Share this website URL',
    custom: 'Share your custom message'
  }

  const currentQRValue = qrValues[activeTab as keyof typeof qrValues]

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentQRValue)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `qrcode-${activeTab}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <Card className="w-full max-w-lg bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="space-y-1">
            <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
              QR Code Generator
            </CardTitle>
            <CardDescription>
              Generate QR codes to share information instantly
            </CardDescription>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0 flex-shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Demo Mode Banner */}
          {isDemoMode && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <TestTube className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-800 font-medium">Demo Mode Active</span>
              </div>
              <p className="text-xs text-amber-700 mt-1">
                QR codes generated in demo mode contain sample data
              </p>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="text-xs">
                <Smartphone className="w-3 h-3 mr-1" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="website" className="text-xs">
                <Globe className="w-3 h-3 mr-1" />
                Website
              </TabsTrigger>
              <TabsTrigger value="custom" className="text-xs">
                <Share2 className="w-3 h-3 mr-1" />
                Custom
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-4 space-y-4">
              {/* QR Code Display */}
              <div className="bg-white p-6 rounded-lg border-2 border-gray-100 text-center">
                <QRCode
                  id="qr-code-svg"
                  value={currentQRValue}
                  size={200}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  viewBox={`0 0 200 200`}
                />
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-medium text-gray-800">
                    {qrDescriptions[activeTab as keyof typeof qrDescriptions]}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} QR Code
                  </Badge>
                </div>
              </div>

              {/* Tab Content */}
              <TabsContent value="profile" className="space-y-3 mt-0">
                <div className="bg-gray-50/80 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Profile Information:</p>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p><strong>Name:</strong> {profile?.full_name || 'User'}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Platform:</strong> AI Character Chat</p>
                    {isDemoMode && <p><strong>Mode:</strong> Demo</p>}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="website" className="space-y-3 mt-0">
                <div className="bg-gray-50/80 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Website URL:</p>
                  <p className="text-xs text-gray-600 break-all">{currentUrl}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="custom" className="space-y-3 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="custom-text" className="text-sm font-medium">Custom Message</Label>
                  <Input
                    id="custom-text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Enter your custom message..."
                    className="text-sm"
                  />
                </div>
              </TabsContent>

              {/* Actions */}
              <div className="flex items-center justify-center space-x-2">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy Data
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download PNG
                </Button>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50/80 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-1">
                  📱 How to use:
                </p>
                <p className="text-xs text-blue-700">
                  Scan this QR code with any QR code reader app or camera to share the information instantly.
                </p>
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}