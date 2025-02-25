import { Layers } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { SignUpForm } from '../components/sign-up-form';
import card from '../../../assets/imges/home/logos/money.png';

export default function SignUpPage() {
  return (
    // Left Section
    <div className="flex min-h-screen ">
      <div className="flex w-full items-center justify-center bg-gray-50 px-8 lg:w-1/2">
        <div className="flex w-full max-w-md flex-col items-center space-y-8 py-6">
          <div className=" top-16 flex items-center justify-between gap-2 text-[#a78bfa]">
            <Layers className="h-10 w-10" />
            <span className="text-3xl font-semibold">Accounting Software</span>
          </div>

          {/* navlink */}
          <div className="flex w-4/5 justify-between  gap-x-2   rounded-2xl bg-gray-200 px-2 py-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex w-1/2 items-center justify-center rounded-xl py-2 font-semibold ${
                  isActive
                    ? 'bg-[#a78bfa] text-black'
                    : 'text-gray-600 hover:text-black'
                }`
              }
            >
              Sign In
            </NavLink>
            <NavLink
              to="/signup"
              className={({ isActive }) =>
                `flex w-1/2 items-center justify-center rounded-xl py-2 font-semibold ${
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
          <div className="w-4/5 rounded-md  ">
            <div className="mb-4 flex flex-col space-y-2 text-left">
              <h2 className="text-3xl font-bold">Create an account</h2>
              <p className="text-sm text-muted-foreground">
                {/* Enter your email and password to create an account. <br /> */}
                Already have an account?{' '}
                <Link
                  to="/"
                  className="text-[#a78bfa] underline underline-offset-4 hover:text-black"
                >
                  Sign In
                </Link>
              </p>
            </div>
            <SignUpForm />
            <p className="mt-4 px-8 text-center text-sm text-muted-foreground">
              By creating an account, you agree to our{' '}
              <a
                href="/terms"
                className="underline underline-offset-4 hover:text-black"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="/privacy"
                className="underline underline-offset-4 hover:text-black"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
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
            Record. Review. Report – Smarter Accounting for Smarter Decisions.
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
