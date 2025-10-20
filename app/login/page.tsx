"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleDemoMode = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/demo", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Demo login failed");
      }

      router.push("/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Demo login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Session cookie is set by the server
      router.push("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Session cookie is set by the server
      router.push("/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registration failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = isRegistering ? handleRegister : handleLogin;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold">Progress Tracker</CardTitle>
          <CardDescription>
            Track your personal progress and build streaks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {isRegistering && (
              <div>
                <label className="text-sm font-medium">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading
                ? isRegistering
                  ? "Creating account..."
                  : "Signing in..."
                : isRegistering
                ? "Create Account"
                : "Sign in"}
            </Button>
          </form>
          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError("");
              }}
              className="w-full text-sm text-muted-foreground hover:text-foreground"
            >
              {isRegistering
                ? "Already have an account? Sign in"
                : "Don't have an account? Register"}
            </button>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground text-center mb-2">
                Or try demo mode:
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                size="lg"
                disabled={loading}
                onClick={handleDemoMode}
              >
                {loading ? "Loading..." : "Try Demo"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
