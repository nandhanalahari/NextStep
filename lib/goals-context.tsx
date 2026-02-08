"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useAuth } from "@/lib/auth-context"

export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  completionSummary?: string
  /** ISO date string (YYYY-MM-DD) for when the task is due */
  dueDate?: string
}

export interface GoalReflection {
  beginningThoughts?: string
  endThoughts?: string
  satisfaction?: number
}

export interface Goal {
  id: string
  title: string
  description: string
  tasks: Task[]
  createdAt: string
  completed: boolean
  reflection?: GoalReflection
}

interface GoalsContextType {
  goals: Goal[]
  loading: boolean
  addGoal: (goal: Goal) => Promise<void>
  toggleTask: (goalId: string, taskId: string) => Promise<void>
  completeTask: (goalId: string, taskId: string, completionSummary: string) => Promise<void>
  updateGoalReflection: (goalId: string, reflection: GoalReflection) => Promise<void>
  addTask: (goalId: string, afterIndex: number, title: string, description: string) => Promise<void>
  setTaskDueDate: (goalId: string, taskId: string, dueDate: string | null) => Promise<void>
  deleteTask: (goalId: string, taskId: string) => Promise<void>
  deleteGoal: (goalId: string) => Promise<void>
  refetch: () => Promise<void>
  getGoal: (id: string) => Goal | undefined
  activeGoals: Goal[]
  inProgressGoals: Goal[]
  completedGoals: Goal[]
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined)

export function GoalsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!user) {
      setGoals([])
      setLoading(false)
      return
    }
    try {
      // Migrate previous goals from localStorage to MongoDB (one-time per user)
      const stored = typeof window !== "undefined" ? localStorage.getItem("nextstep-goals") : null
      if (stored) {
        try {
          const legacyGoals: Goal[] = JSON.parse(stored)
          for (const goal of legacyGoals) {
            await fetch("/api/goals", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(goal),
            })
          }
          localStorage.removeItem("nextstep-goals")
        } catch {
          // Ignore migration errors
        }
      }

      const res = await fetch("/api/goals")
      if (res.ok) {
        const data = await res.json()
        setGoals(data.goals ?? [])
      } else {
        setGoals([])
      }
    } catch {
      setGoals([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    setLoading(true)
    refetch()
  }, [refetch])

  const addGoal = useCallback(
    async (goal: Goal) => {
      try {
        const res = await fetch("/api/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(goal),
        })
        if (!res.ok) throw new Error("Failed to create goal")
        setGoals((prev) => [goal, ...prev])
      } catch (err) {
        console.error("addGoal error:", err)
        throw err
      }
    },
    []
  )

  const updateGoalOnServer = useCallback(async (goal: Goal) => {
    const res = await fetch(`/api/goals/${goal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: goal.title,
        description: goal.description,
        tasks: goal.tasks,
        createdAt: goal.createdAt,
        completed: goal.completed,
        reflection: goal.reflection,
      }),
    })
    if (!res.ok) throw new Error("Failed to update goal")
    return res
  }, [])

  const toggleTask = useCallback(
    async (goalId: string, taskId: string) => {
      const goal = goals.find((g) => g.id === goalId)
      if (!goal) return
      const updatedTasks = goal.tasks.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed, completionSummary: task.completed ? undefined : task.completionSummary }
          : task
      )
      const allDone = updatedTasks.every((t) => t.completed)
      const updated: Goal = {
        ...goal,
        tasks: updatedTasks,
        completed: allDone,
        reflection: allDone ? goal.reflection : undefined,
      }
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)))
      try {
        await updateGoalOnServer(updated)
      } catch (err) {
        console.error("toggleTask error:", err)
        setGoals((prev) => prev.map((g) => (g.id === goalId ? goal : g)))
      }
    },
    [goals, updateGoalOnServer]
  )

  const completeTask = useCallback(
    async (goalId: string, taskId: string, completionSummary: string) => {
      const goal = goals.find((g) => g.id === goalId)
      if (!goal) return
      const updatedTasks = goal.tasks.map((task) =>
        task.id === taskId ? { ...task, completed: true, completionSummary: completionSummary.trim() } : task
      )
      const allDone = updatedTasks.every((t) => t.completed)
      const updated: Goal = { ...goal, tasks: updatedTasks, completed: allDone }
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)))
      try {
        await updateGoalOnServer(updated)
      } catch (err) {
        console.error("completeTask error:", err)
        setGoals((prev) => prev.map((g) => (g.id === goalId ? goal : g)))
      }
    },
    [goals, updateGoalOnServer]
  )

  const updateGoalReflection = useCallback(
    async (goalId: string, reflection: GoalReflection) => {
      const goal = goals.find((g) => g.id === goalId)
      if (!goal) return
      const updated: Goal = { ...goal, reflection }
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)))
      try {
        await updateGoalOnServer(updated)
      } catch (err) {
        console.error("updateGoalReflection error:", err)
      }
    },
    [goals, updateGoalOnServer]
  )

  const addTask = useCallback(
    async (goalId: string, afterIndex: number, title: string, description: string) => {
      const goal = goals.find((g) => g.id === goalId)
      if (!goal) return
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: title.trim(),
        description: description.trim(),
        completed: false,
      }
      const next = [...goal.tasks]
      next.splice(afterIndex + 1, 0, newTask)
      const updated: Goal = { ...goal, tasks: next }
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)))
      try {
        await updateGoalOnServer(updated)
      } catch (err) {
        console.error("addTask error:", err)
        setGoals((prev) => prev.map((g) => (g.id === goalId ? goal : g)))
      }
    },
    [goals, updateGoalOnServer]
  )

  const deleteGoalById = useCallback(
    async (goalId: string) => {
      setGoals((prev) => prev.filter((g) => g.id !== goalId))
      try {
        const res = await fetch(`/api/goals/${goalId}`, { method: "DELETE" })
        if (!res.ok) throw new Error("Failed to delete goal")
      } catch (err) {
        console.error("deleteGoal error:", err)
        await refetch()
      }
    },
    [refetch]
  )

  const deleteTask = useCallback(
    async (goalId: string, taskId: string) => {
      const goal = goals.find((g) => g.id === goalId)
      if (!goal) return
      const updatedTasks = goal.tasks.filter((t) => t.id !== taskId)
      if (updatedTasks.length === 0) {
        await deleteGoalById(goalId)
        return
      }
      const allDone = updatedTasks.every((t) => t.completed)
      const updated: Goal = {
        ...goal,
        tasks: updatedTasks,
        completed: allDone,
        reflection: allDone ? goal.reflection : undefined,
      }
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)))
      try {
        await updateGoalOnServer(updated)
      } catch (err) {
        console.error("deleteTask error:", err)
        setGoals((prev) => prev.map((g) => (g.id === goalId ? goal : g)))
      }
    },
    [goals, updateGoalOnServer, deleteGoalById]
  )

  const setTaskDueDate = useCallback(
    async (goalId: string, taskId: string, dueDate: string | null) => {
      const goal = goals.find((g) => g.id === goalId)
      if (!goal) return
      const updatedTasks = goal.tasks.map((task) =>
        task.id === taskId ? { ...task, dueDate: dueDate ?? undefined } : task
      )
      const updated: Goal = { ...goal, tasks: updatedTasks }
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)))
      try {
        await updateGoalOnServer(updated)
      } catch (err) {
        console.error("setTaskDueDate error:", err)
        setGoals((prev) => prev.map((g) => (g.id === goalId ? goal : g)))
      }
    },
    [goals, updateGoalOnServer]
  )

  const deleteGoal = deleteGoalById

  const getGoal = useCallback(
    (id: string) => goals.find((g) => g.id === id),
    [goals]
  )

  const activeGoals = goals.filter((g) => !g.completed)
  const inProgressGoals = goals.filter((g) => g.tasks.some((t) => t.completed) && !g.completed)
  const completedGoals = goals.filter((g) => g.completed)

  return (
    <GoalsContext.Provider
      value={{
        goals,
        loading,
        addGoal,
        toggleTask,
        completeTask,
        updateGoalReflection,
        addTask,
        setTaskDueDate,
        deleteTask,
        deleteGoal,
        refetch,
        getGoal,
        activeGoals,
        inProgressGoals,
        completedGoals,
      }}
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
