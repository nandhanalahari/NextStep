"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Zap, ArrowRight } from "lucide-react"
import { toast } from "sonner"

export default function GetStartedPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      setStep(2)
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Something went wrong")
        return
      }
      router.push("/dashboard")
      router.refresh()
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[150px]" />
        <div className="absolute right-1/4 top-1/4 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[100px]" />
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(160 84% 44% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(160 84% 44% / 0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-bold text-foreground">NextStep</span>
        </div>

        {/* Card with green glow */}
        <div className="relative">
          {/* Green glow effect - outer */}
          <div className="absolute -inset-1.5 rounded-2xl bg-primary/20 blur-xl" />
          <div className="absolute -inset-0.5 rounded-2xl bg-primary/10 blur-md" />

          <div className="relative rounded-2xl border border-primary/20 bg-card p-8">
            {/* Progress indicator */}
            <div className="mb-6 flex items-center gap-2">
              <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${step >= 1 ? "bg-primary" : "bg-border"}`} />
              <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${step >= 2 ? "bg-primary" : "bg-border"}`} />
            </div>

            <div className="mb-6 text-center">
              <h1 className="font-display text-2xl font-bold text-foreground">
                {step === 1 ? "Create your account" : "Almost there"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {step === 1
                  ? "Start turning goals into daily wins"
                  : "Set your password to secure your account"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {step === 1 ? (
                <>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="name" className="text-sm text-foreground">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border-border/50 bg-background/50 text-foreground placeholder:text-muted-foreground focus:border-primary/50"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email" className="text-sm text-foreground">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-border/50 bg-background/50 text-foreground placeholder:text-muted-foreground focus:border-primary/50"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-medium group"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="password" className="text-sm text-foreground">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-border/50 bg-background/50 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password strength */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          password.length >= i * 2
                            ? password.length >= 8
                              ? "bg-primary"
                              : "bg-yellow-500"
                            : "bg-border"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="h-11 flex-1 border-border/50 bg-transparent text-foreground hover:bg-secondary"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="h-11 flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-medium disabled:opacity-70"
                    >
                      {loading ? "Creating…" : "Create Account"}
                    </Button>
                  </div>
                </>
              )}
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Trust signals */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span>Free to start</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
          <span>No credit card</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
          <span>Cancel anytime</span>
        </div>
      </div>
    </div>
  )
}
