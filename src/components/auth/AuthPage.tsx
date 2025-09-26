import React, { useState } from 'react'
import LoginForm from './LoginForm'

export default function AuthPage(): React.ReactElement {
  const [isSignUp, setIsSignUp] = useState(false)

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
  }

  return <LoginForm onToggleMode={toggleMode} isSignUp={isSignUp} />
}
