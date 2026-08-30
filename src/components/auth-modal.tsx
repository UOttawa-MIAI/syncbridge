'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mail, KeyRound, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, X, ShieldCheck, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { email: string }) => void;
  initialEmail?: string;
  contextMessage?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmail = '',
  contextMessage = 'Sign in with your authorized @uottawa.ca email to broadcast announcements to the MIAI Discord.',
}) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      if (initialEmail) setEmail(initialEmail);
    }
  }, [isOpen, initialEmail]);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Auto-focus OTP input when switching to step 2
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpInputRef.current?.focus(), 150);
    }
  }, [step]);

  if (!isOpen) return null;

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSimulatedCode(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Please enter your university email address.');
      return;
    }

    if (!cleanEmail.endsWith('@uottawa.ca') && !cleanEmail.endsWith('@alumni.uottawa.ca')) {
      setErrorMessage('Please enter an official @uottawa.ca email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send verification code.');
      }

      setStep('otp');
      setCountdown(60);
      if (data.simulatedCode) {
        setSimulatedCode(data.simulatedCode);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const cleanCode = otp.trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setErrorMessage('Please enter the full 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: cleanCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid verification code.');
      }

      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header with uOttawa Accent */}
        <div className="bg-gradient-to-r from-garnet-900 via-garnet-800 to-slate-900 px-6 py-5 border-b border-garnet-700/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base tracking-tight">Faculty Authorization</h3>
              <p className="text-xs text-rose-200">University of Ottawa MIAI Portal</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            {contextMessage}
          </p>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 flex items-start space-x-2 text-xs text-rose-200 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Dev Simulator Helper Banner */}
          {simulatedCode && (
            <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800/80 flex items-start space-x-2 text-xs text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Dev Test Simulation Code:</span>
                <span className="font-mono text-base font-bold tracking-widest text-amber-300">{simulatedCode}</span>
                <p className="text-[11px] text-amber-400/80 mt-0.5">(Live Resend API key not configured yet)</p>
              </div>
            </div>
          )}

          {/* Step 1: Request OTP */}
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  uOttawa Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. professor@uottawa.ca"
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-garnet-500 focus:border-transparent transition"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Must end in <code className="text-slate-400 font-mono">@uottawa.ca</code> and be on the faculty whitelist.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-garnet-700 hover:bg-garnet-600 active:bg-garnet-800 text-white font-medium text-sm flex items-center justify-center space-x-2 shadow-lg shadow-garnet-900/30 transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Whitelist...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: Enter 6-Digit OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    6-Digit Security Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setErrorMessage(null);
                    }}
                    className="text-[11px] text-garnet-400 hover:text-garnet-300 underline"
                  >
                    Change email
                  </button>
                </div>

                <p className="text-xs text-slate-400">
                  Sent to <strong className="text-slate-200 font-mono">{email}</strong>
                </p>

                <div className="relative pt-1">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 mt-0.5" />
                  <input
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setOtp(val);
                      if (val.length === 6) {
                        // Auto-submit when 6 digits are reached
                        setTimeout(() => handleVerifyOtp(), 50);
                      }
                    }}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-lg font-mono tracking-widest text-center text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-garnet-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Didn't receive the code?</span>
                <button
                  type="button"
                  disabled={countdown > 0 || isLoading}
                  onClick={() => handleSendOtp()}
                  className="font-medium text-garnet-400 hover:text-garnet-300 disabled:text-slate-600 disabled:cursor-not-allowed transition flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full py-2.5 px-4 rounded-xl bg-garnet-700 hover:bg-garnet-600 active:bg-garnet-800 text-white font-medium text-sm flex items-center justify-center space-x-2 shadow-lg shadow-garnet-900/30 transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
