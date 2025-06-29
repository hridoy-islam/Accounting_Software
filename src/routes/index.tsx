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
import CsvUploadPage from '@/pages/csv';
import CompanyLayout from '@/components/layout/company-layout';
import ArchivePage from '@/pages/archive';
import InvoicePage from '@/pages/invoice';
import CustomerPage from '@/pages/invoice/customer';
import CustomerDetailsPage from '@/pages/invoice/customer/details';
import PendingTransactionPage from '@/pages/pending';
import CompanyDetailsPage from '@/pages/company-details';
import CreateInvoice from '@/pages/invoice/components/createInvoice';
import EditInvoice from '@/pages/invoice/components/editInvoice';
import PermissionPage from '@/pages/permission';
import BankPage from '@/pages/invoice/bank';
import BankDetailsPage from '@/pages/invoice/bank/details';

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
          element: (
            <CompanyLayout>
              <TransactionHistory />
            </CompanyLayout>
          )
        },
        {
          path: 'company/:id/categories',
          element: (
            <CompanyLayout>
              <CategoriesPage />
            </CompanyLayout>
          )
        },
        {
          path: 'company/:id/storages',
          element: (
            <CompanyLayout>
              <StoragePage />
            </CompanyLayout>
          )
        },
        {
          path: 'company/:id/methods',
          element: (
            <CompanyLayout>
              <Method />
            </CompanyLayout>
          )
        },
        {
          path: 'company/:id/transactions',
          element: (
            <CompanyLayout>
              <TransactionPage />
            </CompanyLayout>
          )
        },
        {
          path: 'company/:id/report',
          element: (
            <CompanyLayout>
              <ReportPage />
            </CompanyLayout>
          )
        },
        {
          path: 'company/:id/csv',
          element: (
            <CompanyLayout>
              <CsvUploadPage />
            </CompanyLayout>
          )
        },
        {
          path: 'company/:id/users',
          element: (
            <CompanyLayout>
              <UserPage />
            </CompanyLayout>
          )
        },
        {
          path: 'company/:id/archive',
          element: (
            <CompanyLayout>
              <ArchivePage />
            </CompanyLayout>
          )
        },
        {
          path: 'company/:id/invoice',
          element: (
            <CompanyLayout>
              <InvoicePage />
            </CompanyLayout>
          )
        },
        {
          path: 'company/:id/invoice/bank-list',
          element: (
            <CompanyLayout>
              <BankPage />
            </CompanyLayout>
          )
        },
        {
          path: 'company/:id/invoice/bank-list/:bankId',
          element: (
            <CompanyLayout>
              <BankDetailsPage />
            </CompanyLayout>
          )
        },
        {
          path: 'company/:id/invoice/new',
          element: (
            <CompanyLayout>
              <CreateInvoice />
            </CompanyLayout>
          )
        },
        {
          path: 'company/:id/invoice/:invoiceId',
          element: (
            <CompanyLayout>
              <EditInvoice />
            </CompanyLayout>
          )
        },
        {
          path: 'company/:id/invoice/customer',
          element: (
            <CompanyLayout>
              <CustomerPage />
            </CompanyLayout>
          )
        },
        {
          path: 'company/:id/invoice/customer/:cid',
          element: (
            <CompanyLayout>
              <CustomerDetailsPage />
            </CompanyLayout>
          )
        },
        {
          path: 'company/:id/pending',
          element: (
            <CompanyLayout>
              <PendingTransactionPage />
            </CompanyLayout>
          )
        },
        {
          path: 'company/:id/company-details',
          element: (
            <CompanyLayout>
              <CompanyDetailsPage />
            </CompanyLayout>
          )
        },
        {
          path: 'company/:id/permission',
          element: (
            <CompanyLayout>
              <PermissionPage />
            </CompanyLayout>
          )
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
