import ProtectedRoute from '@/components/shared/ProtectedRoute';
import ForgotPassword from '@/pages/auth/forget-password';
import SignUpPage from '@/pages/auth/sign-up';
import NotFound from '@/pages/not-found';
// import ProfilePage from '@/pages/profile';
import { Suspense, lazy } from 'react';
import { Navigate, Outlet, useRoutes } from 'react-router-dom';
// import NotificationsPage from '@/pages/notification';
import Otp from '@/pages/auth/otp';
import NewPassword from '@/pages/new-password';
import AdminLayout from '@/components/layout/admin-layout';
// import StudentsPage from '@/pages/students';
import { StudentQuiz } from '@/pages/students/quiz';
import InstitutionsPage from '@/pages/institutions';
import CoursesPage from '@/pages/courses';
import TermsPage from '@/pages/terms';
import AcademicYearPage from '@/pages/academic-year';
import StaffPage from '@/pages/staff';
import AgentsPage from '@/pages/agent';
import CourseRelationPage from '@/pages/course-relation';
// import StudentViewPage from '@/pages/students/view';

import { Company } from '@/pages/company/index';
import { StorageManagement } from '@/components/shared/StorageManagement';

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
