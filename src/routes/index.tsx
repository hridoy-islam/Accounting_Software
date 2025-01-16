import ProtectedRoute from '@/components/shared/ProtectedRoute';
import ForgotPassword from '@/pages/auth/forget-password';
import SignUpPage from '@/pages/auth/sign-up';
import NotFound from '@/pages/not-found';
// import ProfilePage from '@/pages/profile';
import { Suspense, lazy } from 'react';
import { Navigate, Outlet, useRoutes } from 'react-router-dom';
// import NotificationsPage from '@/pages/notification';
import Otp from '@/pages/auth/otp';

import AdminLayout from '@/components/layout/admin-layout';
// import StudentsPage from '@/pages/students';


import { Company } from '@/pages/company/index';


import { Dashboard } from '@/pages/dashboard/index';
import { Method } from '@/pages/method';
import  CompanyDetails  from '@/pages/company/companyDetails';
import QRPage from '@/pages/auth/qr';
import UserPage from '@/pages/users';
import { CategoryManagement } from '@/pages/category';
import ReportPage from '@/pages/company/companyDetails/reportPage';
import TransactionPage from '@/pages/company/companyDetails/transactionPage';
import ProfilePage from '@/pages/profile';
import ResetPassword from '@/pages/resetPassword';
import StoragePage from '@/pages/company/companyDetails/storagePage';
import CompanyUser from '@/pages/company/companyDetails/companyUser';




const SignInPage = lazy(() => import('@/pages/auth/signin'));


// ----------------------------------------------------------------------

export default function AppRouter() {
  const adminRoutes = [
    {
      path: '/admin',
      element: (
        <AdminLayout>
          <ProtectedRoute>
            <Suspense>
              <Outlet />
            </Suspense>
            </ProtectedRoute>
        </AdminLayout>
      ),
      children: [
        { path:'',
          element: <Dashboard />,
          index:true
     
        },
        {
          path: 'companies',
          element: <Company />
        },
        {
          path: 'companies/:id',
          element: <CompanyDetails  />
        },
        {
          path: 'companies/:id/transactions',
          element: <TransactionPage  />
        },
        {
          path: 'companies/:id/reports',
          element: <ReportPage  />
        },
        {
          path: 'companies/:id/storages',
          element: <StoragePage  />
        },
        {
          path: 'companies/:id/users',
          element: <CompanyUser  />
        },
        {
          path: 'categories',
          element: <CategoryManagement />
        },
        {
          path: 'methods',
          element: <Method />
        },
        {
          path: 'users',
          element: <UserPage />
        },
        
        {
          path: 'profile',
          element: <ProfilePage />
        },
        {
          path: 'reset',
          element:<ResetPassword />
         
        }
        
      ]
    }
  ];

  const publicRoutes = [
    {
      path: '/',
      element: <SignInPage />,
      index: true
    },
    {
      path: '/signup',
      element: <SignUpPage />,
      index: true
    },
    {
      path: '/qr',
      element: <QRPage />,
      index: true
    },
    {
      path: '/forgot-password',
      element: <ForgotPassword />,
      index: true
    },
    {
      path: '/otp',
      element: <Otp />,
      index: true
    },
    
    {
      path: '/404',
      element: <NotFound />
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />
    }
  ];

  const routes = useRoutes([...publicRoutes, ...adminRoutes]);

  return routes;
}
