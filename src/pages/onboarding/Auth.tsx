import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Mail, Eye, EyeOff, Check, Loader2 } from "lucide-react";
import { triggerHaptic } from "@/hooks/use-haptics";
import { useAuth } from "@/hooks/use-auth";
import { useOnboarding } from "@/contexts/OnboardingContext";

type AuthMode = "landing" | "signup" | "signin" | "forgot";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp, signIn, resetPassword } = useAuth();
  const { setUserEmail, setIsGuestMode, setUserRole, setHasCompletedOnboarding } = useOnboarding();
  
  const initialMode = (location.state as { mode?: string })?.mode === "signin" ? "signin" : "landing";
  
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    triggerHaptic('light');
    if (mode === "landing") {
      navigate("/welcome");
    } else {
      setMode("landing");
      setError("");
    }
  };

  const handleContinueWithEmail = () => {
    triggerHaptic('light');
    setMode("signup");
  };

  const handleSignIn = () => {
    triggerHaptic('light');
    setMode("signin");
  };

  const handleForgotPassword = () => {
    triggerHaptic('light');
    setMode("forgot");
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const getErrorMessage = (error: Error): string => {
    const message = error.message.toLowerCase();
    
    if (message.includes('user already registered')) {
      return 'This email is already registered. Try signing in instead.';
    }
    if (message.includes('invalid login credentials')) {
      return 'Invalid email or password. Please try again.';
    }
    if (message.includes('email not confirmed')) {
      return 'Please check your email and confirm your account.';
    }
    if (message.includes('too many requests')) {
      return 'Too many attempts. Please wait a moment and try again.';
    }
    if (message.includes('password')) {
      return 'Password must be at least 6 characters.';
    }
    
    return error.message || 'An error occurred. Please try again.';
  };

  const handleSubmit = async () => {
    triggerHaptic('medium');
    setError("");

    if (!validateEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (mode === "forgot") {
      setIsLoading(true);
      const { error } = await resetPassword(email);
      setIsLoading(false);
      
      if (error) {
        setError(getErrorMessage(error));
        return;
      }
      
      setResetSent(true);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (mode === "signup" && !agreedToTerms) {
      setError("Please agree to the Terms and Privacy Policy.");
      return;
    }

    setIsLoading(true);

    if (mode === "signup") {
      const { error } = await signUp(email, password);
      setIsLoading(false);
      
      if (error) {
        setError(getErrorMessage(error));
        return;
      }
      
      // Save email to context
      setUserEmail(email);
      
      // Navigate to role selection on successful signup
      navigate("/role-select");
    } else if (mode === "signin") {
      const { error } = await signIn(email, password);
      setIsLoading(false);
      
      if (error) {
        setError(getErrorMessage(error));
        return;
      }
      
      // Save email to context
      setUserEmail(email);
      
      // Navigate to role selection (or home if onboarding complete)
      navigate("/role-select");
    }
  };

  const handleContinueAsGuest = () => {
    triggerHaptic('medium');
    setIsGuestMode(true);
    setUserRole('patient');
    setHasCompletedOnboarding(true);
  };

  const renderLanding = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-1 flex-col"
    >
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <h1 className="text-title-large text-foreground text-center">
          Welcome to TARVA
        </h1>
        <p className="mt-3 text-body text-muted-foreground text-center max-w-xs">
          Create an account to keep your schedule and history synced across devices.
        </p>
      </div>

      <div className="px-6 pb-10 pt-4 space-y-3">
        <motion.button
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-foreground py-4 text-background font-semibold opacity-50 cursor-not-allowed"
          disabled
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          Continue with Apple
        </motion.button>

        <motion.button
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background py-4 font-semibold text-foreground opacity-50 cursor-not-allowed"
          disabled
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </motion.button>

        <div className="flex items-center gap-4 py-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <motion.button
          onClick={handleContinueWithEmail}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background py-4 font-semibold text-foreground"
          whileTap={{ scale: 0.98 }}
        >
          <Mail className="h-5 w-5" />
          Continue with email
        </motion.button>

        <motion.button
          onClick={handleContinueAsGuest}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-secondary py-4 font-semibold text-foreground"
          whileTap={{ scale: 0.98 }}
        >
          Explore as guest
        </motion.button>

        <p className="text-center text-sm text-muted-foreground pt-2">
          Already have an account?{" "}
          <button onClick={handleSignIn} className="text-primary font-medium">
            Sign in
          </button>
        </p>
      </div>
    </motion.div>
  );

  const renderForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-1 flex-col px-6"
    >
      <div className="pt-8 pb-6">
        <h1 className="text-title-large text-foreground">
          {mode === "signup" && "Create your account"}
          {mode === "signin" && "Sign in"}
          {mode === "forgot" && "Reset password"}
        </h1>
        {mode === "forgot" && (
          <p className="mt-2 text-body text-muted-foreground">
            Enter your email and we'll send a reset link.
          </p>
        )}
      </div>

      {resetSent ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center py-12"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <Check className="h-8 w-8 text-success" />
          </div>
          <p className="mt-4 text-lg font-semibold text-foreground">Reset link sent</p>
          <p className="mt-2 text-sm text-muted-foreground text-center">
            Check your email for a link to reset your password.
          </p>
          <motion.button
            onClick={() => setMode("signin")}
            className="mt-8 btn-primary px-8"
            whileTap={{ scale: 0.98 }}
          >
            Back to sign in
          </motion.button>
        </motion.div>
      ) : (
        <>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-tarva mt-1.5"
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>

            {mode !== "forgot" && (
              <div>
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="relative mt-1.5">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-tarva pr-12"
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {mode === "signup" && (
                  <p className="mt-1.5 text-xs text-muted-foreground">At least 6 characters.</p>
                )}
              </div>
            )}

            {mode === "signup" && (
              <motion.button
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className="flex items-start gap-3 text-left"
                whileTap={{ scale: 0.99 }}
                disabled={isLoading}
              >
                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                  agreedToTerms ? "bg-primary border-primary" : "border-border"
                }`}>
                  {agreedToTerms && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className="text-sm text-muted-foreground">
                  I agree to the{" "}
                  <span className="text-primary">Terms</span> and{" "}
                  <span className="text-primary">Privacy Policy</span>
                </span>
              </motion.button>
            )}

            {mode === "signin" && (
              <button
                onClick={handleForgotPassword}
                className="text-sm text-primary font-medium"
                disabled={isLoading}
              >
                Forgot password?
              </button>
            )}

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-destructive"
              >
                {error}
              </motion.p>
            )}
          </div>

          <div className="mt-auto pb-10 pt-8">
            <motion.button
              onClick={handleSubmit}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2"
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {mode === "signup" && "Create account"}
                  {mode === "signin" && "Sign in"}
                  {mode === "forgot" && "Send link"}
                </>
              )}
            </motion.button>

            <button
              onClick={handleBack}
              className="mt-4 w-full text-center text-sm font-medium text-muted-foreground"
              disabled={isLoading}
            >
              Back
            </button>
          </div>
        </>
      )}
    </motion.div>
  );

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <motion.button
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"
          whileTap={{ scale: 0.9 }}
          disabled={isLoading}
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </motion.button>
        <div />
      </div>

      <AnimatePresence mode="wait">
        {mode === "landing" ? renderLanding() : renderForm()}
      </AnimatePresence>
    </div>
  );
}
