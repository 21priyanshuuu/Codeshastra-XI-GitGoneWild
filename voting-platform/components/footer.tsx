export function Footer() {
  return (
    <footer className="bg-black/60 border-t border-gray-800 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4 text-white">Secure Blockchain Voting</h3>
            <p className="text-gray-400 mb-4">
              Our platform combines blockchain technology, zero-knowledge proofs, and facial recognition to provide the
              most secure and transparent voting experience.
            </p>
            <p className="text-gray-500">© {new Date().getFullYear()} Secure Voting Platform. All rights reserved.</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Platform</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/about" className="hover:text-purple-400 transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="/elections" className="hover:text-purple-400 transition-colors">
                  Elections
                </a>
              </li>
              <li>
                <a href="/how-it-works" className="hover:text-purple-400 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/security" className="hover:text-purple-400 transition-colors">
                  Security
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Resources</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/documentation" className="hover:text-purple-400 transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="/faq" className="hover:text-purple-400 transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/support" className="hover:text-purple-400 transition-colors">
                  Support
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-purple-400 transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}

