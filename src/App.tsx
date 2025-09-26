import React from 'react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import TodoApp from '@/components/TodoApp'
import AuthPage from '@/components/auth/AuthPage'
import './App.css'

// 主应用组件，处理认证状态
function AppContent(): React.ReactElement {
  const { user, loading } = useAuth()

  // 显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-600 font-medium">加载中...</p>
        </div>
      </div>
    )
  }

  // 根据用户认证状态显示不同页面
  return user ? <TodoApp /> : <AuthPage />
}

// 根组件，提供认证上下文
function App(): React.ReactElement {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
