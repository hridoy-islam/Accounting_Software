

import type React from 'react';
import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

// Define types based on your MongoDB schema
type ModulePermission = {
  create: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
};

type AuditAccess = {
  storages: string[];
  methods: string[];
};

type CompanyPermissions = {
  Invoice: ModulePermission;
  Customer: ModulePermission;
  TransactionList: ModulePermission;
  PendingTransaction: ModulePermission;
  CSVUpload: ModulePermission;
  ArchiveTransaction: ModulePermission;
  Report: ModulePermission;
  Method: ModulePermission;
  Storage: ModulePermission;
  Category: ModulePermission;
  CreateUser: ModulePermission;
  CompanyDetails: ModulePermission;
  auditAccess?: AuditAccess;
};

type PermissionsMap = {
  [role: string]: CompanyPermissions;
};

const fetchPermissions = async (companyId: string) => {
  try {
    const response = await axiosInstance.get(`/permissions/${companyId}`);
    // Extract permissions from the response data structure
    return response.data.data.result[0]?.permissions || {};
  } catch (error) {
    console.error('Error fetching permissions:', error);
    throw error;
  }
};

const updatePermission = async (
  companyId: string,
  role: string,
  module: string,
  permission: Partial<ModulePermission>
) => {
  try {
    const response = await axiosInstance.patch(
      `/permissions/${companyId}/${role}/${module}`,
      permission
    );
    return response.data;
  } catch (error) {
    console.error('Error updating permission:', error);
    throw error;
  }
};

function PermissionManager({
  permissions,
  currentRole,
  setCurrentRole,
  updatePermission,
  isLoading,
  initializePermissions,
  companyId,
  setPermissions
}: {
  permissions: PermissionsMap;
  currentRole: string;
  setCurrentRole: (role: string) => void;
  updatePermission: (
    module: string,
    action: keyof ModulePermission,
    value: boolean
  ) => void;
  isLoading: boolean;
  initializePermissions: () => Promise<void>;
  companyId: string;
  setPermissions: React.Dispatch<React.SetStateAction<PermissionsMap>>;
}) {
  // Update the state types to handle objects instead of strings
  const [availableStorages, setAvailableStorages] = useState<
    { _id: string; storageName: string }[]
  >([]);
  const [availableMethods, setAvailableMethods] = useState<
    { _id: string; name: string }[]
  >([]);
  const [selectedStorage, setSelectedStorage] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const displayModules = [
    { key: 'Invoice', label: 'Invoice' },
    { key: 'Customer', label: 'Customer' },
    { key: 'TransactionList', label: 'Transaction List' },
    { key: 'PendingTransaction', label: 'Pending Transaction' },
    { key: 'CSVUpload', label: 'CSV Upload' },
    { key: 'ArchiveTransaction', label: 'Archive Transaction' },
    { key: 'Report', label: 'Report' },
    { key: 'Method', label: 'Method' },
    { key: 'Storage', label: 'Storage' },
    { key: 'Category', label: 'Category' },
    { key: 'CreateUser', label: 'Create User' },
    { key: 'CompanyDetails', label: 'Company Details' }
  ];

  const roles = [
    
    { key: 'manager', label: 'Manager' },
    { key: 'user', label: 'User' },
    { key: 'audit', label: 'Audit' }
  ];

  // Update the useEffect to store objects with _id and name properties
  useEffect(() => {
    if (currentRole === 'audit' && companyId) {
      const fetchResources = async () => {
        try {
          const storagesRes = await axiosInstance.get(
            `/storages?companyId=${companyId}`
          );
          const methodsRes = await axiosInstance.get(
            `/methods/company/${companyId}`
          );

          // Modify this to store the _id along with the name
          setAvailableStorages(
            storagesRes.data.data.result.map((s: any) => ({
              _id: s._id, // Store the _id
              storageName: s.storageName // Keep the storage name
            }))
          );

          setAvailableMethods(
            methodsRes.data.data.result.map((m: any) => ({
              _id: m._id, // Store the _id
              name: m.name // Keep the method name
            }))
          );
        } catch (error) {
          console.error('Error fetching resources:', error);
        }
      };
      fetchResources();
    }
  }, [currentRole, companyId]);

  // Update the handleAddStorage function to use _id
  const handleAddStorage = async () => {
    if (!selectedStorage || !companyId) return;

    try {
      // Find the storage by _id to ensure we're adding the correct item
      const selectedStorageObj = availableStorages.find(
        (s) => s._id === selectedStorage
      );
      if (!selectedStorageObj) return;

      const updatedStorages = [
        ...(permissions.audit?.auditAccess?.storages || []),
        selectedStorageObj._id
      ];
      await axiosInstance.patch(`/permissions/${companyId}/audit/auditAccess`, {
        storages: updatedStorages
      });

      setPermissions((prev) => ({
        ...prev,
        audit: {
          ...prev.audit,
          auditAccess: {
            ...prev.audit?.auditAccess,
            storages: updatedStorages
          }
        }
      }));
      setSelectedStorage('');
    } catch (error) {
      console.error('Error adding storage:', error);
    }
  };

  // Update the handleAddMethod function to use _id
  const handleAddMethod = async () => {
    if (!selectedMethod || !companyId) return;

    try {
      // Find the method by _id to ensure we're adding the correct item
      const selectedMethodObj = availableMethods.find(
        (m) => m._id === selectedMethod
      );
      if (!selectedMethodObj) return;

      const updatedMethods = [
        ...(permissions.audit?.auditAccess?.methods || []),
        selectedMethodObj._id
      ];
      await axiosInstance.patch(`/permissions/${companyId}/audit/auditAccess`, {
        methods: updatedMethods
      });

      setPermissions((prev) => ({
        ...prev,
        audit: {
          ...prev.audit,
          auditAccess: {
            ...prev.audit?.auditAccess,
            methods: updatedMethods
          }
        }
      }));
      setSelectedMethod('');
    } catch (error) {
      console.error('Error adding method:', error);
    }
  };

  const handleRemoveStorage = async (storage: string) => {
    if (!companyId) return;

    try {
      const updatedStorages = (
        permissions.audit?.auditAccess?.storages || []
      ).filter((s) => s !== storage);
      await axiosInstance.patch(`/permissions/${companyId}/audit/auditAccess`, {
        storages: updatedStorages
      });

      setPermissions((prev) => ({
        ...prev,
        audit: {
          ...prev.audit,
          auditAccess: {
            ...prev.audit?.auditAccess,
            storages: updatedStorages
          }
        }
      }));
    } catch (error) {
      console.error('Error removing storage:', error);
    }
  };

  const handleRemoveMethod = async (method: string) => {
    if (!companyId) return;

    try {
      const updatedMethods = (
        permissions.audit?.auditAccess?.methods || []
      ).filter((m) => m !== method);
      await axiosInstance.patch(`/permissions/${companyId}/audit/auditAccess`, {
        methods: updatedMethods
      });

      setPermissions((prev) => ({
        ...prev,
        audit: {
          ...prev.audit,
          auditAccess: {
            ...prev.audit?.auditAccess,
            methods: updatedMethods
          }
        }
      }));
    } catch (error) {
      console.error('Error removing method:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <TableBody>
          <TableRow>
            <TableCell colSpan={9} className="h-32 text-center">
              <div className="flex h-10 w-full flex-col items-center justify-center">
                <div className="flex flex-row items-center gap-4">
                  <p className="font-semibold">Please Wait..</p>
                  <div className="h-5 w-5 animate-spin rounded-full border-4 border-dashed border-theme"></div>
                </div>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </div>
    );
  }

  if (error || !permissions || Object.keys(permissions).length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error || 'No permissions data found.'}</p>
        <button
          onClick={async () => {
            try {
              await initializePermissions();
              setError(null);
            } catch (err) {
              setError('Failed to initialize permissions');
            }
          }}
          className="rounded-md bg-theme px-4 py-2 text-white"
        >
          Initialize Permissions
        </button>
      </div>
    );
  }

  return (
    <div className=" overflow-hidden rounded-lg bg-white p-2 shadow-lg">
      <div className="mb-2 flex gap-2 ">
        {roles.map((role) => (
          <button
            key={role.key}
            onClick={() => setCurrentRole(role.key)}
            className={`rounded-md px-4 py-1 font-semibold ${
              currentRole === role.key
                ? 'bg-theme text-white '
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {role.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-theme text-white">
              <th className="p-4 text-left">Module</th>
              <th className="p-4 text-center">
                <div className="flex items-center justify-center">
                  <Check className="mr-2 h-4 w-4" />
                   Can View
                </div>
              </th>
              <th className="p-4 text-center">
                <div className="flex items-center justify-center">
                  <Check className="mr-2 h-4 w-4" />
                  Can Create
                </div>
              </th>
              <th className="p-4 text-center">
                <div className="flex items-center justify-center">
                  <Check className="mr-2 h-4 w-4" />
                  Can Edit
                </div>
              </th>
              <th className="p-4 text-center">
                <div className="flex items-center justify-center">
                  <Check className="mr-2 h-4 w-4" />
                  Can Delete
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {displayModules.map((module, index) => {
              const modulePermissions = permissions[currentRole]?.[
                module.key as keyof CompanyPermissions
              ] || {
                create: false,
                view: false,
                edit: false,
                delete: false
              };

              return (
                <tr
                  key={module.key}
                  className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                >
                  <td className="border-b border-gray-200 p-2">
                    {module.label}
                  </td>
                  <td className="border-b border-gray-200 p-2 text-center">
                    <input
                      type="checkbox"
                      checked={modulePermissions.view}
                      onChange={(e) =>
                        updatePermission(module.key, 'view', e.target.checked)
                      }
                      className="h-5 w-5 rounded border-gray-300 text-theme "
                    />
                  </td>
                  <td className="border-b border-gray-200 p-4 text-center">
                    <input
                      type="checkbox"
                      checked={modulePermissions.create}
                      onChange={(e) =>
                        updatePermission(module.key, 'create', e.target.checked)
                      }
                      className="h-5 w-5 rounded border-gray-300 text-theme"
                    />
                  </td>
                  <td className="border-b border-gray-200 p-4 text-center">
                    <input
                      type="checkbox"
                      checked={modulePermissions.edit}
                      onChange={(e) =>
                        updatePermission(module.key, 'edit', e.target.checked)
                      }
                      className="h-5 w-5 rounded border-gray-300 text-theme"
                    />
                  </td>
                  <td className="border-b border-gray-200 p-4 text-center">
                    <input
                      type="checkbox"
                      checked={modulePermissions.delete}
                      onChange={(e) =>
                        updatePermission(module.key, 'delete', e.target.checked)
                      }
                      className="h-5 w-5 rounded border-gray-300 text-theme"
                    />
                  </td>
                </tr>
              );
            })}

            {currentRole === 'audit' && (
              <>
                <tr className="bg-gray-50">
                  <td className="border-b border-gray-200 p-2 font-semibold">
                    Storage Access
                  </td>
                  <td colSpan={2} className="border-b border-gray-200 p-2">
                    <div className="flex flex-wrap gap-2">
                      {permissions.audit?.auditAccess?.storages?.map(
                        (storageId) => {
                          const storage = availableStorages.find(
                            (s) => s._id === storageId
                          );

                          const storageName = storage
                            ? storage.storageName
                            : 'Loading...';

                          return (
                            <div
                              key={storageId}
                              className="flex items-center rounded bg-gray-200 px-2 py-1"
                            >
                              {storageName}
                              <button
                                onClick={() => handleRemoveStorage(storageId)}
                                className="ml-1 text-red-500 hover:text-red-700"
                              >
                                ×
                              </button>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </td>
                  <td colSpan={2} className="border-b border-gray-200 p-2">
                    <div className="mt-2 flex gap-2">
                      <Select
                        onValueChange={setSelectedStorage}
                        value={selectedStorage}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select Storage" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableStorages
                            .filter(
                              (s) =>
                                !permissions.audit?.auditAccess?.storages?.includes(
                                  s._id
                                )
                            )
                            .map((storage) => (
                              <SelectItem key={storage._id} value={storage._id}>
                                {storage.storageName}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleAddStorage}
                        disabled={!selectedStorage}
                        className="rounded bg-theme px-3 py-1 text-white disabled:opacity-50"
                      >
                        Add
                      </Button>
                    </div>
                  </td>
                </tr>
                <tr className="bg-white">
                  <td className="border-b border-gray-200 p-2 font-semibold">
                    Method Access
                  </td>
                  <td colSpan={2} className="border-b border-gray-200 p-2">
                    <div className="flex flex-wrap gap-2">
                      {permissions.audit?.auditAccess?.methods?.map(
                        (methodId) => {
                          const method = availableMethods.find(
                            (m) => m._id === methodId
                          );

                          const methodName = method
                            ? method.name
                            : 'Loading...';

                          return (
                            <div
                              key={methodId}
                              className="flex items-center rounded bg-gray-200 px-2 py-1"
                            >
                              {methodName}
                              <button
                                onClick={() => handleRemoveMethod(methodId)}
                                className="ml-1 text-red-500 hover:text-red-700"
                              >
                                ×
                              </button>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </td>

                  <td colSpan={2} className="border-b border-gray-200 p-2">
                    <div className="mt-2 flex gap-2">
                      {/* Replace the Method Select component with: */}
                      <Select
                        onValueChange={setSelectedMethod}
                        value={selectedMethod}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select Method" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMethods
                            .filter(
                              (m) =>
                                !permissions.audit?.auditAccess?.methods?.includes(
                                  m._id
                                )
                            )
                            .map((method) => (
                              <SelectItem key={method._id} value={method._id}>
                                {method.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleAddMethod}
                        disabled={!selectedMethod}
                        className="rounded bg-theme px-3 py-1 text-white disabled:opacity-50"
                      >
                        Add
                      </Button>
                    </div>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function PermissionPage() {
  const { id: companyId } = useParams();
  const [permissions, setPermissions] = useState<PermissionsMap>({});
  const [currentRole, setCurrentRole] = useState<string>('manager');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initializePermissions = async () => {
    if (!companyId) return;

    setIsLoading(true);
    try {
      await axiosInstance.post(`/permissions/initialize/${companyId}`);
      const data = await fetchPermissions(companyId);
      setPermissions(data);
    } catch (error) {
      console.error('Failed to initialize permissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadPermissions = async () => {
      if (!companyId) return;

      setIsLoading(true);
      try {
        const data = await fetchPermissions(companyId);
        setPermissions(data);
      } catch (error) {
        console.error('Failed to load permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPermissions();
  }, [companyId]);

  const handleUpdatePermission = async (
    module: string,
    action: keyof ModulePermission,
    value: boolean
  ) => {
    if (!companyId || !permissions[currentRole]) return;

    const updatedPermissions = { ...permissions };
    updatedPermissions[currentRole][module as keyof CompanyPermissions][
      action
    ] = value;
    setPermissions(updatedPermissions);

    try {
      await updatePermission(companyId, currentRole, module, {
        [action]: value
      });
    } catch (error) {
      console.error('Failed to update permission:', error);
      setPermissions(permissions); // Revert on error
    }
  };

  return (
    <div className="min-h-screen">
      <PermissionManager
        permissions={permissions}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        updatePermission={handleUpdatePermission}
        isLoading={isLoading}
        initializePermissions={initializePermissions}
        companyId={companyId || ''}
        setPermissions={setPermissions}
      />
    </div>
  );
}
