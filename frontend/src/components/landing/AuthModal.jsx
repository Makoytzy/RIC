import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import {
  X,
  LogIn,
  Users,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Fingerprint,
  CheckCircle2
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth.js';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import Toast from '../common/Toast.jsx';

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: -12
  },

  visible: {
    opacity: 1,
    scale: 1,
    y: 0
  }
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthModal({
  mode,
  onClose,
  onSwitchMode
}) {
  const navigate = useNavigate();

  const {
    signIn,
    signUp,
    verifyEmployeeCode
  } = useAuth();

  // ============================================================
  // FORM STATE
  // ============================================================

  const [form, setForm] = useState({
    employeeCode: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // ============================================================
  // UI STATE
  // ============================================================

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);

  const [employeeVerified, setEmployeeVerified] = useState(false);
  const [employeeInfo, setEmployeeInfo] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // ============================================================
  // TOAST HELPER FUNCTION
  // ============================================================

  const showToast = (type, message, title = '') => {
    setToast({
      visible: true,
      type,
      title,
      message
    });
  };

  const hideToast = () => {
    setToast((prev) => ({
      ...prev,
      visible: false
    }));
  };

  // ============================================================
  // RESET FORM WHEN MODE CHANGES
  // ============================================================

  useEffect(() => {
    setForm({
      employeeCode: '',
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });

    setErrors({});
    hideToast();

    setLoading(false);
    setVerifyingCode(false);

    setEmployeeVerified(false);
    setEmployeeInfo(null);

    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [mode]);

  // ============================================================
  // HANDLE FORM INPUT
  // ============================================================

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));

    // Remove error for current field
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      const next = {
        ...prev
      };

      delete next[field];

      return next;
    });

    // Clear status when user starts editing
    if (toast.visible) {
      hideToast();
    }
  };

  // ============================================================
  // VERIFY EMPLOYEE / BIOMETRIC CODE
  // ============================================================

  const handleVerifyEmployeeCode = async () => {
    const code = form.employeeCode.trim();

    // ----------------------------------------------------------
    // BASIC VALIDATION
    // ----------------------------------------------------------

    if (!code) {
      setErrors({
        employeeCode:
          'Enter your employee biometric code.'
      });

      return;
    }

    setErrors({});
    hideToast();
    setEmployeeInfo(null);
    setEmployeeVerified(false);

    setVerifyingCode(true);

    try {
      // --------------------------------------------------------
      // VERIFY CODE THROUGH AUTH CONTEXT
      // --------------------------------------------------------

      const employee = await verifyEmployeeCode(code);

      // --------------------------------------------------------
      // INVALID CODE
      // --------------------------------------------------------

      if (!employee) {
        setEmployeeVerified(false);
        setEmployeeInfo(null);

        setErrors({
          employeeCode:
            'Invalid employee code or this code has already been used.'
        });

        return;
      }

      // --------------------------------------------------------
      // SUCCESS
      // --------------------------------------------------------

      setEmployeeVerified(true);
      setEmployeeInfo(employee);

      // Automatically populate employee information
      setForm((prev) => ({
        ...prev,

        employeeCode:
          employee.employee_code || code,

        fullName:
          employee.full_name || '',

        email:
          employee.email || ''
      }));

      showToast(
        'success',
        'Employee code verified successfully!',
        'Employee Code Verified'
      );

    } catch (error) {
      console.error(
        'Employee code verification error:',
        error
      );

      setEmployeeVerified(false);
      setEmployeeInfo(null);

      setErrors({
        employeeCode:
          error?.message ||
          'Unable to verify employee code.'
      });

    } finally {
      setVerifyingCode(false);
    }
  };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validate = () => {
    const nextErrors = {};

    // ==========================================================
    // SIGNUP
    // ==========================================================

    if (mode === 'signup') {

      // --------------------------------------------------------
      // EMPLOYEE CODE
      // --------------------------------------------------------

      if (!form.employeeCode.trim()) {
        nextErrors.employeeCode =
          'Enter your employee biometric code.';
      }

      if (!employeeVerified) {
        nextErrors.employeeCode =
          'Verify your employee code before creating an account.';
      }

      // --------------------------------------------------------
      // FULL NAME
      // --------------------------------------------------------

      if (
        !form.fullName ||
        form.fullName.trim().length < 2
      ) {
        nextErrors.fullName =
          'Enter your full name.';
      }
    }

    // ==========================================================
    // EMAIL
    // ==========================================================

    if (
      !form.email ||
      !emailPattern.test(form.email)
    ) {
      nextErrors.email =
        'Enter a valid email address.';
    }

    // ==========================================================
    // PASSWORD
    // ==========================================================

    if (
      !form.password ||
      form.password.length < 8
    ) {
      nextErrors.password =
        'Password must be at least 8 characters.';
    }

    // ==========================================================
    // CONFIRM PASSWORD
    // ==========================================================

    if (mode === 'signup') {

      if (
        !form.confirmPassword
      ) {
        nextErrors.confirmPassword =
          'Confirm your password.';
      }

      else if (
        form.password !==
        form.confirmPassword
      ) {
        nextErrors.confirmPassword =
          'Passwords do not match.';
      }
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };

  // ============================================================
  // SUBMIT FORM
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    hideToast();

    // ----------------------------------------------------------
    // VALIDATE
    // ----------------------------------------------------------

    if (!validate()) {
      showToast(
        'error',
        'Please fix the errors in the form before submitting.',
        'Validation Error'
      );
      return;
    }

    setLoading(true);

    try {

      // ========================================================
      // LOGIN
      // ========================================================

      if (mode === 'login') {

        await signIn({
          email: form.email.trim(),
          password: form.password
        });

        showToast(
          'success',
          'You have successfully logged in. Redirecting to dashboard...',
          'Login Successful'
        );

        onClose();

        navigate('/dashboard');

        return;
      }

      // ========================================================
      // SIGN UP
      // ========================================================

      await signUp({
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),

        // IMPORTANT:
        // Position is NOT sent from the frontend.
        // It must come from the verified employee record.
        employeeCode:
          form.employeeCode.trim()
      });

      // --------------------------------------------------------
      // SUCCESS
      // --------------------------------------------------------

      showToast(
        'success',
        'Account created successfully! Please verify your email to sign in.',
        'Account Created'
      );

      // --------------------------------------------------------
      // RESET FORM
      // --------------------------------------------------------

      setForm({
        employeeCode: '',
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });

      setEmployeeVerified(false);
      setEmployeeInfo(null);

      // --------------------------------------------------------
      // SWITCH TO LOGIN
      // --------------------------------------------------------

      setTimeout(() => {
        hideToast();
        onSwitchMode('login');
      }, 3000);

    } catch (error) {
      console.error(
        'Authentication error:',
        error
      );

      showToast(
        'error',
        error?.message || 'Something went wrong. Please try again.',
        'Authentication Error'
      );

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      {/* ====================================================
          TOAST NOTIFICATION - POSITIONED OUTSIDE MODAL
      ==================================================== */}
      
      <Toast
        type={toast.type}
        title={toast.title}
        message={toast.message}
        visible={toast.visible}
        onClose={hideToast}
        duration={5000}
        pauseOnHover={true}
        position="top-right"
      />

      <AnimatePresence>
        {mode && (

        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-4 backdrop-blur-xl overflow-y-auto"
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
        >

          {/* ====================================================
              MODAL
          ==================================================== */}

          <motion.div
            className="relative w-full max-w-[380px] my-4 overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-3 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-3xl ring-1 ring-white/10"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{
              duration: 0.2,
              ease: 'easeOut'
            }}
          >

            {/* ==================================================
                CLOSE BUTTON - Only show in login mode
            =================================================== */}

            {mode === 'login' && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-slate-200 shadow-sm backdrop-blur-xl transition hover:bg-white/20 hover:text-slate-50"
              >
                <X size={16} />
              </button>
            )}

            <div className="pb-1.5">

              {/* ==================================================
                  HEADER
              =================================================== */}

              <div className="flex flex-col items-center gap-0.5 pb-2 text-center">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white shadow-xl shadow-slate-950/20 ring-1 ring-white/20 backdrop-blur-xl">

                  {mode === 'signup' ? (
                    <Fingerprint size={20} />
                  ) : (
                    <LogIn size={16} />
                  )}

                </div>

                <h2 className="text-lg font-extrabold tracking-tight text-white">

                  {mode === 'login'
                    ? 'Welcome Back'
                    : 'Employee Sign Up'}

                </h2>

                {mode === 'signup' && (

                  <p className="max-w-[280px] text-[10px] leading-3 text-slate-300 mb-1">
                    Enter your assigned employee biometric code to register your account.
                  </p>

                )}

              </div>

              {/* ==================================================
                  FORM
              =================================================== */}

              <form
                onSubmit={handleSubmit}
                className="space-y-2"
              >

                {/* =================================================
                    EMPLOYEE BIOMETRIC CODE
                ================================================== */}

                {mode === 'signup' && (

                  <div className="flex flex-col gap-0.5">

                    <label
                      htmlFor="employeeCode"
                      className="text-xs font-medium text-white"
                    >
                      Employee Biometric Code
                    </label>

                    <div className="flex gap-2">

                      <div className="min-w-0 flex-1">

                        <Input
                          id="employeeCode"
                          label=""
                          type="text"
                          icon={Fingerprint}
                          placeholder="e.g. EMP-10001"
                          value={form.employeeCode}
                          disabled={
                            employeeVerified ||
                            verifyingCode
                          }
                          onChange={(e) => {

                            handleChange(
                              'employeeCode',
                              e.target.value.toUpperCase()
                            );

                            setEmployeeVerified(
                              false
                            );

                            setEmployeeInfo(
                              null
                            );

                          }}
                          error={
                            errors.employeeCode
                          }
                        />

                      </div>

                      {!employeeVerified && (

                        <button
                          type="button"
                          onClick={
                            handleVerifyEmployeeCode
                          }
                          disabled={
                            verifyingCode ||
                            !form.employeeCode.trim()
                          }
                          className="mt-[1px] h-[40px] shrink-0 rounded-2xl bg-red-600 px-2.5 text-[11px] font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                          {verifyingCode
                            ? 'Checking...'
                            : 'Verify'}

                        </button>

                      )}

                    </div>

                    {/* ============================================
                        VERIFIED EMPLOYEE
                    ============================================= */}

                    {employeeVerified &&
                      employeeInfo && (

                        <div className="mt-0.5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2">

                          <div className="flex items-center gap-1.5 mb-1.5">

                            <CheckCircle2
                              size={14}
                              className="text-emerald-400"
                            />

                            <p className="text-xs font-semibold text-emerald-300">
                              Employee Verified
                            </p>

                          </div>

                          <div className="space-y-1">

                            <div className="flex items-baseline gap-1.5">
                              <span className="text-[10px] text-emerald-200/70 font-medium">
                                Employee:
                              </span>
                              <span className="text-xs font-semibold text-white">
                                {employeeInfo.full_name}
                              </span>
                            </div>

                            <div className="flex items-baseline gap-1.5">
                              <span className="text-[10px] text-emerald-200/70 font-medium">
                                Position:
                              </span>
                              <span className="text-xs font-semibold text-white">
                                {employeeInfo.position}
                              </span>
                            </div>

                          </div>

                        </div>

                      )}

                  </div>

                )}

                {/* =================================================
                    FULL NAME
                ================================================== */}

                {mode === 'signup' && (

                  <Input
                    id="fullName"
                    label="Full Name"
                    icon={Users}
                    placeholder="Enter your full name"
                    value={form.fullName}
                    disabled={
                      employeeVerified
                    }
                    className={
                      employeeVerified
                        ? '!text-slate-500'
                        : ''
                    }
                    onChange={(e) =>
                      handleChange(
                        'fullName',
                        e.target.value
                      )
                    }
                    error={
                      errors.fullName
                    }
                  />

                )}

                {/* =================================================
                    EMAIL
                ================================================== */}

                <Input
                  id="email"
                  label="Email Address"
                  type="email"
                  icon={Mail}
                  placeholder="you@example.com"
                  value={form.email}
                  disabled={mode === 'signup' && employeeVerified}
                  readOnly={mode === 'signup' && employeeVerified}
                  className={
                    mode === 'signup' && employeeVerified
                      ? '!bg-slate-100/50 !text-slate-600 !cursor-not-allowed'
                      : ''
                  }
                  onChange={(e) =>
                    handleChange(
                      'email',
                      e.target.value
                    )
                  }
                  error={errors.email}
                />

                {/* =================================================
                    PASSWORD
                ================================================== */}

                <Input
                  id="password"
                  label="Password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  icon={Lock}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) =>
                    handleChange(
                      'password',
                      e.target.value
                    )
                  }
                  error={
                    errors.password
                  }
                  suffix={

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (prev) => !prev
                        )
                      }
                      className="text-slate-400 transition hover:text-slate-700"
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >

                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}

                    </button>

                  }
                />

                {/* =================================================
                    CONFIRM PASSWORD
                ================================================== */}

                {mode === 'signup' && (

                  <Input
                    id="confirmPassword"
                    label="Confirm Password"
                    type={
                      showConfirmPassword
                        ? 'text'
                        : 'password'
                    }
                    icon={Lock}
                    placeholder="Re-enter your password"
                    value={
                      form.confirmPassword
                    }
                    onChange={(e) =>
                      handleChange(
                        'confirmPassword',
                        e.target.value
                      )
                    }
                    error={
                      errors.confirmPassword
                    }
                    suffix={

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (prev) => !prev
                          )
                        }
                        className="text-slate-400 transition hover:text-slate-700"
                        aria-label={
                          showConfirmPassword
                            ? 'Hide password'
                            : 'Show password'
                        }
                      >

                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}

                      </button>

                    }
                  />

                )}

                {/* ==================================================
                    STATUS MESSAGE - REMOVED (NOW USING TOAST)
                =================================================== */}

                {/* ==================================================
                    SUBMIT BUTTON
                =================================================== */}

                <div className="pt-1">

                  <Button
                    type="submit"
                    loading={loading}
                    disabled={
                      mode === 'signup' &&
                      !employeeVerified
                    }
                    className="w-full rounded-3xl bg-red-600 px-6 py-2 text-sm text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {mode === 'login'
                      ? 'Login'
                      : 'Create Account'}

                  </Button>

                </div>

                {/* ==================================================
                    SIGNUP NOTICE
                =================================================== */}

                {mode === 'signup' && (

                  <p className="px-2 text-center text-[10px] leading-3 text-slate-400">
                    Your employee code determines your registered
                    position. You cannot select or change the position
                    during signup.
                  </p>

                )}

                {/* ==================================================
                    FORGOT PASSWORD
                =================================================== */}

                {mode === 'login' && (

                  <div className="pt-0.5 text-right text-xs">

                    <button
                      type="button"
                      className="font-medium text-slate-300 transition hover:text-white"
                      onClick={() => {
                        // Add forgot password flow here.
                      }}
                    >
                      Forgot password?
                    </button>

                  </div>

                )}

              </form>

              {/* ==================================================
                  LOGIN / SIGNUP SWITCH
              =================================================== */}

              <div className="mt-2 text-center text-xs text-slate-500">

                {mode === 'login' ? (

                  <>

                    Don&apos;t have an account?{' '}

                    <button
                      type="button"
                      onClick={() =>
                        onSwitchMode(
                          'signup'
                        )
                      }
                      className="font-semibold text-red-600 hover:text-red-700"
                    >
                      Sign up
                    </button>

                  </>

                ) : (

                  <>

                    Already have an account?{' '}

                    <button
                      type="button"
                      onClick={() =>
                        onSwitchMode(
                          'login'
                        )
                      }
                      className="font-semibold text-red-600 hover:text-red-700"
                    >
                      Login
                    </button>

                  </>

                )}

              </div>

            </div>

          </motion.div>

        </motion.div>

      )}

    </AnimatePresence>
    </>
  );
}