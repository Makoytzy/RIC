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
  CheckCircle2,
  ShieldCheck
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

const emailPattern =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthModal({
  mode,
  onClose,
  onSwitchMode
}) {
  const navigate = useNavigate();

  // ============================================================
  // AUTH CONTEXT
  // ============================================================

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

  const [loading, setLoading] =
    useState(false);

  const [verifyingCode, setVerifyingCode] =
    useState(false);

  const [employeeVerified, setEmployeeVerified] =
    useState(false);

  const [employeeInfo, setEmployeeInfo] =
    useState(null);

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword
  ] = useState(false);

  // ============================================================
  // TOAST
  // ============================================================

  const showToast = (
    type,
    message,
    title = ''
  ) => {
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

    setLoading(false);
    setVerifyingCode(false);

    setEmployeeVerified(false);
    setEmployeeInfo(null);

    setShowPassword(false);
    setShowConfirmPassword(false);

    setToast({
      visible: false,
      type: 'info',
      title: '',
      message: ''
    });
  }, [mode]);

  // ============================================================
  // HANDLE INPUT
  // ============================================================

  const handleChange = (
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));

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

    if (toast.visible) {
      hideToast();
    }
  };

  // ============================================================
  // VERIFY EMPLOYEE CODE
  // ============================================================

  const handleVerifyEmployeeCode =
    async () => {
      const code =
        form.employeeCode.trim();

      // --------------------------------------------------------
      // VALIDATE CODE
      // --------------------------------------------------------

      if (!code) {
        setErrors({
          employeeCode:
            'Enter your employee biometric code.'
        });

        return;
      }

      // --------------------------------------------------------
      // RESET PREVIOUS VERIFICATION
      // --------------------------------------------------------

      setErrors({});
      hideToast();

      setEmployeeVerified(false);
      setEmployeeInfo(null);

      setVerifyingCode(true);

      try {
        // ------------------------------------------------------
        // CALL AUTH CONTEXT
        // ------------------------------------------------------

        const employee =
          await verifyEmployeeCode(code);

        // ------------------------------------------------------
        // CODE NOT FOUND
        // ------------------------------------------------------

        if (!employee) {
          setEmployeeVerified(false);
          setEmployeeInfo(null);

          setErrors({
            employeeCode:
              'Invalid employee code or this code has already been used.'
          });

          return;
        }

        // ------------------------------------------------------
        // SUCCESS
        // ------------------------------------------------------

        setEmployeeVerified(true);

        setEmployeeInfo(employee);

        // ------------------------------------------------------
        // POPULATE VERIFIED INFORMATION
        // ------------------------------------------------------

        setForm((prev) => ({
          ...prev,

          employeeCode:
            employee.employee_code ||
            code,

          fullName:
            employee.full_name || '',

          email:
            employee.email || ''
        }));

        showToast(
          'success',
          'Your employee registration code has been verified successfully.',
          'Employee Verified'
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
    // SIGNUP VALIDATION
    // ==========================================================

    if (mode === 'signup') {
      // --------------------------------------------------------
      // EMPLOYEE CODE
      // --------------------------------------------------------

      if (
        !form.employeeCode.trim()
      ) {
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
          'Employee information could not be loaded.';
      }
    }

    // ==========================================================
    // EMAIL
    // ==========================================================

    if (
      !form.email ||
      !emailPattern.test(
        form.email.trim()
      )
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
      if (!form.confirmPassword) {
        nextErrors.confirmPassword =
          'Confirm your password.';
      } else if (
        form.password !==
        form.confirmPassword
      ) {
        nextErrors.confirmPassword =
          'Passwords do not match.';
      }
    }

    // ==========================================================
    // SET ERRORS
    // ==========================================================

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };

  // ============================================================
  // SUBMIT
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
        'Please fix the errors in the form before continuing.',
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
          email:
            form.email.trim(),

          password:
            form.password
        });

        showToast(
          'success',
          'You have successfully logged in. Redirecting to dashboard...',
          'Login Successful'
        );

        // Small delay so the user can see success toast
        setTimeout(() => {
          onClose();
          navigate('/dashboard');
        }, 700);

        return;
      }

      // ========================================================
      // SIGN UP
      // ========================================================

      await signUp({
        email:
          form.email.trim(),

        password:
          form.password,

        fullName:
          form.fullName.trim(),

        employeeCode:
          form.employeeCode.trim()
      });

      // --------------------------------------------------------
      // EMAIL VERIFICATION MESSAGE
      // --------------------------------------------------------

      showToast(
        'success',
        'Your account registration was successful. Please check your registered email and click the verification link before logging in.',
        'Verify Your Email'
      );

      // --------------------------------------------------------
      // CLEAR PASSWORDS
      // --------------------------------------------------------

      setForm((prev) => ({
        ...prev,

        password: '',
        confirmPassword: ''
      }));

      // --------------------------------------------------------
      // KEEP EMPLOYEE INFORMATION TEMPORARILY
      // --------------------------------------------------------

      setTimeout(() => {
        hideToast();

        setEmployeeVerified(false);
        setEmployeeInfo(null);

        setForm({
          employeeCode: '',
          fullName: '',
          email: '',
          password: '',
          confirmPassword: ''
        });

        onSwitchMode('login');
      }, 4000);
    } catch (error) {
      console.error(
        'Authentication error:',
        error
      );

      let message =
        'Something went wrong. Please try again.';

      // --------------------------------------------------------
      // SUPABASE ERROR MESSAGE
      // --------------------------------------------------------

      if (error?.message) {
        message = error.message;
      }

      showToast(
        'error',
        message,
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
      {/* ======================================================
          TOAST
      ======================================================= */}

      <Toast
        type={toast.type}
        title={toast.title}
        message={toast.message}
        visible={toast.visible}
        onClose={hideToast}
        duration={6000}
        pauseOnHover={true}
        position="top-right"
      />

      <AnimatePresence>
        {mode && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 px-4 py-4 backdrop-blur-xl"
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
            {/* ==================================================
                MODAL
            =================================================== */}

            <motion.div
              className="relative my-4 w-full max-w-[400px] overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-3 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-3xl ring-1 ring-white/10"
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
                  CLOSE BUTTON
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

                        <Input
                          id="employeeCode"
                          label=""
                          type="text"
                          icon={Fingerprint}
                          placeholder="Enter your employee code"
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
                {/* =================================================
                    FORM
                ================================================== */}

                <form
                  onSubmit={handleSubmit}
                  className="space-y-2"
                >

                  {/* ===============================================
                      EMPLOYEE BIOMETRIC CODE
                  ================================================ */}

                  {mode === 'signup' && (
                    <div className="flex flex-col gap-1">

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
                            placeholder="Enter your employee code"
                            value={
                              form.employeeCode
                            }
                            disabled={
                              employeeVerified ||
                              verifyingCode
                            }
                            onChange={(e) => {
                              const value =
                                e.target.value.toUpperCase();

                              handleChange(
                                'employeeCode',
                                value
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
                            className="mt-[1px] h-[40px] shrink-0 rounded-2xl bg-red-600 px-3 text-[11px] font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {verifyingCode
                              ? 'Checking...'
                              : 'Verify'}
                          </button>
                        )}
                      </div>

                      {/* =============================================
                          VERIFIED EMPLOYEE CARD
                      ============================================== */}

                      {employeeVerified &&
                        employeeInfo && (
                          <div className="mt-1 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3">

                            <div className="mb-2 flex items-center gap-2">

                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20">
                                <CheckCircle2
                                  size={15}
                                  className="text-emerald-400"
                                />
                              </div>

                              <div>
                                <p className="text-xs font-semibold text-emerald-300">
                                  Employee Verified
                                </p>

                                <p className="text-[9px] text-emerald-200/60">
                                  Registration code is valid
                                </p>
                              </div>

                            </div>

                            <div className="space-y-1.5">

                              {/* Employee */}

                              <div className="flex items-start justify-between gap-3">

                                <span className="text-[10px] font-medium text-emerald-200/70">
                                  Employee
                                </span>

                                <span className="text-right text-xs font-semibold text-white">
                                  {employeeInfo.full_name}
                                </span>

                              </div>

                              {/* Position */}

                              <div className="flex items-start justify-between gap-3">

                                <span className="text-[10px] font-medium text-emerald-200/70">
                                  Department
                                </span>

                                <span className="text-right text-xs font-semibold text-white">
                                  {employeeInfo.employee_position ||
                                    employeeInfo.position ||
                                    'Not specified'}
                                </span>

                              </div>

                              {/* Email */}

                              <div className="flex items-start justify-between gap-3">

                                <span className="text-[10px] font-medium text-emerald-200/70">
                                  Email
                                </span>

                                <span className="max-w-[210px] break-all text-right text-xs text-white">
                                  {employeeInfo.email}
                                </span>

                              </div>

                            </div>

                          </div>
                        )}
                    </div>
                  )}

                  {/* ===============================================
                      FULL NAME
                  ================================================ */}

                  {mode === 'signup' && (
                    <Input
                      id="fullName"
                      label="Full Name"
                      icon={Users}
                      placeholder="Employee name"
                      value={
                        form.fullName
                      }
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

                  {/* ===============================================
                      EMAIL
                  ================================================ */}

                  <Input
                    id="email"
                    label="Email Address"
                    type="email"
                    icon={Mail}
                    placeholder="employee@example.com"
                    value={
                      form.email
                    }
                    disabled={
                      mode === 'signup' &&
                      employeeVerified
                    }
                    className={
                      mode === 'signup' &&
                      employeeVerified
                        ? '!text-slate-500'
                        : ''
                    }
                    onChange={(e) =>
                      handleChange(
                        'email',
                        e.target.value
                      )
                    }
                    error={
                      errors.email
                    }
                  />

                  {/* ===============================================
                      PASSWORD
                  ================================================ */}

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
                    value={
                      form.password
                    }
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
                            (prev) =>
                              !prev
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
                          <EyeOff
                            size={18}
                          />
                        ) : (
                          <Eye
                            size={18}
                          />
                        )}
                      </button>
                    }
                  />

                  {/* ===============================================
                      CONFIRM PASSWORD
                  ================================================ */}

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
                              (prev) =>
                                !prev
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
                            <EyeOff
                              size={18}
                            />
                          ) : (
                            <Eye
                              size={18}
                            />
                          )}
                        </button>
                      }
                    />
                  )}

                  {/* ===============================================
                      EMAIL VERIFICATION NOTICE
                  ================================================ */}

                  {mode === 'signup' &&
                    employeeVerified && (
                      <div className="rounded-xl border border-blue-400/20 bg-blue-500/10 px-3 py-2">

                        <div className="flex items-start gap-2">

                          <ShieldCheck
                            size={15}
                            className="mt-0.5 shrink-0 text-blue-400"
                          />

                          <p className="text-[10px] leading-4 text-blue-200/80">
                            After creating your account,
                            Supabase will send a verification
                            email to your registered email
                            address. You must confirm the
                            email before logging in.
                          </p>

                        </div>

                      </div>
                    )}

                  {/* ===============================================
                      SUBMIT BUTTON
                  ================================================ */}

                  <div className="pt-1">

                    <Button
                      type="submit"
                      loading={loading}
                      disabled={
                        loading ||
                        (mode === 'signup' &&
                          !employeeVerified)
                      }
                      className="w-full rounded-3xl bg-red-600 px-6 py-2 text-sm text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {mode === 'login'
                        ? 'Login'
                        : 'Create Account'}
                    </Button>

                  </div>

                  {/* ===============================================
                      SIGNUP SECURITY NOTICE
                  ================================================ */}

                  {mode === 'signup' && (
                    <p className="px-2 text-center text-[10px] leading-3 text-slate-400">
                      Your employee registration code determines
                      your registered employee information and
                      department. These details cannot be changed
                      during signup.
                    </p>
                  )}

                  {/* ===============================================
                      FORGOT PASSWORD
                  ================================================ */}

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

              </div>

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
                      className="font-semibold text-red-600 transition hover:text-red-700"
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
                      className="font-semibold text-red-600 transition hover:text-red-700"
                    >
                      Login
                    </button>
                  </>
                )}

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}