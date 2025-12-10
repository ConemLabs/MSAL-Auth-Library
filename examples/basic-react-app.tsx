/**
 * Basic React App Example
 * 
 * This example shows the simplest way to add MSAL authentication to a React app.
 * Just wrap your app with AuthenticationWrapper and you're done!
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthenticationWrapper } from '@conemlabs/msal-auth-library';

// Configure your Azure AD settings
const authConfig = {
  clientId: 'YOUR_CLIENT_ID',           // Get from Azure Portal
  tenantId: 'YOUR_TENANT_ID',           // Get from Azure Portal
  redirectUri: window.location.origin,  // e.g., http://localhost:3000
  scopes: ['api://YOUR_CLIENT_ID/access_as_user'], // Your API scopes
  flowType: 'popup' as const,            // Use popup (no page reload)
};

// Your main app component
function MyApp() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>🎉 You're Authenticated!</h1>
      <p>This content is only visible to authenticated users.</p>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>What you get automatically:</h2>
        <ul>
          <li>✅ Automatic login prompt</li>
          <li>✅ Token management</li>
          <li>✅ Auto token refresh every 30 minutes</li>
          <li>✅ Logout functionality</li>
          <li>✅ Error handling</li>
        </ul>
      </div>
    </div>
  );
}

// Wrap your app with AuthenticationWrapper
function App() {
  return (
    <AuthenticationWrapper config={authConfig}>
      <MyApp />
    </AuthenticationWrapper>
  );
}

// Render the app
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

export default App;
