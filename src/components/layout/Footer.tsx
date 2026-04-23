export function Footer() {
  return (
    <footer className="border-t border-navy/10 bg-[#F5F0E8] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Logo + tagline */}
          <div className="text-center sm:text-left">
            <p className="font-display text-lg font-bold text-navy">
              Brick
              <span style={{ color: '#E3000B' }}>l</span>
              <span style={{ color: '#006CB7' }}>a</span>
              <span style={{ color: '#FFD700' }}>c</span>
              <span style={{ color: '#00A650' }}>k</span>
            </p>
            <p className="text-xs text-navy/60 font-body mt-0.5">
              Rebuild your sets, piece by piece.
            </p>
          </div>

          {/* Credits */}
          <div className="text-center sm:text-right space-y-0.5">
            <p className="text-xs text-navy/50 font-mono">
              Data via{' '}
              <span className="text-navy/65">Rebrickable</span>
              {' · '}
              <span className="text-navy/65">LEGO®</span>
            </p>
            <p className="text-xs text-navy/50 font-mono">
              Powered by{' '}
              <a
                href="https://m-estrada.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy/65 hover:text-navy transition-colors"
              >
                Manuel Estrada
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
