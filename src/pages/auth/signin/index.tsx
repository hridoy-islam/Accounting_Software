import { Layers } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {  NavLink, useNavigate } from 'react-router-dom';
import UserAuthForm from './components/user-auth-form';
import card from '../../../assets/imges/home/logos/money.png'

export default function SignInPage() {
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  const [theme, setTheme] = useState<string | null>(null);


  useEffect(() => {
    if (theme) {
      document.documentElement.style.setProperty("--theme", theme);
    }
  }, [theme]);


  useEffect(() => {
    if (!user) return;

    let themeColor = "#a78bfa";

    if (user.role === "company" && user.companyId?.themeColor) {
      themeColor = user.companyId.themeColor;
    }

    localStorage.setItem("themeColor", themeColor);
    setTheme(themeColor);

    // Redirect user based on role
    if (user.role === "admin") {
      navigate("/admin");
    } else if (user.role === "company") {
      navigate(`/admin/company/${user._id}`);
    } else if (user.role === "user") {
      navigate(`/admin/company/${user.companyId}`);
    }
  }, [user, navigate]);


  return (
    <div className="flex min-h-screen ">

       {/* left Section */}
       <div className="flex w-full items-center justify-center bg-gray-50 px-8 lg:w-1/2 ">
        <div className="flex flex-col w-full items-center max-w-md space-y-8 py-6">
          {/* Logo */}
          <div className="flex top-16 items-center gap-2 text-[#a78bfa] justify-between">
            <Layers className="h-10 w-10" />
            <span className="text-3xl font-semibold">Accounting Software</span>
          </div>
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold pb-2">Welcome Back</h2>
            <p className='font-semibold text-sm text-gray-500'>Access Your Financial Hub Securely</p>
          </div>
          {/* navlink */}
          <div className="flex w-4/5 justify-between  gap-x-2   bg-gray-200 py-2 px-2 rounded-2xl">
            <NavLink
              to="/"
              className={({ isActive  }) =>
                `w-1/2 py-2 items-center justify-center flex rounded-xl font-semibold ${
                  isActive
                    ? 'bg-background text-white'
                    : ''
                }`
              }
            >
              Sign In
            </NavLink>
            <NavLink
              to="/signup"
              className={({ isActive }) =>
                `w-1/2 py-2 items-center justify-center flex rounded-xl font-semibold ${
                  isActive
                    ? 'bg-background text-white'
                    : 'text-gray-500 hover:text-black'
                }`
              }
            >
              Sign Up
            </NavLink>
            <NavLink
              to="/qr"
              className={({ isActive }) =>
                `w-1/2 py-2 items-center justify-center flex rounded-xl font-semibold ${
                  isActive
                    ? 'bg-background text-white'
                    : 'text-gray-500 hover:text-black'
                }`
              }
            >
              QR Sign Up
            </NavLink>
          </div>

          <UserAuthForm />
        </div>
      </div>

      {/* right section */}
      <div className="relative hidden w-1/2 items-center justify-center bg-[#a78bfa] lg:flex">
        <div className="flex h-full flex-col items-center justify-center p-8">
          {/* Main Content */}
          <div className="flex flex-col justify-center items-center relative z-10 text-center">
            <div className="mb-8">
              <img
                src={card}
                alt="Desk illustration"
                width={600}
                height={500}
              />
            </div>
            <h1 className="mb-4 text-4xl font-bold text-accent">
            Your Gateway to Secure and Efficient Accounting Starts Here.
            </h1>
            {/* <p className="text-lg text-gray-300">
          Start managing your admissions with ease.
        </p> */}
          </div>
        </div>
      </div>

     
    </div>
  );
}
