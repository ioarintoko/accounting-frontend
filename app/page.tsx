/* eslint-disable react/no-unescaped-entities */
'use client'
import { useEffect, useState } from 'react';

export default function Home() {
  const [stats, setStats] = useState({ paid: 0, pending: 0 });
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Tarik data statistik (Revenue & Receivables)
        const statsRes = await fetch('http://localhost:3000/invoices/stats');
        const statsData = await statsRes.json();
        setStats(statsData);

        // Tarik data list untuk hitung jumlah invoice
        const listRes = await fetch('http://localhost:3000/invoices');
        const listData = await listRes.json();
        setInvoiceCount(listData.length);
        
        setLoading(false);
      } catch (err) {
        console.error("Gagal ambil data dashboard:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format currency helper
  const formatIDR = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '60px', animation: 'fadeIn 0.8s ease-out', opacity: loading ? 0.5 : 1, transition: 'opacity 0.5s' }}>
      
      {/* HEADER SECTION */}
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
           <div style={{ width: '40px', backgroundColor: '#C5A059', height: '2px' }}></div>
           <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px', color: '#C5A059' }}>
             Executive Overview
           </span>
        </div>
        <h2 style={{ fontSize: '56px', fontWeight: 900, color: '#001F3F', letterSpacing: '-2px', margin: 0, lineHeight: 1 }}>
          Welcome back, <br />
          <span style={{ color: '#C5A059' }}>Bramantio Galih.</span>
        </h2>
        <p style={{ marginTop: '24px', color: '#666', fontSize: '18px', fontStyle: 'italic', maxWidth: '600px', borderLeft: '4px solid #C5A059', paddingLeft: '20px' }}>
          "Productivity is being able to do things that you were never able to do before."
        </p>
      </header>
      
      {/* GRID STATS */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '32px', 
        width: '100%' 
      }}>
        
        {/* Card 1 - Total Revenue (From PAID stats) */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '40px', 
          borderRadius: '40px', 
          border: '1px solid #eee', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          height: '240px' 
        }}>
          <p style={{ margin: 0, fontSize: '11px', fontWeight: 900, color: '#aaa', textTransform: 'uppercase', letterSpacing: '2px' }}>Total Revenue</p>
          <h3 style={{ margin: 0, fontSize: '36px', fontWeight: 900, color: '#001F3F' }}>
            {loading ? '---' : formatIDR(stats.paid)}
          </h3>
        </div>

        {/* Card 2 - Active Invoices (Real Count) */}
        <div style={{ 
          backgroundColor: '#001F3F', 
          padding: '40px', 
          borderRadius: '40px', 
          boxShadow: '0 20px 40px rgba(0,31,63,0.2)',
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          height: '240px',
          color: 'white'
        }}>
          <p style={{ margin: 0, fontSize: '11px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px' }}>Total Documents</p>
          <h3 style={{ margin: 0, fontSize: '48px', fontWeight: 900 }}>
            {loading ? '-' : invoiceCount} <span style={{ fontSize: '14px', opacity: 0.3, letterSpacing: '2px' }}>ITEMS</span>
          </h3>
        </div>

        {/* Card 3 - Receivables (From PENDING stats) */}
        <div style={{ 
          backgroundColor: '#FDFCF0', 
          padding: '40px', 
          borderRadius: '40px', 
          border: '2px solid rgba(197, 160, 89, 0.1)', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          height: '240px' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: 900, color: '#C5A059', textTransform: 'uppercase', letterSpacing: '2px' }}>Receivables</p>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px #22c55e' }}></div>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: '#001F3F', lineHeight: 1.2 }}>
               {loading ? '---' : formatIDR(stats.pending)}
            </h3>
            <p style={{ margin: '5px 0 0', fontSize: '10px', fontWeight: 800, color: 'rgba(0,31,63,0.4)', textTransform: 'uppercase' }}>Awaiting Payment</p>
          </div>
        </div>
      </div>

      {/* QUICK ACTION FOOTER */}
      <div style={{ 
        marginTop: '40px', 
        padding: '30px', 
        borderRadius: '30px', 
        border: '1px dashed #ddd', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <span style={{ fontSize: '14px', color: '#999', fontWeight: 600 }}>System integrated with Khonic AI Engine.</span>
        <button 
          onClick={() => window.location.href = '/journals'}
          style={{ 
            backgroundColor: 'transparent', 
            border: 'none', 
            color: '#001F3F', 
            fontWeight: 900, 
            fontSize: '12px', 
            textTransform: 'uppercase', 
            letterSpacing: '1px', 
            cursor: 'pointer' 
          }}
        >
          View Journals →
        </button>
      </div>
    </div>
  )
}