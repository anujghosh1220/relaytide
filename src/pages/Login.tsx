"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { AnimatedAuthBackground } from "@/components/auth/AnimatedAuthBackground";
import { Logo } from "@/components/ui/Logo";

export const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate("/");
    }
  };

  return (
    <section className="fixed inset-0 bg-background text-foreground">
      <AnimatedAuthBackground />

      {/* Header */}
      <header className="absolute left-0 right-0 top-0 flex items-center justify-between px-6 py-4 border-b border-border/50">
        <Logo className="h-8" />
      </header>

      {/* Centered Login Card */}
      <div className="h-full w-full grid place-items-center px-4">
        <Card className="card-animate w-full max-w-sm border-border bg-surface/70 backdrop-blur supports-[backdrop-filter]:bg-surface/60">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to manage your incident response
            </CardDescription>
          </CardHeader>

<CardContent className="grid gap-5">
            <form onSubmit={handleSubmit} className="grid gap-5">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 text-sm">
                  {error}
                </div>
              )}
              <div className="grid gap-2">
              <label htmlFor="email" className="text-muted-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="pl-10 bg-surface border-border text-foreground placeholder:text-subtle-foreground"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="password" className="text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-surface border-border text-foreground placeholder:text-subtle-foreground"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 focus:ring-2 bg-surface"
                />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            </form>
          </CardContent>

          <CardFooter className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
            <div>
              New to RelayTide?
              <Link to="/register" className="ml-1 text-primary hover:underline">
                Create an account
              </Link>
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-[10px] tracking-wide text-subtle-foreground transition-colors hover:text-muted-foreground"
            >
              relaytide.io
            </a>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
};

export default Login;