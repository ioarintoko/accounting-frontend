/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useRouter } from 'next/navigation'; // INI YANG BENAR
import { useEffect, useState } from 'react';

export default function JournalsPage() {
  const router = useRouter();
  // State dengan type any[] untuk menghindari error 'never[]'
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/journals')
      .then(res => res.json())
      .then(data => {
        // Mapping data agar fleksibel dengan format Object atau Array langsung
        if (Array.isArray(data)) {
          setJournals(data);
        } else if (data && Array.isArray(data.data)) {
          setJournals(data.data);
        } else {
          console.error("Format API tidak sesuai:", data);
          setJournals([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetch journals:", err);
        setJournals([]);
        setLoading(false);
      });
  }, []);

  const formatIDR = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ height: '2px', width: '30px', backgroundColor: '#C5A059' }}></div>
            <span style={{ fontSize: '10px', fontWeight: 900, color: '#C5A059', letterSpacing: '3px', textTransform: 'uppercase' }}>General Ledger</span>
          </div>
          <h2 style={{ fontSize: '48px', fontWeight: 900, color: '#001F3F', margin: 0, letterSpacing: '-2px' }}>Journals</h2>
          {/* TOMBOL ADD BARU */}
      <button 
        onClick={() => router.push('/journals/add')}
        style={{
          backgroundColor: '#001F3F',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,31,63,0.2)'
        }}
      >
        + New Entry
      </button>
        </div>
        
        <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: 900, color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Entries</p>
            <h4 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#001F3F' }}>
                {journals.length} <span style={{fontSize: '12px', opacity: 0.4}}>Recs</span>
            </h4>
        </div>
      </div>

      {/* JOURNAL TABLE */}
      <div style={{ backgroundColor: 'white', borderRadius: '40px', overflow: 'hidden', border: '1px solid #eee', boxShadow: '0 10px 40px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee', backgroundColor: '#F9FAFB' }}>
              {['Date', 'Reference', 'Account / Description', 'Debit', 'Credit'].map((head) => (
                <th key={head} style={{ padding: '25px 40px', textAlign: head.includes('it') ? 'right' : 'left', fontSize: '11px', fontWeight: 900, color: '#aaa', textTransform: 'uppercase', letterSpacing: '2px' }}>{head}</th>
              ))}
            </tr>
          </thead>
          <tbody style={{ opacity: loading ? 0.5 : 1 }}>
  {journals.length > 0 ? (
    journals.map((j: any, i: number) => (
      // Satu transaksi bisa punya banyak baris (items)
      j.items?.map((item: any, idx: number) => (
        <tr key={`${i}-${idx}`} style={{ borderBottom: idx === j.items.length - 1 ? '2px solid #eee' : '1px solid #f9f9f9' }}>
          {/* Tanggal & Ref cuma muncul di baris pertama tiap transaksi biar nggak rame */}
          <td style={{ padding: '20px 40px', fontSize: '13px', color: '#666', fontWeight: 600 }}>
            {idx === 0 ? new Date(j.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : ''}
          </td>
          <td style={{ padding: '20px 40px', fontWeight: 900, color: '#001F3F', fontSize: '13px' }}>
            {idx === 0 ? (j.reference || 'REF-GEN') : ''}
          </td>
          
          {/* Detail Akun & Deskripsi */}
          <td style={{ padding: '20px 40px' }}>
            <div style={{ fontWeight: 800, color: '#001F3F', fontSize: '14px' }}>
              {/* Kalau backend belum include account object, pakai accountName/accountId */}
              {item.account?.name || item.accountName || 'Unnamed Account'}
            </div>
            {idx === 0 && (
              <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>{j.description}</div>
            )}
          </td>

          {/* Nominal Debit & Kredit */}
          <td style={{ padding: '20px 40px', textAlign: 'right', fontWeight: 800, color: '#001F3F', fontSize: '14px' }}>
            {item.debit > 0 ? formatIDR(item.debit) : '-'}
          </td>
          <td style={{ padding: '20px 40px', textAlign: 'right', fontWeight: 800, color: '#C5A059', fontSize: '14px' }}>
            {item.credit > 0 ? formatIDR(item.credit) : '-'}
          </td>
        </tr>
      ))
    ))
  ) : (
    <tr>
      <td colSpan={5} style={{ padding: '100px', textAlign: 'center' }}>No Data</td>
    </tr>
  )}
</tbody>
        </table>
      </div>

      {/* FOOTER ACTION */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button style={{ 
            backgroundColor: 'transparent', 
            border: '2px solid #001F3F', 
            padding: '12px 30px', 
            borderRadius: '15px', 
            fontSize: '11px', 
            fontWeight: 900, 
            textTransform: 'uppercase', 
            letterSpacing: '1px',
            cursor: 'pointer',
            color: '#001F3F',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#001F3F';
            e.currentTarget.style.color = 'white';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#001F3F';
          }}
          >
            Download Ledger Report (CSV)
          </button>
      </div>
    </div>
  );
}