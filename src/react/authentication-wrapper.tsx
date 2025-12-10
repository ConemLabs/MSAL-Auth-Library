import React from 'react';
import { useAuthentication } from './use-authentication';
import { AuthenticationWrapperProps } from './types';

/**
 * Simple default loading component
 */
const DefaultLoadingComponent: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
    <div>Loading...</div>
  </div>
);

/**
 * Simple default login component
 */
interface DefaultLoginComponentProps {
  onLogin: () => void;
  error: string | null;
}

const DefaultLoginComponent: React.FC<DefaultLoginComponentProps> = ({ onLogin, error }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
    <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '400px' }}>
      <h1>Authentication Required</h1>
      <p>Please sign in to continue</p>
      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          Error: {error}
        </div>
      )}
      <button onClick={onLogin} style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>
        Sign In
      </button>
    </div>
  </div>
);

/**
 * Authentication wrapper component
 * Handles authentication state and renders appropriate UI
 * Supports custom wrapper components for full control over the authentication flow
 */
export const AuthenticationWrapper: React.FC<AuthenticationWrapperProps> = ({
  config,
  children,
  onAuthSuccess,
  showAuthStatus = false,
  loadingComponent,
  loginComponent,
  errorComponent,
  wrapperComponent: CustomWrapperComponent,
}) => {
  const { authState, actions } = useAuthentication(config, onAuthSuccess);

  // If a custom wrapper component is provided, use it
  if (CustomWrapperComponent) {
    return (
      <CustomWrapperComponent
        isInitializing={authState.isInitializing}
        isAuthenticated={authState.isAuthenticated}
        needsLogin={authState.needsLogin}
        authError={authState.authError}
        onLogin={actions.handleLogin}
        onLogout={actions.handleLogout}
      >
        {children}
      </CustomWrapperComponent>
    );
  }

  // Otherwise, use the default wrapper with optional custom components
  // Show loading component
  if (authState.isInitializing) {
    return <>{loadingComponent || <DefaultLoadingComponent />}</>;
  }

  // Show login component
  if (authState.needsLogin && !authState.isAuthenticated) {
    if (loginComponent) {
      return <>{loginComponent}</>;
    }

    if (errorComponent && authState.authError) {
      return <>{errorComponent(authState.authError, actions.handleLogin)}</>;
    }

    return <DefaultLoginComponent onLogin={actions.handleLogin} error={authState.authError} />;
  }

  // Show authenticated content
  return (
    <div>
      {showAuthStatus && (
        <div style={{ padding: '0.5rem', background: '#d4edda', borderBottom: '1px solid #c3e6cb' }}>
          <span>✓ Authenticated</span>
          <button
            onClick={actions.handleLogout}
            style={{ float: 'right', marginLeft: '1rem' }}
          >
            Sign Out
          </button>
        </div>
      )}
      {children}
    </div>
  );
};
