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
import QRPage from '@/pages/auth/qr';
import UserPage from '@/pages/users';
import CategoriesPage from '@/pages/category';
import ProfilePage from '@/pages/profile';
import ResetPassword from '@/pages/resetPassword';

import TransactionHistory from '@/pages/transactionHistory';
import StoragePage from '@/pages/storage';
import TransactionPage from '@/pages/transaction';
import ReportPage from '@/pages/report';

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
        {
          element: <Dashboard />,
          index: true
        },
        {
          path: 'companies',
          element: <Company />
        },
        {
          path: 'company/:id',
          element: <TransactionHistory />
        },
        {
          path: 'company/:id/categories',
          element: <CategoriesPage />
        },
        {
          path: 'company/:id/storages',
          element: < StoragePage/>
        },
        {
          path: 'company/:id/methods',
          element: <Method />
        },
        {
          path: 'company/:id/transactions',
          element: <TransactionPage />
        },
        {
          path: 'company/:id/report',
          element: <ReportPage />
        },
        {
          path: 'company/:id/users',
          element: <UserPage />
        },

        {
          path: 'profile',
          element: <ProfilePage />
        },
        {
          path: 'reset',
          element: <ResetPassword />

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
