import React, { useState } from 'react'

const Login = () => {
  const [isLoginForm, setIsLoginForm] = useState(true)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isLoginForm) {
      console.log('Logging in with:', { email, password })
    } else {
      console.log('Signing up with:', { firstName, lastName, email, password })
    }
  }

  const handleGoogleLogin = () => {
    console.log('Initiating Google OAuth login...')
  }

  const handleGithubLogin = () => {
    console.log('Initiating GitHub OAuth login...')
  }

  const toggleForm = () => {
    setIsLoginForm((prev) => !prev)
  }

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center bg-base-200 p-4">
      <div className="card card-border bg-base-100 w-full max-w-md shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl font-bold">DevTinder</h2>
          <p className="text-center text-sm opacity-70">
            {isLoginForm
              ? 'Welcome back! Sign in to find your code match'
              : 'Create an account to join the developer community'}
          </p>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
            {!isLoginForm && (
              <div className="flex gap-3">
                <fieldset className="fieldset w-1/2">
                  <legend className="fieldset-legend">First Name</legend>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Alex"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </fieldset>
                <fieldset className="fieldset w-1/2">
                  <legend className="fieldset-legend">Last Name</legend>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Rivera"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </fieldset>
              </div>
            )}

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Email</legend>
              <input
                type="email"
                className="input w-full"
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Password</legend>
              <input
                type="password"
                className="input w-full"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {isLoginForm && (
                <div className="flex justify-end pt-1">
                  <a href="#forgot" className="link link-hover text-xs">
                    Forgot password?
                  </a>
                </div>
              )}
            </fieldset>

            <div className="card-actions mt-2">
              <button type="submit" className="btn btn-primary btn-block">
                {isLoginForm ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </form>

          <div className="divider text-xs opacity-60">OR CONTINUE WITH</div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="btn btn-outline flex-1 gap-2"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Google
            </button>

            <button
              type="button"
              onClick={handleGithubLogin}
              className="btn btn-outline flex-1 gap-2"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </button>
          </div>

          <div className="divider text-xs opacity-60"></div>

          <p className="text-center text-sm">
            {isLoginForm ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={toggleForm}
                  className="link link-hover font-medium text-primary cursor-pointer"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={toggleForm}
                  className="link link-hover font-medium text-primary cursor-pointer"
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login