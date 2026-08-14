# Vite WebSocket Connection Fix

## Problem

```
WebSocket connection to 'ws://localhost:5174/?token=xxx' failed
WebSocket connection to 'ws://localhost:5173/?token=xxx' failed
[vite] failed to connect to websocket
```

This error occurs when:
1. The browser is accessing the app on a different port than Vite is running on
2. Multiple Vite dev servers are running
3. HMR (Hot Module Replacement) configuration is missing

## Solution Applied

### 1. Updated `vite.config.js`

Added explicit HMR WebSocket configuration:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: '/',
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      clientPort: 5173
    }
  },
});
```

**What this does:**
- `strictPort: true` - Fails if port 5173 is already in use
- `hmr.protocol: 'ws'` - Uses WebSocket (not wss for local dev)
- `hmr.host: 'localhost'` - HMR host matches server host
- `hmr.port: 5173` - HMR uses the same port as the server
- `hmr.clientPort: 5173` - Browser connects to the correct port

### 2. Stopped Conflicting Processes

Stopped any existing Node/Vite processes that might be occupying the port.

### 3. Restarted Dev Server

Started a fresh Vite dev server on the correct port (5173).

## How to Verify Fix

1. **Check the dev server is running:**
   ```
   VITE v5.4.21  ready in 534 ms
   ➜  Local:   http://localhost:5173/
   ```

2. **Open browser to:** `http://localhost:5173/`
   - NOT `http://localhost:5174/` or any other port

3. **Check browser console:**
   - Should NOT see WebSocket errors
   - Should see: `[vite] connecting...` then `[vite] connected.`

4. **Test HMR (Hot Module Replacement):**
   - Edit a React component
   - Save the file
   - Browser should update immediately without full reload
   - Console should show: `[vite] hmr update /src/...`

## Common Issues and Solutions

### Issue: Port 5173 is already in use

**Error:**
```
Port 5173 is in use, trying another one...
VITE ready in 500 ms
➜  Local:   http://localhost:5174/
```

**Solution:**
```powershell
# Find process using port 5173
Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object OwningProcess

# Stop the process
Stop-Process -Id <ProcessId> -Force

# Restart Vite
npm run dev
```

### Issue: Multiple browser tabs on different ports

**Problem:**
One tab on `localhost:5173`, another on `localhost:5174`

**Solution:**
1. Close ALL browser tabs
2. Clear browser cache (Ctrl+Shift+Delete)
3. Stop all Vite processes
4. Start fresh: `npm run dev`
5. Open only one tab to `http://localhost:5173/`

### Issue: WebSocket still fails after fix

**Solution 1 - Clear Vite cache:**
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules/.vite
npm run dev
```

**Solution 2 - Check firewall:**
Windows Firewall might be blocking WebSocket connections.
```powershell
# Allow Node.js through firewall (Run as Administrator)
New-NetFirewallRule -DisplayName "Node.js Dev Server" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow
```

**Solution 3 - Try a different port:**
Update `vite.config.js`:
```javascript
server: {
  port: 3000,  // Change to 3000 or any available port
  strictPort: true,
  hmr: {
    protocol: 'ws',
    host: 'localhost',
    port: 3000,
    clientPort: 3000
  }
}
```

### Issue: HMR works but WebSocket shows warnings

If HMR works but you still see WebSocket warnings, you can configure HMR overlay:

```javascript
export default defineConfig({
  server: {
    hmr: {
      overlay: true  // Show HMR errors as overlay
    }
  }
});
```

## Development Workflow

### Starting Development

```powershell
# Navigate to frontend directory
cd frontend

# Start dev server
npm run dev

# Server starts on http://localhost:5173/
# Open browser to this exact URL
```

### Stopping Development

```powershell
# Press Ctrl+C in the terminal running Vite
# Or close the terminal
```

### Restarting After Config Changes

```powershell
# Stop the server (Ctrl+C)
# Restart
npm run dev
```

## Browser DevTools Checks

### Console Messages (Normal Operation)

✅ **Good:**
```
[vite] connecting...
[vite] connected.
```

When you edit a file:
```
[vite] hmr update /src/components/MyComponent.jsx
[vite] page reload src/components/MyComponent.jsx
```

❌ **Bad:**
```
WebSocket connection to 'ws://localhost:5174/?token=xxx' failed
[vite] failed to connect to websocket
[vite] server connection lost. Polling for restart...
```

### Network Tab

✅ **Good:**
- WebSocket connection to `ws://localhost:5173/`
- Status: 101 Switching Protocols
- Type: websocket
- Messages tab shows ping/pong

❌ **Bad:**
- Multiple failed WebSocket attempts
- Connection rejected
- No WebSocket connection established

## Additional Configuration Options

### For Docker/Remote Development

```javascript
server: {
  host: '0.0.0.0',  // Listen on all network interfaces
  port: 5173,
  strictPort: true,
  hmr: {
    protocol: 'ws',
    host: 'localhost',  // Or your Docker host
    port: 5173
  }
}
```

### For HTTPS Development

```javascript
import fs from 'fs';

export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync('./key.pem'),
      cert: fs.readFileSync('./cert.pem')
    },
    hmr: {
      protocol: 'wss',  // Use wss for HTTPS
      host: 'localhost',
      port: 5173
    }
  }
});
```

### For Proxy Configuration

```javascript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true
    }
  },
  hmr: {
    protocol: 'ws',
    host: 'localhost',
    port: 5173
  }
}
```

## Testing the Fix

### Test Checklist

- [ ] Dev server starts on port 5173
- [ ] Browser opens to `http://localhost:5173/`
- [ ] No WebSocket errors in console
- [ ] Edit a component file
- [ ] Browser updates without full reload
- [ ] Console shows HMR update message
- [ ] No errors in browser console
- [ ] No errors in terminal

### Test HMR Working

1. Open `src/App.jsx`
2. Change some text
3. Save the file
4. Browser should update immediately
5. Console should show: `[vite] hmr update /src/App.jsx`

If all these work, the fix is successful! ✅

## Permanent Fix

The updated `vite.config.js` with explicit HMR configuration ensures:
- ✅ Consistent port usage
- ✅ Proper WebSocket connections
- ✅ Reliable HMR
- ✅ No port conflicts
- ✅ Better error messages

## Support

If issues persist:
1. Check Node.js version: `node --version` (should be 18+ or 20+)
2. Check npm version: `npm --version` (should be 9+ or 10+)
3. Clear all caches: `npm cache clean --force`
4. Reinstall dependencies: `Remove-Item -Recurse node_modules ; npm install`
5. Check Vite documentation: https://vite.dev/config/server-options.html#server-hmr
