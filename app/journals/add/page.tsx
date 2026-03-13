/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AddJournalPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    reference: '',
    description: '', // <--- Ini yang krusial
    accountId: '',       
    offsetAccountId: '', 
    type: 'DEBIT', 
    amount: 0
  });

  useEffect(() => {
    fetch('http://localhost:3000/accounts')
      .then(res => res.json())
      .then(data => setAccounts(Array.isArray(data) ? data : data.data || []))
      .catch(err => console.error("Gagal ambil akun:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountId || !formData.offsetAccountId || !formData.description.trim()) {
      alert("Lengkapi semua field termasuk deskripsi!");
      return;
    }

    setLoading(true);
    const amount = Number(formData.amount);

    const payload = {
      date: formData.date,
      reference: formData.reference || 'REF-GEN',
      description: formData.description,
      items: [
        {
          accountId: formData.accountId,
          debit: formData.type === 'DEBIT' ? amount : 0,
          credit: formData.type === 'CREDIT' ? amount : 0,
        },
        {
          accountId: formData.offsetAccountId,
          debit: formData.type === 'CREDIT' ? amount : 0,
          credit: formData.type === 'DEBIT' ? amount : 0,
        }
      ],
      totalAmount: amount
    };

    try {
      const res = await fetch('http://localhost:3000/journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(`Error: ${JSON.stringify(errorData.message)}`);
      } else {
        router.push('/journals');
      }
    } catch (err) {
      console.error("Network Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
      
      <div style={{ marginBottom: '40px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#C5A059', fontWeight: 800, cursor: 'pointer', marginBottom: '16px', fontSize: '11px', textTransform: 'uppercase' }}>
          ← Back
        </button>
        <h2 style={{ fontSize: '40px', fontWeight: 900, color: '#001F3F', margin: 0 }}>New Entry</h2>
      </div>

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '50px', borderRadius: '40px', border: '1px solid #eee', boxShadow: '0 20px 50px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* ROW 1: Date & Ref */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '11px', fontWeight: 900, color: '#aaa', textTransform: 'uppercase' }}>Date</label>
            <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} style={{ padding: '14px', borderRadius: '12px', border: '1px solid #eee', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '11px', fontWeight: 900, color: '#aaa', textTransform: 'uppercase' }}>Reference</label>
            <input type="text" placeholder="REF-001" value={formData.reference} onChange={(e) => setFormData({...formData, reference: e.target.value})} style={{ padding: '14px', borderRadius: '12px', border: '1px solid #eee', outline: 'none' }} />
          </div>
        </div>

        {/* ROW 2: Account Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '11px', fontWeight: 900, color: '#aaa', textTransform: 'uppercase' }}>Main Account ({formData.type})</label>
            <select required value={formData.accountId} onChange={(e) => setFormData({...formData, accountId: e.target.value})} style={{ padding: '14px', borderRadius: '12px', border: '1px solid #eee', backgroundColor: '#fff', outline: 'none' }}>
              <option value="">Select Account...</option>
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '11px', fontWeight: 900, color: '#aaa', textTransform: 'uppercase' }}>Offset Account (Opposite)</label>
            <select required value={formData.offsetAccountId} onChange={(e) => setFormData({...formData, offsetAccountId: e.target.value})} style={{ padding: '14px', borderRadius: '12px', border: '1px solid #eee', backgroundColor: '#fff', outline: 'none' }}>
              <option value="">Select Offset Account...</option>
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>)}
            </select>
          </div>
        </div>

        {/* ROW 3: Description (BALIK LAGI!) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '11px', fontWeight: 900, color: '#aaa', textTransform: 'uppercase' }}>Description</label>
          <textarea 
            required 
            rows={2} 
            placeholder="E.g. Payment for invoice #001" 
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})} 
            style={{ padding: '16px', borderRadius: '12px', border: '1px solid #eee', outline: 'none', resize: 'none', fontFamily: 'inherit' }} 
          />
        </div>

        {/* Amount Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', backgroundColor: '#FDFCF0', padding: '30px', borderRadius: '20px', border: '1px solid rgba(197, 160, 89, 0.1)' }}>
          <label style={{ fontSize: '11px', fontWeight: 900, color: '#C5A059', textTransform: 'uppercase' }}>Transaction Amount</label>
          <input 
            type="number" 
            required 
            placeholder="0"
            value={formData.amount} 
            onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})} 
            style={{ textAlign: 'center', width: '100%', background: 'none', border: 'none', fontSize: '42px', fontWeight: 900, color: '#001F3F', outline: 'none' }} 
          />
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            {['DEBIT', 'CREDIT'].map(t => (
              <button key={t} type="button" onClick={() => setFormData({...formData, type: t})} style={{ padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: 900, backgroundColor: formData.type === t ? '#001F3F' : '#eee', color: formData.type === t ? '#fff' : '#aaa', transition: '0.3s' }}>{t}</button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} style={{ backgroundColor: '#001F3F', color: 'white', padding: '20px', borderRadius: '15px', border: 'none', fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', opacity: loading ? 0.7 : 1, transition: '0.3s' }}>
          {loading ? 'Authorizing...' : 'Post Transaction'}
        </button>
      </form>
    </div>
  );
}