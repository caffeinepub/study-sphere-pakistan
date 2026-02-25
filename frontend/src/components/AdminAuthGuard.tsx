import { useState, useEffect, type ReactNode } from 'react';
import { Lock, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { hashPassword } from '../utils/hashPassword';
import { useActor } from '../hooks/useActor';

const SESSION_KEY = 'adminAuthenticated';

interface AdminAuthGuardProps {
  children: ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { actor, isFetching: actorFetching } = useActor();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  });

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Re-check sessionStorage on mount (handles page refresh)
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifying) return;

    // Wait for actor to be ready
    if (!actor) {
      setError('Still connecting to the network. Please wait a moment and try again.');
      return;
    }

    setError('');
    setIsVerifying(true);

    try {
      // Pass the raw password directly to hashPassword — no trimming or transformation
      const hash = await hashPassword(password);
      const result = await actor.verifyAdminPassword(hash);

      if (result) {
        sessionStorage.setItem(SESSION_KEY, 'true');
        setIsAuthenticated(true);
      } else {
        setError('Incorrect password. Please try again.');
        setPassword('');
      }
    } catch (err) {
      console.error('Admin auth error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  const isLoading = isVerifying || actorFetching;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
          {/* Icon + Title */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Admin Access</h1>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              Enter the admin password to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-password" className="text-foreground">
                Password
              </Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter admin password"
                autoComplete="current-password"
                autoFocus
                disabled={isVerifying}
                className={error ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !password}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Verifying…
                </>
              ) : actorFetching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Connecting…
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          This area is restricted to authorized administrators only.
        </p>
      </div>
    </div>
  );
}
