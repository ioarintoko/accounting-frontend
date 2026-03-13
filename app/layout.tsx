'use client'
import "./globals.css";
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // Logic buat deteksi halaman aktif

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Accounts', path: '/accounts' },
    { name: 'Journals', path: '/journals' },
    { name: 'Invoices', path: '/invoices' },
  ];

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#FDFCF0', display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'sans-serif' }}>
        
        {/* SIDEBAR */}
        <aside style={{ 
          width: '280px', 
          backgroundColor: '#001F3F', 
          color: 'white', 
          display: 'flex', 
          flexDirection: 'column', 
          flexShrink: 0,
          boxShadow: '4px 0 15px rgba(0,0,0,0.2)',
          zIndex: 100
        }}>
          <div style={{ padding: '40px 30px' }}>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 900, letterSpacing: '-1px', color: '#C5A059' }}>
              KHONIC<span style={{ color: 'white' }}>.</span>
            </h1>
            <p style={{ margin: '8px 0 0', fontSize: '10px', opacity: 0.3, letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 900 }}>Accounting System</p>
          </div>
          
          <nav style={{ flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navItems.map((item) => {
              const isActive = pathname === item.path; // Cek apakah path cocok
              
              return (
                <a 
                  key={item.name}
                  href={item.path}
                  style={{ 
                    display: 'block',
                    padding: '15px 20px', 
                    borderRadius: '16px', 
                    // BACKGROUND PINDAH-PINDAH DISINI
                    backgroundColor: isActive ? '#C5A059' : 'transparent', 
                    color: isActive ? '#001F3F' : 'rgba(255,255,255,0.5)', 
                    textDecoration: 'none', 
                    fontSize: '12px', 
                    fontWeight: 900, 
                    textTransform: 'uppercase', 
                    letterSpacing: '1px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {item.name}
                </a>
              );
            })}
          </nav>

          {/* USER INFO */}
          <div style={{ padding: '30px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', borderRadius: '15px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#C5A059', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#001F3F' }}>B</div>
                <div>
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: 900, color: 'white' }}>BRAMANTIO G.</p>
                  <p style={{ margin: 0, fontSize: '9px', fontWeight: 900, color: '#C5A059', letterSpacing: '1px' }}>SUPER ADMIN</p>
                </div>
             </div>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '60px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}