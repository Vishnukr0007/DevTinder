import React from 'react'

const Footer = () => {
  return (
    <footer className="border-t border-base-300 bg-base-200 text-base-content">
      {/* Main Footer Links */}
      <div className="footer sm:footer-horizontal mx-auto max-w-7xl p-8 lg:p-12">
        {/* Brand Column */}
        <aside className="max-w-xs">
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-content shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M12.378 1.602a.75.75 0 0 0-.756 0A9.014 9.014 0 0 0 7.5 9.387v.613a4.5 4.5 0 0 0 4.5 4.5h.001a4.5 4.5 0 0 0 4.499-4.5v-.613c0-3.328-1.782-6.38-4.122-7.785ZM6 10.5a6 6 0 0 1 6-6 6 6 0 0 1 6 6v.5a6 6 0 1 1-12 0v-.5Z" />
                <path d="M12 13.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
              </svg>
            </span>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              DevTinder
            </span>
          </div>
          <p className="mt-2 text-sm text-base-content/70 leading-relaxed">
            The platform for developers to swipe, connect, pair program, and build amazing open-source projects together.
          </p>
          <div className="mt-3 flex gap-2">
            <span className="badge badge-primary badge-soft badge-xs">100% Free</span>
            <span className="badge badge-success badge-soft badge-xs">Active Community</span>
          </div>
        </aside>

        {/* Navigation Columns */}
        <nav>
          <h6 className="footer-title">Features</h6>
          <a href="#discover" className="link link-hover text-sm">Discover Developers</a>
          <a href="#matchmaking" className="link link-hover text-sm">Smart Matchmaking</a>
          <a href="#projects" className="link link-hover text-sm">Pair Projects</a>
          <a href="#hackathons" className="link link-hover text-sm">Hackathon Teams</a>
        </nav>

        <nav>
          <h6 className="footer-title">Tech Stacks</h6>
          <a href="#react" className="link link-hover text-sm">React & Next.js</a>
          <a href="#nodejs" className="link link-hover text-sm">Node.js & Express</a>
          <a href="#python" className="link link-hover text-sm">Python & AI / ML</a>
          <a href="#golang" className="link link-hover text-sm">Go & Cloud Native</a>
        </nav>

        <nav>
          <h6 className="footer-title">Community & Legal</h6>
          <a href="#community" className="link link-hover text-sm">Discord Community</a>
          <a href="#github" className="link link-hover text-sm">GitHub Repository</a>
          <a href="#conduct" className="link link-hover text-sm">Code of Conduct</a>
          <a href="#privacy" className="link link-hover text-sm">Privacy Policy</a>
        </nav>
      </div>

      {/* Bottom Bar / Copyright */}
      <div className="border-t border-base-300/60 bg-base-300/40">
        <div className="footer footer-center mx-auto max-w-7xl p-4 text-xs text-base-content/60">
          <p>© {new Date().getFullYear()} DevTinder. Built for developers by developers with ❤️ and daisyUI.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer