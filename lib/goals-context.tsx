"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
}

export interface Goal {
  id: string
  title: string
  description: string
  tasks: Task[]
  createdAt: string
  completed: boolean
}

interface GoalsContextType {
  goals: Goal[]
  addGoal: (goal: Goal) => void
  toggleTask: (goalId: string, taskId: string) => void
  addTask: (goalId: string, afterIndex: number, title: string) => void
  deleteGoal: (goalId: string) => void
  getGoal: (id: string) => Goal | undefined
  activeGoals: Goal[]
  completedGoals: Goal[]
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined)

export function GoalsProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("nextstep-goals")
    if (stored) {
      try {
        setGoals(JSON.parse(stored))
      } catch {
        // ignore parse errors
      }
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("nextstep-goals", JSON.stringify(goals))
    }
  }, [goals, loaded])

  const addGoal = useCallback((goal: Goal) => {
    setGoals((prev) => [goal, ...prev])
  }, [])

  const toggleTask = useCallback((goalId: string, taskId: string) => {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id !== goalId) return goal
        const updatedTasks = goal.tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
        const allDone = updatedTasks.every((t) => t.completed)
        return { ...goal, tasks: updatedTasks, completed: allDone }
      })
    )
  }, [])

  const addTask = useCallback((goalId: string, afterIndex: number, title: string) => {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id !== goalId) return goal
        const newTask: Task = {
          id: crypto.randomUUID(),
          title: title.trim(),
          description: "",
          completed: false,
        }
        const next = [...goal.tasks]
        next.splice(afterIndex + 1, 0, newTask)
        return { ...goal, tasks: next }
      })
    )
  }, [])

  const deleteGoal = useCallback((goalId: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId))
  }, [])

  const getGoal = useCallback(
    (id: string) => goals.find((g) => g.id === id),
    [goals]
  )

  const activeGoals = goals.filter((g) => !g.completed)
  const completedGoals = goals.filter((g) => g.completed)

  return (
    <GoalsContext.Provider
      value={{ goals, addGoal, toggleTask, addTask, deleteGoal, getGoal, activeGoals, completedGoals }}
    >
      {children}
    </GoalsContext.Provider>
  )
}

export function useGoals() {
  const context = useContext(GoalsContext)
  if (!context) {
    throw new Error("useGoals must be used within a GoalsProvider")
  }
  return context
}
