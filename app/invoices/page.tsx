/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [stats, setStats] = useState({ paid: 0, pending: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedBankId, setSelectedBankId] = useState('');

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customerName: '',
    dueDate: '',
    amount: 0,
    receivableAccountId: '', 
    incomeAccountId: ''
  });

  const fetchData = async () => {
    try {
      const [invRes, statsRes, accRes] = await Promise.all([
        fetch('http://localhost:3000/invoices'),
        fetch('http://localhost:3000/invoices/stats'),
        fetch('http://localhost:3000/accounts')
      ]);
      const invData = await invRes.json();
      const statsData = await statsRes.json();
      const accData = await accRes.json();

      setInvoices(invData);
      setStats(statsData);
      const accList = Array.isArray(accData) ? accData : accData.data || [];
      setAccounts(accList);

      // Defaulting COA
      const defaultAR = accList.find((a: any) => a.code === '1103');
      const defaultIncome = accList.find((a: any) => a.code === '4101');
      const defaultBank = accList.find((a: any) => a.code === '1101');
      
      setFormData(prev => ({
        ...prev,
        receivableAccountId: defaultAR?.id || '',
        incomeAccountId: defaultIncome?.id || ''
      }));
      setSelectedBankId(defaultBank?.id || '');
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      date: new Date().toISOString(),
      dueDate: new Date(formData.dueDate).toISOString(),
    };
    const res = await fetch('http://localhost:3000/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      setIsModalOpen(false);
      fetchData();
      setFormData({ invoiceNumber: '', customerName: '', dueDate: '', amount: 0, receivableAccountId: formData.receivableAccountId, incomeAccountId: formData.incomeAccountId });
    }
  };

  // Logic Toggle Status Dinamis
  const toggleStatus = async (inv: any) => {
    if (inv.status === 'PENDING') {
      // Buka modal buat milih akun Bank
      setSelectedInvoice(inv);
      setIsPaymentModalOpen(true);
    } else {
      // Balik ke Pending langsung tembak
      await processUpdateStatus(inv.id, 'PENDING');
    }
  };

  const processUpdateStatus = async (id: string, status: string, bankAccountId?: string) => {
    const res = await fetch(`http://localhost:3000/invoices/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, bankAccountId })
    });
    if (res.ok) {
      setIsPaymentModalOpen(false);
      fetchData();
    }
  };

  const downloadPDF = (inv: any) => {
    const doc = new jsPDF();
    doc.setFillColor(0, 31, 63);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(197, 160, 89);
    doc.text("KHONIC", 15, 25);
    // ... sisa logic PDF Mas Bram (AutoTable dll) ...
    doc.save(`${inv.invoiceNumber}_Bramley_Report.pdf`);
  };

  return (
    <div style={{ marginLeft: '8px', padding: '40px', backgroundColor: '#FDFCF0', minHeight: '100vh' }}>
      
      {/* HEADER & STATS (Sesuai desain Mas Bram) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
        <div>
          <h2 style={{ fontSize: '42px', fontWeight: '900', color: '#001F3F', margin: 0 }}>Invoices</h2>
          <p style={{ color: '#6B7280' }}>Manage your billing and receivables</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} style={{ backgroundColor: '#C5A059', color: 'white', padding: '16px 32px', borderRadius: '16px', fontWeight: '800', border: 'none', cursor: 'pointer' }}>
          + Create New Invoice
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px', marginBottom: '48px' }}>
        {/* Stats Cards ... */}
        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '32px', border: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: '12px', fontWeight: '800', color: '#9CA3AF' }}>TOTAL RECEIVABLES</p>
          <h4 style={{ fontSize: '32px', fontWeight: '900', color: '#001F3F' }}>Rp {stats.pending.toLocaleString('id-ID')}</h4>
        </div>
        <div style={{ backgroundColor: '#001F3F', padding: '32px', borderRadius: '32px' }}>
          <p style={{ fontSize: '12px', fontWeight: '800', color: 'rgba(255,255,255,0.5)' }}>TOTAL COLLECTED</p>
          <h4 style={{ fontSize: '32px', fontWeight: '900', color: 'white' }}>Rp {stats.paid.toLocaleString('id-ID')}</h4>
        </div>
        <div style={{ backgroundColor: '#F5F5DC', padding: '32px', borderRadius: '32px' }}>
          <p style={{ fontSize: '12px', fontWeight: '800', color: '#C5A059' }}>COLLECTION RATE</p>
          <h4 style={{ fontSize: '48px', fontWeight: '900', color: '#001F3F' }}>
            {stats.paid + stats.pending > 0 ? Math.round((stats.paid / (stats.paid + stats.pending)) * 100) : 0}%
          </h4>
        </div>
      </div>

      {/* TABLE */}
      <div style={{ backgroundColor: 'white', borderRadius: '32px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#F9FAFB' }}>
            <tr>
              {['Number', 'Customer', 'Status', 'Amount', 'Action'].map((head) => (
                <th key={head} style={{ padding: '24px 32px', textAlign: 'left', fontSize: '12px', color: '#9CA3AF' }}>{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv: any) => (
              <tr key={inv.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: '24px 32px', fontWeight: '800' }}>{inv.invoiceNumber}</td>
                <td style={{ padding: '24px 32px' }}>{inv.customerName}</td>
                <td style={{ padding: '24px 32px' }}>
                  <button 
                    onClick={() => toggleStatus(inv)}
                    style={{ padding: '8px 18px', borderRadius: '99px', fontWeight: '800', border: 'none', cursor: 'pointer', backgroundColor: inv.status === 'PAID' ? '#DCFCE7' : '#FEF3C7', color: inv.status === 'PAID' ? '#166534' : '#92400E' }}
                  >
                    {inv.status}
                  </button>
                </td>
                <td style={{ padding: '24px 32px', textAlign: 'right', fontWeight: '800' }}>Rp {inv.totalAmount.toLocaleString('id-ID')}</td>
                <td style={{ padding: '24px 32px', textAlign: 'right' }}>
                   <button onClick={() => downloadPDF(inv)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C5A059" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: NEW INVOICE (Sesuai kode Mas Bram) */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 31, 63, 0.4)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#FDFCF0', width: '100%', maxWidth: '500px', borderRadius: '40px', padding: '40px' }}>
             <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#001F3F', marginBottom: '24px' }}>New Invoice</h3>
             {/* Form New Invoice ... */}
             <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input placeholder="Invoice No" required style={{ padding: '14px', borderRadius: '12px', border: '1px solid #E5E7EB' }} onChange={e => setFormData({...formData, invoiceNumber: e.target.value})} />
                <input placeholder="Customer Name" required style={{ padding: '14px', borderRadius: '12px', border: '1px solid #E5E7EB' }} onChange={e => setFormData({...formData, customerName: e.target.value})} />
                <input type="number" placeholder="Amount" required style={{ padding: '14px', borderRadius: '12px', border: '1px solid #E5E7EB' }} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
                <input type="date" required style={{ padding: '14px', borderRadius: '12px', border: '1px solid #E5E7EB' }} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                
                <select required value={formData.receivableAccountId} onChange={e => setFormData({...formData, receivableAccountId: e.target.value})} style={{ padding: '14px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                  <option value="">Pilih Akun Piutang</option>
                  {accounts.filter((a:any) => a.code.startsWith('1')).map((a:any) => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                </select>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" style={{ flex: 1, backgroundColor: '#001F3F', color: 'white', borderRadius: '12px', padding: '14px' }}>Save</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM PAYMENT (Dinamis Total!) */}
      {isPaymentModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 31, 63, 0.4)', backdropFilter: 'blur(8px)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#FDFCF0', width: '100%', maxWidth: '400px', borderRadius: '32px', padding: '32px', border: '2px solid #C5A059' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#001F3F' }}>Confirm Payment</h3>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>Duit dari <b>{selectedInvoice?.customerName}</b> masuk ke mana?</p>
            
            <div style={{ margin: '24px 0' }}>
              <label style={{ fontSize: '10px', fontWeight: '900', color: '#C5A059', textTransform: 'uppercase' }}>Select Bank/Cash Account</label>
              <select 
                value={selectedBankId}
                onChange={(e) => setSelectedBankId(e.target.value)}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E5E7EB', marginTop: '8px' }}
              >
                {accounts.filter((a:any) => a.code.startsWith('110')).map((a:any) => (
                  <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setIsPaymentModalOpen(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#F3F4F6', border: 'none', fontWeight: '700' }}>Cancel</button>
              <button 
                onClick={() => processUpdateStatus(selectedInvoice.id, 'PAID', selectedBankId)}
                style={{ flex: 2, padding: '14px', borderRadius: '12px', backgroundColor: '#C5A059', color: 'white', border: 'none', fontWeight: '800' }}
              >
                Confirm & Journal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}