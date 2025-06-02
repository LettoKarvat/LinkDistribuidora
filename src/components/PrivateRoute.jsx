import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuth';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default PrivateRoute;