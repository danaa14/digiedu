"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { account, databases } from "./appwrite"
import { ID } from "appwrite"

interface User {
  $id: string
  name: string
  email?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try fetching current session
    const getUser = async () => {
      try {
        const currentUser = await account.get()
        setUser(currentUser)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password)
      const currentUser = await account.get()
      setUser(currentUser)
      return true
    } catch (err) {
      console.error("Login error:", err)
      return false
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    try {
      await account.create(ID.unique(), email, password, name)
      await login(email, password)
      return true
    } catch (err) {
      console.error("Signup error:", err)
      return false
    }
  }

  const logout = async () => {
    await account.deleteSession("current")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
