import { useSelector } from 'react-redux';

export const usePermission = () => {
  const role = useSelector(state => state.auth.user.role);
  const allPermissions = useSelector(state => state.permission.permissions);

  const hasPermission = (module, action) => {
    if (role === 'company' || role === 'admin') return true; 
    return allPermissions?.[role]?.[module]?.[action] === true;
  };
  const getAuditAccessMethods = () => {
    if (role !== 'audit') return null;
    return allPermissions?.[role]?.auditAccess?.methods || [];
  };

  return { hasPermission, getAuditAccessMethods };
};
