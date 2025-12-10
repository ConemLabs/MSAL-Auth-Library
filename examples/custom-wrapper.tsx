/**
 * Example: Using a custom wrapper component for complete UI control
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { 
  AuthenticationWrapper, 
  WrapperComponentProps,
  MsalAuthConfig 
} from '@conemlabs/msal-auth-library';

const authConfig: MsalAuthConfig = {
  clientId: 'YOUR_CLIENT_ID',
  tenantId: 'YOUR_TENANT_ID',
  redirectUri: window.location.origin,
  scopes: ['api://YOUR_CLIENT_ID/access_as_user'],
  flowType: 'popup',
};

/**
 * Custom wrapper component that has complete control over the authentication UI
 * This receives the authentication state and handlers, and decides how to render everything
 */
const CustomAuthWrapper: React.FC<WrapperComponentProps> = ({
  isInitializing,
  isAuthenticated,
  needsLogin,
  authError,
  onLogin,
  onLogout,
  children,
}) => {
  // Loading state - show custom loading UI
  if (isInitializing) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <h2>Setting up your workspace...</h2>
          <p style={{ color: '#666' }}>Please wait</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show custom login UI
  if (!isAuthenticated && needsLogin) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '1rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          maxWidth: '450px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔐</div>
          <h1 style={{ marginBottom: '1rem', color: '#333' }}>Welcome Back!</h1>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            Sign in with your Microsoft account to access your workspace
          </p>

          {authError && (
            <div style={{
              background: '#fee',
              color: '#c33',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              <strong>⚠️ Error:</strong> {authError}
            </div>
          )}

          <button
            onClick={onLogin}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '1rem 2.5rem',
              borderRadius: '0.5rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%',
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Sign In with Microsoft
          </button>

          <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#999' }}>
            Secure authentication powered by Azure AD
          </p>
        </div>
      </div>
    );
  }

  // Authenticated - render the app with custom header/footer
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Custom Header */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '1.5rem' }}>🚀</div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>My Awesome App</h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem' }}>✓ Authenticated</span>
          <button
            onClick={onLogout}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', background: '#f8f9fa' }}>
        {children}
      </main>

      {/* Custom Footer */}
      <footer style={{
        background: '#2c3e50',
        color: 'white',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, opacity: 0.8 }}>
          © 2025 My Awesome App. Secured with MSAL React Auth Library.
        </p>
      </footer>
    </div>
  );
};

/**
 * Your main application content
 */
function AppContent() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h2>Dashboard</h2>
        <p>Welcome! You are now authenticated and can access all features.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <h3>📊 Analytics</h3>
          <p>View your analytics and insights</p>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <h3>⚙️ Settings</h3>
          <p>Configure your preferences</p>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <h3>👥 Team</h3>
          <p>Manage your team members</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Main App with custom authentication wrapper
 */
function App() {
  const handleAuthSuccess = async () => {
    console.log('Authentication successful! User is now logged in.');
    // You can load user data, initialize analytics, etc.
  };

  return (
    <AuthenticationWrapper
      config={authConfig}
      wrapperComponent={CustomAuthWrapper}
      onAuthSuccess={handleAuthSuccess}
    >
      <AppContent />
    </AuthenticationWrapper>
  );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
