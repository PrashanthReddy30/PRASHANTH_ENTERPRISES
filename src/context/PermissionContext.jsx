import { useAuth } from './AuthContext';

export function usePermissions() {
  const { permissions } = useAuth();
  return permissions;
}

export default usePermissions;
