import React from 'react'

const Profile = () => {
  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center bg-base-200 p-4">
      <div className="card card-border bg-base-100 w-full max-w-lg shadow-xl">
        <div className="card-body items-center text-center">
          <div className="avatar avatar-online mb-2">
            <div className="w-24 rounded-full ring-4 ring-primary/20">
              <img
                src="https://picsum.photos/200/200?random=42"
                alt="Profile Avatar"
              />
            </div>
          </div>
          <h2 className="card-title text-2xl font-bold">Alex Rivera</h2>
          <p className="text-sm opacity-70">Senior Full-Stack Engineer • React / Node / Go</p>
          
          <div className="my-2 flex flex-wrap justify-center gap-1.5">
            <span className="badge badge-primary badge-soft">TypeScript</span>
            <span className="badge badge-secondary badge-soft">React 19</span>
            <span className="badge badge-accent badge-soft">Node.js</span>
            <span className="badge badge-neutral badge-soft">Tailwind v4</span>
            <span className="badge badge-info badge-soft">Docker</span>
          </div>

          <p className="text-sm text-base-content/80 mt-2 max-w-md">
            Building open-source developer tooling and seeking pair programming partners for full-stack AI projects.
          </p>

          <div className="card-actions mt-6 w-full justify-center gap-3">
            <button className="btn btn-primary">Edit Profile</button>
            <button className="btn btn-outline">My Connections</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile