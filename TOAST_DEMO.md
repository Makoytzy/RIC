# Toast Notification Demo Guide

## Testing the Toast Component

To test all toast notification types and features, you can use this demo code.

### Demo Component

Create a test page to showcase all toast variants:

```jsx
import { useState } from 'react';
import Toast from '../components/common/Toast';

export default function ToastDemo() {
  const [toast, setToast] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showToast = (type, message, title = '') => {
    setToast({ visible: true, type, title, message });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      {/* Toast Component */}
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

      {/* Demo Controls */}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Toast Notification Demo
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Success Messages */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-emerald-400 mb-4">
              Success Messages
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => showToast(
                  'success',
                  'Employee code verified successfully!',
                  'Employee Code Verified'
                )}
                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                Employee Verified
              </button>
              <button
                onClick={() => showToast(
                  'success',
                  'Account created successfully! Please verify your email to sign in.',
                  'Account Created'
                )}
                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                Account Created
              </button>
              <button
                onClick={() => showToast(
                  'success',
                  'You have successfully logged in. Redirecting to dashboard...',
                  'Login Successful'
                )}
                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                Login Success
              </button>
            </div>
          </div>

          {/* Error Messages */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-rose-400 mb-4">
              Error Messages
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => showToast(
                  'error',
                  'The employee biometric code could not be verified.',
                  'Verification Failed'
                )}
                className="w-full px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
              >
                Verification Failed
              </button>
              <button
                onClick={() => showToast(
                  'error',
                  'Please fix the errors in the form before submitting.',
                  'Validation Error'
                )}
                className="w-full px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
              >
                Validation Error
              </button>
              <button
                onClick={() => showToast(
                  'error',
                  'Something went wrong. Please try again.',
                  'Authentication Error'
                )}
                className="w-full px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
              >
                Auth Error
              </button>
            </div>
          </div>

          {/* Warning Messages */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-amber-400 mb-4">
              Warning Messages
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => showToast(
                  'warning',
                  'Please enter a valid employee biometric code.',
                  'Verification Required'
                )}
                className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
              >
                Verification Required
              </button>
              <button
                onClick={() => showToast(
                  'warning',
                  'Your session will expire in 5 minutes.',
                  'Session Expiring'
                )}
                className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
              >
                Session Warning
              </button>
              <button
                onClick={() => showToast(
                  'warning',
                  'This action cannot be undone.',
                  'Confirmation Required'
                )}
                className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
              >
                Confirm Action
              </button>
            </div>
          </div>

          {/* Info Messages */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-blue-400 mb-4">
              Info Messages
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => showToast(
                  'info',
                  'Please complete the required fields.',
                  'Information'
                )}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Complete Fields
              </button>
              <button
                onClick={() => showToast(
                  'info',
                  'A new system update is available.',
                  'Update Available'
                )}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Update Available
              </button>
              <button
                onClick={() => showToast(
                  'info',
                  'Your data has been automatically saved.',
                  'Auto-Save'
                )}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Auto-Save
              </button>
            </div>
          </div>
        </div>

        {/* Long Message Test */}
        <div className="bg-slate-800 rounded-2xl p-6 mt-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Edge Cases
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => showToast(
                'success',
                'This is an extremely long message that tests how the toast notification handles text wrapping on different screen sizes including mobile, tablet, and desktop devices to ensure proper responsive behavior.',
                'Long Message Test'
              )}
              className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
            >
              Long Message
            </button>
            <button
              onClick={() => showToast(
                'error',
                'Short',
                'Short Message'
              )}
              className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
            >
              Short Message
            </button>
            <button
              onClick={() => showToast(
                'info',
                'This tests a message with special characters: @#$%^&*()_+-=[]{}|;\':",./<>?',
                'Special Characters'
              )}
              className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
            >
              Special Characters
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-slate-800 rounded-2xl p-6 mt-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Testing Instructions
          </h2>
          <ul className="space-y-2 text-slate-300">
            <li>✓ Click any button to show that toast type</li>
            <li>✓ Hover over the toast to pause auto-dismiss</li>
            <li>✓ Click the × button to manually dismiss</li>
            <li>✓ Test on different screen sizes (responsive)</li>
            <li>✓ Test with mobile device (touch targets)</li>
            <li>✓ Test with screen reader (accessibility)</li>
            <li>✓ Test with keyboard navigation (Tab key)</li>
            <li>✓ Enable "Reduce Motion" in OS settings to test accessibility</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
```

## Manual Testing Checklist

### Desktop Testing (≥640px)
- [ ] Toast appears at top-right corner
- [ ] Slides in smoothly from the right
- [ ] Text is readable and properly sized
- [ ] Close button is visible and clickable
- [ ] Auto-dismisses after 5 seconds
- [ ] Pauses when hovering
- [ ] Resumes when mouse leaves
- [ ] Doesn't block any content
- [ ] Shadow effect is visible
- [ ] Icons animate on entrance

### Mobile Testing (<640px)
- [ ] Toast is full width with margins
- [ ] Slides down from the top
- [ ] Text wraps correctly
- [ ] Close button is at least 44×44px
- [ ] No horizontal scrolling
- [ ] Touch targets are adequate
- [ ] Works with mobile keyboard open
- [ ] Respects device safe areas (notch)

### Accessibility Testing
- [ ] Screen reader announces the toast
- [ ] Close button is keyboard accessible (Tab key)
- [ ] Focus indicator is visible
- [ ] Color contrast is sufficient
- [ ] Works with "Reduce Motion" enabled
- [ ] ARIA attributes are present

### Message Type Testing
- [ ] Success shows green with checkmark icon
- [ ] Error shows red with alert icon
- [ ] Warning shows amber with triangle icon
- [ ] Info shows blue with info icon
- [ ] Title and message are clearly separated
- [ ] Icons have proper colors

### Edge Cases
- [ ] Long messages wrap properly
- [ ] Short messages display correctly
- [ ] Special characters render properly
- [ ] Multiple rapid clicks don't break it
- [ ] Toast dismisses when navigating away
- [ ] Works after window resize

### Browser Testing
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Quick Test Commands

### Test All Types Sequentially
```jsx
const testAll = async () => {
  showToast('success', 'Success message', 'Success');
  await new Promise(r => setTimeout(r, 6000));
  
  showToast('error', 'Error message', 'Error');
  await new Promise(r => setTimeout(r, 6000));
  
  showToast('warning', 'Warning message', 'Warning');
  await new Promise(r => setTimeout(r, 6000));
  
  showToast('info', 'Info message', 'Info');
};
```

### Test Rapid Fire
```jsx
const testRapid = () => {
  showToast('success', 'First toast', 'Toast 1');
  setTimeout(() => showToast('error', 'Second toast', 'Toast 2'), 500);
  setTimeout(() => showToast('warning', 'Third toast', 'Toast 3'), 1000);
};
```

## Expected Results

### ✅ All Tests Pass
- Notifications appear smoothly
- No layout issues
- No console errors
- Proper accessibility
- Responsive on all devices
- Good performance

### ❌ If Issues Found
1. Check browser console for errors
2. Verify Toast component is imported correctly
3. Check Tailwind CSS is configured
4. Verify Framer Motion is installed
5. Check for z-index conflicts
6. Test in incognito mode (no extensions)

## Production Deployment Checklist

Before deploying to production:
- [ ] All manual tests pass
- [ ] No console errors
- [ ] Build completes successfully
- [ ] Lighthouse accessibility score > 90
- [ ] Mobile performance is good
- [ ] Cross-browser testing complete
- [ ] Screen reader testing complete
- [ ] Touch target sizes verified
- [ ] Safe area support verified
- [ ] Documentation is complete
