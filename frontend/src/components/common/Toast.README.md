# Toast Notification Component

A production-ready, fully responsive, and accessible toast notification system for the Red Indian Customs Inventory Management System.

## Features

✨ **Modern Design**
- Glassmorphism effects with backdrop blur
- Smooth spring-based animations
- Pulsing shadow effects
- Clean, professional appearance

🎨 **Multiple Message Types**
- Success (green/emerald theme)
- Error (red/rose theme)
- Warning (yellow/amber theme)
- Info (blue theme)

📱 **Fully Responsive**
- Desktop: Positioned at top-right with slide-in animation
- Mobile: Full-width with top slide-down animation
- No horizontal overflow
- Respects safe areas (notches, status bars)

♿ **Accessibility**
- ARIA live regions for screen readers
- Keyboard accessible
- Respects `prefers-reduced-motion`
- Minimum 44px touch targets on mobile
- High contrast text
- Focus indicators

⚡ **Smart Behavior**
- Auto-dismiss with configurable duration
- Pause on hover (optional)
- Manual dismiss button
- Prevents duplicate notifications
- Smooth entrance and exit animations

## Usage

### Basic Example

```jsx
import Toast from '../components/common/Toast';

function MyComponent() {
  const [showToast, setShowToast] = useState(false);

  return (
    <>
      <button onClick={() => setShowToast(true)}>
        Show Toast
      </button>

      <Toast
        type="success"
        title="Success"
        message="Operation completed successfully!"
        visible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
}
```

### With State Management

```jsx
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

// Usage
showToast('success', 'Employee code verified successfully!', 'Verified');
showToast('error', 'Invalid credentials', 'Login Failed');
showToast('warning', 'Session expiring soon', 'Warning');
showToast('info', 'New update available', 'Information');
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'success' \| 'error' \| 'warning' \| 'info'` | `'info'` | Toast message type |
| `title` | `string` | Auto-generated | Toast title (optional) |
| `message` | `string` | Required | Toast message content |
| `visible` | `boolean` | `false` | Controls toast visibility |
| `onClose` | `function` | Required | Callback when toast is closed |
| `duration` | `number` | `5000` | Auto-dismiss duration in ms (0 to disable) |
| `pauseOnHover` | `boolean` | `true` | Pause auto-dismiss on hover |
| `position` | `'top-right' \| 'top-center' \| 'center'` | `'top-right'` | Toast position |

## Message Types

### Success
```jsx
<Toast
  type="success"
  title="Employee Code Verified"
  message="Employee code verified successfully!"
  visible={true}
  onClose={handleClose}
/>
```

### Error
```jsx
<Toast
  type="error"
  title="Verification Failed"
  message="The employee biometric code could not be verified."
  visible={true}
  onClose={handleClose}
/>
```

### Warning
```jsx
<Toast
  type="warning"
  title="Verification Required"
  message="Please enter a valid employee biometric code."
  visible={true}
  onClose={handleClose}
/>
```

### Info
```jsx
<Toast
  type="info"
  title="Information"
  message="Please complete the required fields."
  visible={true}
  onClose={handleClose}
/>
```

## Positioning

### Top Right (Default)
Best for desktop notifications that don't interfere with content.

```jsx
<Toast position="top-right" {...props} />
```

### Top Center
Good for important messages that need immediate attention.

```jsx
<Toast position="top-center" {...props} />
```

### Center
For modal-style notifications that overlay content.

```jsx
<Toast position="center" {...props} />
```

## Responsive Behavior

### Desktop (≥640px)
- Top-right position with slide-in from right
- Max width: 28rem (448px)
- Positioned 1.5rem from edges
- Slide animation from right side

### Mobile (<640px)
- Full width minus 2rem margins
- Slide-down from top animation
- Positioned 1rem from top
- Responsive padding and text sizes

## Accessibility Features

### Screen Readers
```html
role="status"
aria-live="polite"
aria-atomic="true"
aria-label="Close notification"
```

### Keyboard Navigation
- Close button is focusable
- Visible focus indicators
- Tab-accessible

### Motion Preferences
Respects `prefers-reduced-motion` for users who prefer reduced animations.

### Touch Targets
Close button has minimum 44px × 44px touch target on mobile devices.

## Advanced Usage

### Custom Duration
```jsx
<Toast
  duration={3000}  // 3 seconds
  {...props}
/>

<Toast
  duration={0}  // Never auto-dismiss
  {...props}
/>
```

### Disable Hover Pause
```jsx
<Toast
  pauseOnHover={false}
  {...props}
/>
```

### Multiple Toasts
```jsx
function NotificationCenter() {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    setToasts(prev => [...prev, { ...toast, id: Date.now() }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          visible={true}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
}
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Android Chrome 90+

## Dependencies

- `react` >= 18.0.0
- `framer-motion` >= 10.0.0
- `lucide-react` >= 0.263.0
- `tailwindcss` >= 3.0.0

## Notes

- The toast uses `fixed` positioning by default, making it independent of parent containers
- Z-index is set to 100 to ensure it appears above most content
- The component automatically handles safe area insets on devices with notches
- Animations are disabled for users who prefer reduced motion
- The toast prevents horizontal scrolling on all screen sizes
