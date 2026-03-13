/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useEffect, useState } from 'react';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://accounting-backend-murex.vercel.app/accounts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAccounts(data);
        } else if (data && Array.isArray(data.data)) {
          setAccounts(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetch accounts:", err);
        setLoading(false);
      });
  }, []);

  // Helper untuk warna label kategori
  const getCategoryColor = (category: string) => {
    const cat = category?.toLowerCase();
    if (cat?.includes('asset')) return '#001F3F'; // Navy
    if (cat?.includes('revenue')) return '#C5A059'; // Gold
    if (cat?.includes('expense')) return '#666'; // Grey
    return '#aaa';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ height: '2px', width: '30px', backgroundColor: '#C5A059' }}></div>
            <span style={{ fontSize: '10px', fontWeight: 900, color: '#C5A059', letterSpacing: '3px', textTransform: 'uppercase' }}>Structure</span>
          </div>
          <h2 style={{ fontSize: '48px', fontWeight: 900, color: '#001F3F', margin: 0, letterSpacing: '-2px' }}>Chart of Accounts</h2>
        </div>
      </div>

      {/* GRID LAYOUT UNTUK ACCOUNTS */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
        gap: '24px',
        opacity: loading ? 0.6 : 1 
      }}>
        {accounts.length > 0 ? accounts.map((acc: any, i: number) => (
          <div key={i} style={{ 
            backgroundColor: 'white', 
            padding: '32px', 
            borderRadius: '30px', 
            border: '1px solid #eee',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Category Indicator */}
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '6px', 
              height: '100%', 
              backgroundColor: getCategoryColor(acc.category) 
            }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: 0, fontSize: '10px', fontWeight: 900, color: '#aaa', letterSpacing: '1px' }}>{acc.code || 'NO-CODE'}</p>
                <h4 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 900, color: '#001F3F' }}>{acc.name}</h4>
              </div>
              <span style={{ 
                fontSize: '9px', 
                fontWeight: 900, 
                padding: '4px 10px', 
                borderRadius: '8px', 
                backgroundColor: '#F9FAFB', 
                color: getCategoryColor(acc.category),
                border: `1px solid ${getCategoryColor(acc.category)}22`,
                textTransform: 'uppercase'
              }}>
                {acc.category}
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '12px', color: '#888', fontStyle: 'italic', lineHeight: 1.5 }}>
              {acc.description || 'No description provided for this account.'}
            </p>

            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#001F3F' }}>Current Balance</span>
                <span style={{ fontSize: '14px', fontWeight: 900, color: acc.balance < 0 ? '#e11d48' : '#001F3F' }}>
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(acc.balance || 0)}
                </span>
            </div>
          </div>
        )) : (
          <div style={{ gridColumn: '1/-1', padding: '100px', textAlign: 'center', color: '#aaa', fontWeight: 700 }}>
            {loading ? 'Initializing Accounts...' : 'No accounts found.'}
          </div>
        )}
      </div>
    </div>
  );
}