import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import './admin.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('is_admin')
          .eq('id', data.user.id)
          .maybeSingle();

        if (adminError) throw adminError;

        if (adminData?.is_admin) {
          window.location.href = '/admin';
        } else {
          setError('Access denied. Your account is not an admin account.');
          await supabase.auth.signOut();
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <h1>Crave Admin</h1>
        <p className="subtitle">Login to access the admin dashboard</p>

        <form onSubmit={handleLogin} className="admin-login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="login-footer">
          Need access? Contact your system administrator.
        </p>
      </div>
    </div>
  );
}
