export default function Footer() {
  return (
    <footer className="border-t border-[rgb(var(--border-glass)_/_0.1)] bg-[rgb(var(--bg-glass)_/_0.3)] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Logo and tagline */}
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] bg-clip-text text-transparent mb-2">
              CoachDesk
            </h3>
            <p className="text-sm text-[rgb(var(--text-secondary))]">
              Premium concierge services, redefined.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <a href="#destinations" className="text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent-primary))] transition-colors">
                Destinations
              </a>
              <a href="#tiers" className="text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent-primary))] transition-colors">
                Membership
              </a>
              <a href="#testimonials" className="text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent-primary))] transition-colors">
                Testimonials
              </a>
              <a href="#concierge" className="text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent-primary))] transition-colors">
                Request Help
              </a>
            </nav>
          </div>

          {/* Image credits */}
          <div>
            <h4 className="font-semibold mb-4">Image Credits</h4>
            <p className="text-sm text-[rgb(var(--text-secondary))]">
              Images via <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="hover:text-[rgb(var(--accent-primary))] transition-colors">Unsplash</a> / <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="hover:text-[rgb(var(--accent-primary))] transition-colors">Pexels</a>.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-[rgb(var(--border-glass)_/_0.1)] text-center text-sm text-[rgb(var(--text-secondary))]">
          <p>&copy; {new Date().getFullYear()} CoachDesk. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
