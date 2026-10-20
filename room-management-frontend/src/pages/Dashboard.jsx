import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Plus, Trash2, Edit3, Calendar, DollarSign, Check, X, 
  Users, Home, AlertCircle, RefreshCw, Zap, MapPin, Phone, Mail, Share2
} from 'lucide-react';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('rooms');

  // Lists Data
  const [rooms, setRooms] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [readings, setReadings] = useState([]);
  const [bills, setBills] = useState([]);

  // Loading & Global Notifications
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals visibility state
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReadingModal, setShowReadingModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(null);

  // Edit references
  const [editingRoom, setEditingRoom] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Form Fields State
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    floor: 1,
    status: 'available',
    currentMeterReading: 0,
    price: 2000.00
  });

  const [customerForm, setCustomerForm] = useState({
    name: '',
    phoneNo: '',
    email: '',
    address: ''
  });

  const [bookingForm, setBookingForm] = useState({
    customerId: '',
    roomId: '',
    checkInDate: '',
    checkOutDate: ''
  });

  const [readingForm, setReadingForm] = useState({
    roomId: '',
    readingDate: '',
    unitsConsumed: 0,
    unitRate: 5.50
  });

  const [billForm, setBillForm] = useState({
    bookingId: '',
    billingMonth: '',
    fallbackUnitRate: 5.50
  });

  const [paymentAmount, setPaymentAmount] = useState('');

  // Selected Billing Month filter
  const [billingMonthFilter, setBillingMonthFilter] = useState(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${mm}`;
  });

  // Load Data
  useEffect(() => {
    fetchTabContent();
  }, [activeTab, billingMonthFilter]);

  const fetchTabContent = () => {
    setError('');
    if (activeTab === 'rooms') fetchRooms();
    else if (activeTab === 'customers') fetchCustomers();
    else if (activeTab === 'bookings') {
      fetchBookings();
      fetchCustomers();
      fetchRooms();
    }
    else if (activeTab === 'readings') {
      fetchReadings();
      fetchRooms();
    }
    else if (activeTab === 'bills') {
      fetchBills();
      fetchBookings();
    }
  };

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/rooms');
      setRooms(res.data);
    } catch {
      setError('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/customers');
      setCustomers(res.data);
    } catch {
      setError('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/bookings');
      // Sort bookings: Booked/Checked-in first, Checked-out/Cancelled second
      const sorted = res.data.sort((a, b) => {
        const getPriority = (status) => {
          const s = status.toLowerCase();
          if (s === 'booked' || s === 'checked-in') return 1;
          return 2;
        };
        return getPriority(a.status) - getPriority(b.status);
      });
      setBookings(sorted);
    } catch {
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchReadings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/readings');
      // Sort readings: most recent reading date first
      const sorted = res.data.sort((a, b) => new Date(b.readingDate) - new Date(a.readingDate));
      setReadings(sorted);
    } catch {
      setError('Failed to fetch electricity readings');
    } finally {
      setLoading(false);
    }
  };

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/bills/month/${billingMonthFilter}`);
      // Sort bills: pending first, paid second
      const sorted = res.data.sort((a, b) => {
        const getPriority = (status) => {
          const s = status.toLowerCase();
          if (s === 'pending') return 1;
          return 2; // paid/other
        };
        return getPriority(a.paymentStatus) - getPriority(b.paymentStatus);
      });
      setBills(sorted);
    } catch {
      setError('Failed to fetch monthly bills');
    } finally {
      setLoading(false);
    }
  };

  // ROOM OPERATIONS
  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingRoom) {
        await api.put(`/api/rooms/${editingRoom.id}`, roomForm);
        setSuccess('Room updated successfully');
      } else {
        await api.post('/api/rooms', roomForm);
        setSuccess('Room created successfully');
      }
      setShowRoomModal(false);
      setEditingRoom(null);
      setRoomForm({ roomNumber: '', floor: 1, status: 'available', currentMeterReading: 0, price: 2000.00 });
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while saving room');
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm('Delete this room?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/api/rooms/${id}`);
      setSuccess('Room deleted successfully');
      fetchRooms();
    } catch {
      setError('Cannot delete room because it is linked to bookings.');
    }
  };

  // CUSTOMER OPERATIONS
  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingCustomer) {
        await api.put(`/api/customers/${editingCustomer.id}`, customerForm);
        setSuccess('Customer updated successfully');
      } else {
        await api.post('/api/customers', customerForm);
        setSuccess('Customer created successfully');
      }
      setShowCustomerModal(false);
      setEditingCustomer(null);
      setCustomerForm({ name: '', phoneNo: '', email: '', address: '' });
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while saving customer');
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/api/customers/${id}`);
      setSuccess('Customer deleted successfully');
      fetchCustomers();
    } catch {
      setError('Cannot delete customer because they have bookings.');
    }
  };

  // BOOKING OPERATIONS
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/api/bookings', {
        customerId: Number(bookingForm.customerId),
        roomId: Number(bookingForm.roomId),
        checkInDate: bookingForm.checkInDate,
        checkOutDate: bookingForm.checkOutDate || null
      });
      setSuccess('Booking recorded successfully!');
      setShowBookingModal(false);
      setBookingForm({ customerId: '', roomId: '', checkInDate: '', checkOutDate: '' });
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Overlapping reservation or check-out date collision.');
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking reservation?')) return;
    setError('');
    setSuccess('');
    try {
      await api.post(`/api/bookings/${id}/cancel`);
      setSuccess('Booking cancelled');
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    }
  };

  const handleCompleteBooking = async (id) => {
    if (!window.confirm('Process check-out checkout?')) return;
    setError('');
    setSuccess('');
    try {
      await api.post(`/api/bookings/${id}/complete`);
      setSuccess('Check-out completed, room freed');
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    }
  };

  // METER READINGS
  const handleReadingSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/api/readings', {
        roomId: Number(readingForm.roomId),
        readingDate: readingForm.readingDate,
        unitsConsumed: Number(readingForm.unitsConsumed),
        unitRate: Number(readingForm.unitRate)
      });
      setSuccess('Electricity meter reading recorded successfully');
      setShowReadingModal(false);
      setReadingForm({ roomId: '', readingDate: '', unitsConsumed: 0, unitRate: 5.50 });
      fetchReadings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save readings.');
    }
  };

  // BILL GENERATION & PAYMENTS
  const handleBillSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const selectedBooking = bookings.find(b => b.id.toString() === billForm.bookingId.toString());
    if (selectedBooking) {
      const checkInYearMonth = selectedBooking.checkInDate.substring(0, 7); // YYYY-MM
      if (billForm.billingMonth < checkInYearMonth) {
        setError(`Cannot generate bill for a month before check-in (${checkInYearMonth})`);
        return;
      }
      if (selectedBooking.checkOutDate) {
        const checkOutYearMonth = selectedBooking.checkOutDate.substring(0, 7); // YYYY-MM
        if (billForm.billingMonth > checkOutYearMonth) {
          setError(`Cannot generate bill for a month after check-out (${checkOutYearMonth})`);
          return;
        }
      }
    }

    try {
      await api.post(`/api/bills/generate?bookingId=${billForm.bookingId}&billingMonth=${billForm.billingMonth}&fallbackUnitRate=${billForm.fallbackUnitRate}`);
      setSuccess('Monthly rent & electricity invoice generated successfully');
      setShowBillModal(false);
      setBillForm({ bookingId: '', billingMonth: billingMonthFilter, fallbackUnitRate: 5.50 });
      fetchBills();
    } catch (err) {
      setError(err.response?.data?.message || 'Bill generation failed.');
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!showPaymentModal) return;
    try {
      await api.post(`/api/bills/${showPaymentModal.id}/pay?amount=${paymentAmount}`);
      setSuccess('Payment recorded successfully');
      setShowPaymentModal(null);
      setPaymentAmount('');
      fetchBills();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process payment');
    }
  };

  const generateBillCanvas = (bill) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    
    const grad = ctx.createLinearGradient(0, 0, 0, 800);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 800);
    
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(25, 25, 550, 750, 20); else ctx.rect(25, 25, 550, 750);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(30, 30, 540, 740, 16); else ctx.rect(30, 30, 540, 740);
    ctx.fill();

    ctx.fillStyle = '#6366f1';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('ST ROOMS', 60, 90);
    
    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px sans-serif';
    ctx.fillText('Premium Living Spaces', 60, 115);
    
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('INVOICE', 540, 85);
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText(`INV-${bill.id}-${bill.billingMonth.replace('-', '')}`, 540, 110);
    ctx.textAlign = 'left';

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(60, 140);
    ctx.lineTo(540, 140);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('BILLED TO:', 60, 180);
    
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(bill.customerName, 60, 210);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('ROOM INFO:', 340, 180);
    
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`Room ${bill.roomNumber}`, 340, 210);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('BILLING MONTH:', 60, 260);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(bill.billingMonth, 60, 285);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('STATUS:', 340, 260);
    const isPaid = bill.paymentStatus.toLowerCase() === 'paid';
    ctx.fillStyle = isPaid ? '#10b981' : '#f59e0b';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(bill.paymentStatus.toUpperCase(), 340, 285);

    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(60, 320);
    ctx.lineTo(540, 320);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('DESCRIPTION', 65, 350);
    ctx.textAlign = 'right';
    ctx.fillText('AMOUNT', 535, 350);
    ctx.textAlign = 'left';

    let y = 390;
    
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '14px sans-serif';
    ctx.fillText('Monthly Space Rental Fee', 65, y);
    ctx.textAlign = 'right';
    ctx.fillText(`$${Number(bill.rentAmount).toFixed(2)}`, 535, y);
    ctx.textAlign = 'left';

    y += 45;
    ctx.fillStyle = '#f1f5f9';
    ctx.fillText(`Power Utilities (Unit rate: $${Number(bill.unitRate).toFixed(2)})`, 65, y);
    ctx.textAlign = 'right';
    ctx.fillText(`$${Number(bill.electricityCharge).toFixed(2)}`, 535, y);
    ctx.textAlign = 'left';

    const prevBal = Number(bill.previousBalance || 0);
    if (prevBal > 0) {
      y += 45;
      ctx.fillStyle = '#f87171'; // soft red color for arrears
      ctx.fillText('Previous Unpaid Balance (Arrears)', 65, y);
      ctx.textAlign = 'right';
      ctx.fillText(`$${prevBal.toFixed(2)}`, 535, y);
      ctx.textAlign = 'left';
    }

    y += 45;
    ctx.strokeStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(540, y);
    ctx.stroke();

    y += 40;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('Total Invoiced Amount:', 65, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`$${Number(bill.totalAmount).toFixed(2)}`, 535, y);
    ctx.textAlign = 'left';

    y += 40;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('Amount Paid:', 65, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`$${Number(bill.paidAmount).toFixed(2)}`, 535, y);
    ctx.textAlign = 'left';

    const bal = bill.totalAmount - bill.paidAmount;
    y += 40;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('Remaining Balance Due:', 65, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = bal > 0 ? '#ef4444' : '#10b981';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`$${bal.toFixed(2)}`, 535, y);
    ctx.textAlign = 'left';

    // Draw stamp and footer notes dynamically relative to y to avoid overlap
    const stampY = Math.max(680, y + 70);
    ctx.strokeStyle = isPaid ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(460, stampY, 45, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = isPaid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)';
    ctx.fill();

    ctx.fillStyle = isPaid ? '#10b981' : '#f59e0b';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isPaid ? 'PAID' : 'PENDING', 460, stampY + 5);
    ctx.textAlign = 'left';

    ctx.fillStyle = '#475569';
    ctx.font = 'italic 12px sans-serif';
    ctx.fillText('Thank you for your prompt payment!', 65, stampY + 10);
    ctx.fillText('If you have questions, please reach out to admin.', 65, stampY + 30);
    ctx.font = '10px sans-serif';
    ctx.fillText('This document is electronically generated and verified.', 65, stampY + 60);

    return canvas;
  };

  const downloadBillImage = (bill) => {
    try {
      const canvas = generateBillCanvas(bill);
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `ST_Rooms_Invoice_Room_${bill.roomNumber}_${bill.billingMonth}.png`;
      link.href = dataUrl;
      link.click();
      
      setSuccess('Invoice image generated and downloaded successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to generate invoice image');
    }
  };

  const sendBillToWhatsApp = async (bill) => {
    try {
      setError('');
      setSuccess('');
      
      const canvas = generateBillCanvas(bill);
      
      // Try native share first (especially for mobile browsers)
      if (navigator.share && navigator.canShare) {
        try {
          const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
          const file = new File([blob], `ST_Rooms_Invoice_Room_${bill.roomNumber}_${bill.billingMonth}.png`, { type: 'image/png' });
          
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `Invoice Room ${bill.roomNumber}`,
              text: `Here is the rental invoice for Room ${bill.roomNumber} - Month: ${bill.billingMonth}`
            });
            setSuccess('Invoice shared successfully via WhatsApp/native share!');
            return;
          }
        } catch (shareErr) {
          console.warn('Native share failed or cancelled, falling back to WhatsApp Web link.', shareErr);
        }
      }

      // Fallback: Open WhatsApp API link with prefilled text message containing receipt summary
      const cleanPhone = bill.customerPhone ? bill.customerPhone.replace(/\D/g, '') : '';
      if (!cleanPhone) {
        setError('No valid phone number registered for this customer.');
        return;
      }
      
      const bal = bill.totalAmount - bill.paidAmount;
      const prevArrears = Number(bill.previousBalance || 0);
      const textMessage = 
        `*ST Rooms Rental Invoice*\n` +
        `---------------------------------\n` +
        `*Resident Name:* ${bill.customerName}\n` +
        `*Room Number:* Room ${bill.roomNumber}\n` +
        `*Billing Month:* ${bill.billingMonth}\n` +
        `---------------------------------\n` +
        `*Room Rent:* $${Number(bill.rentAmount).toFixed(2)}\n` +
        `*Electricity Charge:* $${Number(bill.electricityCharge).toFixed(2)}\n` +
        (prevArrears > 0 ? `*Previous Arrears:* $${prevArrears.toFixed(2)}\n` : '') +
        `*Total Invoiced:* $${Number(bill.totalAmount).toFixed(2)}\n` +
        `*Amount Paid:* $${Number(bill.paidAmount).toFixed(2)}\n` +
        `*Remaining Balance:* $${bal.toFixed(2)}\n` +
        `*Status:* ${bill.paymentStatus.toUpperCase()}\n` +
        `---------------------------------\n` +
        `Thank you for your prompt payment!\n` +
        `Please reach out to administration if you have any questions.`;
        
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(textMessage)}`;
      window.open(whatsappUrl, '_blank');
      setSuccess('Redirecting to WhatsApp with invoice details...');
    } catch (err) {
      console.error(err);
      setError('Failed to share bill via WhatsApp');
    }
  };

  return (
    <div className="dashboard-container">
      
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--danger-glow)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: 'var(--danger)',
          padding: '16px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '20px'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
      )}

      {success && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--success-glow)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          color: 'var(--success)',
          padding: '16px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '20px'
        }}>
          <Check size={20} />
          <span>{success}</span>
          <button onClick={() => setSuccess('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
      )}

      <div className="tabs-container">
        <button 
          onClick={() => setActiveTab('rooms')} 
          className={`btn ${activeTab === 'rooms' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)' }}
        >
          <Home size={18} /> Rooms
        </button>
        <button 
          onClick={() => setActiveTab('customers')} 
          className={`btn ${activeTab === 'customers' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)' }}
        >
          <Users size={18} /> Customers
        </button>
        <button 
          onClick={() => setActiveTab('bookings')} 
          className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)' }}
        >
          <Calendar size={18} /> Bookings
        </button>
        <button 
          onClick={() => setActiveTab('readings')} 
          className={`btn ${activeTab === 'readings' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)' }}
        >
          <Zap size={18} /> Meter Readings
        </button>
        <button 
          onClick={() => setActiveTab('bills')} 
          className={`btn ${activeTab === 'bills' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)' }}
        >
          <DollarSign size={18} /> Bills & Invoices
        </button>
      </div>

      {/* 1. ROOMS TAB */}
      {activeTab === 'rooms' && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Rooms Inventory</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Manage your buildings rooms, pricing, floors, and current electrical reading meters</p>
            </div>
            <button 
              onClick={() => { setEditingRoom(null); setRoomForm({ roomNumber: '', floor: 1, status: 'available', currentMeterReading: 0, price: 2000.00 }); setShowRoomModal(true); }} 
              className="btn btn-primary"
            >
              <Plus size={18} /> Add New Room
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <RefreshCw size={40} className="animate-spin" style={{ color: 'var(--accent)' }} />
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px'
            }}>
              {rooms.map(room => (
                <div key={room.id} className="glass-panel glass-card-hover" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '140px', 
                    background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '20px'
                  }}>
                    <span className={`badge badge-${room.status.toLowerCase()}`} style={{ alignSelf: 'flex-start' }}>
                      {room.status}
                    </span>
                    <div>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                        Room {room.roomNumber}
                      </h3>
                      <span style={{ fontSize: '0.85rem', color: '#a5b4fc', textTransform: 'uppercase', fontWeight: 600 }}>
                        Floor {room.floor}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Monthly Rate</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent)' }}>${room.price}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', textAlign: 'right' }}>Current Meter</span>
                        <span style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', textAlign: 'right' }}>{room.currentMeterReading} units</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
                      <button 
                        onClick={() => {
                          setEditingRoom(room);
                          setRoomForm({
                            roomNumber: room.roomNumber,
                            floor: room.floor,
                            status: room.status,
                            currentMeterReading: room.currentMeterReading,
                            price: room.price
                          });
                          setShowRoomModal(true);
                        }} 
                        className="btn btn-secondary" 
                        style={{ flexGrow: 1, padding: '10px' }}
                      >
                        <Edit3 size={16} /> Edit
                      </button>
                      <button onClick={() => handleDeleteRoom(room.id)} className="btn btn-danger" style={{ padding: '10px' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. CUSTOMERS TAB */}
      {activeTab === 'customers' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Customers Registry</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Log and modify details of residents, tenants, and space guests</p>
            </div>
            <button 
              onClick={() => { setEditingCustomer(null); setCustomerForm({ name: '', phoneNo: '', email: '', address: '' }); setShowCustomerModal(true); }} 
              className="btn btn-primary"
            >
              <Plus size={18} /> Add Customer
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <th style={{ padding: '16px' }}>Name</th>
                  <th style={{ padding: '16px' }}>Phone Number</th>
                  <th style={{ padding: '16px' }}>Email Address</th>
                  <th style={{ padding: '16px' }}>Address</th>
                  <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No customers registered yet.
                    </td>
                  </tr>
                ) : (
                  customers.map(customer => (
                    <tr key={customer.id} style={{ borderBottom: '1px solid var(--border-glass)', fontSize: '0.95rem' }}>
                      <td data-label="Name" style={{ padding: '16px', fontWeight: 'bold' }}>{customer.name}</td>
                      <td data-label="Phone" style={{ padding: '16px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={14} style={{ color: 'var(--text-secondary)' }} /> {customer.phoneNo}
                        </span>
                      </td>
                      <td data-label="Email" style={{ padding: '16px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={14} style={{ color: 'var(--text-secondary)' }} /> {customer.email}
                        </span>
                      </td>
                      <td data-label="Address" style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={14} /> {customer.address || '-'}
                        </span>
                      </td>
                      <td data-label="Actions" style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => {
                              setEditingCustomer(customer);
                              setCustomerForm({
                                name: customer.name,
                                phoneNo: customer.phoneNo,
                                email: customer.email,
                                address: customer.address || ''
                              });
                              setShowCustomerModal(true);
                            }}
                            className="btn btn-secondary" 
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteCustomer(customer.id)} 
                            className="btn btn-danger" 
                            style={{ padding: '6px 10px' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. BOOKINGS TAB */}
      {activeTab === 'bookings' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Room Reservations</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Book rooms for customers, track check-ins, and process check-outs</p>
            </div>
            <button 
              onClick={() => { 
                setBookingForm({
                  customerId: customers[0]?.id?.toString() || '',
                  roomId: rooms[0]?.id?.toString() || '',
                  checkInDate: new Date().toISOString().substring(0, 10),
                  checkOutDate: ''
                }); 
                setShowBookingModal(true); 
              }} 
              className="btn btn-primary"
            >
              <Plus size={18} /> Book Room
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <th style={{ padding: '16px' }}>Room</th>
                  <th style={{ padding: '16px' }}>Resident Customer</th>
                  <th style={{ padding: '16px' }}>Check-in Date</th>
                  <th style={{ padding: '16px' }}>Check-out Date</th>
                  <th style={{ padding: '16px' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No active bookings recorded.
                    </td>
                  </tr>
                ) : (
                  bookings.map(booking => (
                    <tr key={booking.id} style={{ borderBottom: '1px solid var(--border-glass)', fontSize: '0.95rem' }}>
                      <td data-label="Room" style={{ padding: '16px', fontWeight: 'bold' }}>Room {booking.roomNumber}</td>
                      <td data-label="Customer" style={{ padding: '16px' }}>{booking.customerName}</td>
                      <td data-label="Check-In" style={{ padding: '16px' }}>{booking.checkInDate}</td>
                      <td data-label="Check-Out" style={{ padding: '16px' }}>{booking.checkOutDate || 'Ongoing'}</td>
                      <td data-label="Status" style={{ padding: '16px' }}>
                        <span className={`badge badge-${booking.status.toLowerCase()}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td data-label="Actions" style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {booking.status.toLowerCase() === 'booked' && (
                            <>
                              <button 
                                onClick={() => handleCancelBooking(booking.id)} 
                                className="btn btn-secondary" 
                                style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'var(--danger)' }}
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={() => handleCompleteBooking(booking.id)} 
                                className="btn btn-primary" 
                                style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'var(--success)' }}
                              >
                                Check Out
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. METER READINGS TAB */}
      {activeTab === 'readings' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Electricity Meter Readings</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Log monthly power usage stats per room to generate electricity charges</p>
            </div>
            <button 
              onClick={() => { 
                setReadingForm({
                  roomId: rooms[0]?.id?.toString() || '',
                  readingDate: new Date().toISOString().substring(0, 10),
                  unitsConsumed: 0,
                  unitRate: 5.50
                }); 
                setShowReadingModal(true); 
              }} 
              className="btn btn-primary"
            >
              <Plus size={18} /> Add Meter Reading
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <th style={{ padding: '16px' }}>Room</th>
                  <th style={{ padding: '16px' }}>Reading Date</th>
                  <th style={{ padding: '16px' }}>Units Consumed</th>
                  <th style={{ padding: '16px' }}>Unit Rate</th>
                  <th style={{ padding: '16px' }}>Total Electricity Charge</th>
                </tr>
              </thead>
              <tbody>
                {readings.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No electricity readings registered yet.
                    </td>
                  </tr>
                ) : (
                  readings.map(reading => (
                    <tr key={reading.id} style={{ borderBottom: '1px solid var(--border-glass)', fontSize: '0.95rem' }}>
                      <td data-label="Room" style={{ padding: '16px', fontWeight: 'bold' }}>Room {reading.roomNumber}</td>
                      <td data-label="Reading Date" style={{ padding: '16px' }}>{reading.readingDate}</td>
                      <td data-label="Consumed" style={{ padding: '16px' }}>{reading.unitsConsumed} Units</td>
                      <td data-label="Unit Rate" style={{ padding: '16px' }}>${reading.unitRate} / Unit</td>
                      <td data-label="Total Charge" style={{ padding: '16px', fontWeight: 600, color: 'var(--accent)' }}>${reading.totalAmount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. BILLS & INVOICES TAB */}
      {activeTab === 'bills' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Invoices & Rental Bills</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Generate monthly rental bills (Room Rent + Electricity Charge) and log tenant payments</p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label className="form-label" style={{ marginBottom: '2px' }}>Billing Month</label>
                <input 
                  type="month" 
                  className="form-input" 
                  style={{ padding: '8px 12px', fontSize: '0.9rem', width: '160px' }} 
                  value={billingMonthFilter}
                  onChange={(e) => setBillingMonthFilter(e.target.value)}
                />
              </div>
              <button 
                onClick={() => {
                  setBillForm({
                    bookingId: bookings[0]?.id?.toString() || '',
                    billingMonth: billingMonthFilter,
                    fallbackUnitRate: 5.50
                  });
                  setShowBillModal(true);
                }}
                className="btn btn-primary"
                style={{ alignSelf: 'flex-end', padding: '10px 16px' }}
                disabled={bookings.length === 0}
              >
                Generate Bill
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <th style={{ padding: '16px' }}>Room</th>
                  <th style={{ padding: '16px' }}>Resident Customer</th>
                  <th style={{ padding: '16px' }}>Rent Amount</th>
                  <th style={{ padding: '16px' }}>Elec. Charge</th>
                  <th style={{ padding: '16px' }}>Total Bill</th>
                  <th style={{ padding: '16px' }}>Paid Amount</th>
                  <th style={{ padding: '16px' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No bills generated for this billing month.
                    </td>
                  </tr>
                ) : (
                  bills.map(bill => (
                    <tr key={bill.id} style={{ borderBottom: '1px solid var(--border-glass)', fontSize: '0.95rem' }}>
                      <td data-label="Room" style={{ padding: '16px', fontWeight: 'bold' }}>Room {bill.roomNumber}</td>
                      <td data-label="Customer" style={{ padding: '16px' }}>{bill.customerName}</td>
                      <td data-label="Rent" style={{ padding: '16px' }}>${bill.rentAmount}</td>
                      <td data-label="Electricity" style={{ padding: '16px', color: '#a5b4fc' }}>${bill.electricityCharge}</td>
                      <td data-label="Total" style={{ padding: '16px', fontWeight: 700 }}>${bill.totalAmount}</td>
                      <td data-label="Paid" style={{ padding: '16px', color: 'var(--success)' }}>${bill.paidAmount}</td>
                      <td data-label="Status" style={{ padding: '16px' }}>
                        <span className={`badge badge-${bill.paymentStatus.toLowerCase()}`}>
                          {bill.paymentStatus}
                        </span>
                      </td>
                      <td data-label="Actions" style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => downloadBillImage(bill)}
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            Download Image
                          </button>
                          <button 
                            onClick={() => sendBillToWhatsApp(bill)}
                            className="btn btn-secondary"
                            style={{ 
                              padding: '6px 12px', 
                              fontSize: '0.8rem', 
                              borderColor: 'rgba(34, 197, 94, 0.4)', 
                              background: 'rgba(34, 197, 94, 0.1)', 
                              color: '#22c55e', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px' 
                            }}
                          >
                            <Share2 size={12} /> WhatsApp
                          </button>
                          {bill.paymentStatus !== 'paid' && (
                            <button 
                              onClick={() => {
                                  setShowPaymentModal(bill);
                                  setPaymentAmount((bill.totalAmount - bill.paidAmount).toFixed(2));
                              }}
                              className="btn btn-primary"
                              style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'var(--success)' }}
                            >
                              Receive Payment
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 1. ROOM MODAL */}
      {showRoomModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                {editingRoom ? `Edit Room ${editingRoom.roomNumber}` : 'Create New Room'}
              </h3>
              <button onClick={() => setShowRoomModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRoomSubmit}>
              <div className="form-group">
                <label className="form-label">Room Number</label>
                <input 
                  type="text" className="form-input" required
                  value={roomForm.roomNumber}
                  onChange={(e) => setRoomForm({...roomForm, roomNumber: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Floor</label>
                <input 
                  type="number" className="form-input" required min={0}
                  value={roomForm.floor}
                  onChange={(e) => setRoomForm({...roomForm, floor: Number(e.target.value)})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Monthly Rent Price ($)</label>
                <input 
                  type="number" className="form-input" required min={0} step="0.01"
                  value={roomForm.price}
                  onChange={(e) => setRoomForm({...roomForm, price: Number(e.target.value)})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Initial/Current Meter Reading</label>
                <input 
                  type="number" className="form-input" required min={0}
                  value={roomForm.currentMeterReading}
                  onChange={(e) => setRoomForm({...roomForm, currentMeterReading: Number(e.target.value)})}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label className="form-label">Status</label>
                <select 
                  className="form-input" value={roomForm.status} style={{ background: 'var(--bg-secondary)' }}
                  onChange={(e) => setRoomForm({...roomForm, status: e.target.value})}
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowRoomModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingRoom ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. CUSTOMER MODAL */}
      {showCustomerModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                {editingCustomer ? `Edit Customer` : 'Register New Customer'}
              </h3>
              <button onClick={() => setShowCustomerModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCustomerSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" className="form-input" required
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input 
                  type="text" className="form-input" required
                  value={customerForm.phoneNo}
                  onChange={(e) => setCustomerForm({...customerForm, phoneNo: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" className="form-input" required
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label className="form-label">Home Address</label>
                <textarea 
                  className="form-input" style={{ height: '70px', resize: 'vertical' }}
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({...customerForm, address: e.target.value})}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCustomerModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingCustomer ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. BOOKING MODAL */}
      {showBookingModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel animate-fade-in" style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Book a Room</h3>
              <button onClick={() => setShowBookingModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label className="form-label">Customer</label>
                <select 
                  className="form-input" required style={{ background: 'var(--bg-secondary)' }}
                  value={bookingForm.customerId}
                  onChange={(e) => setBookingForm({...bookingForm, customerId: e.target.value})}
                >
                  <option value="">Select customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Room Number</label>
                <select 
                  className="form-input" required style={{ background: 'var(--bg-secondary)' }}
                  value={bookingForm.roomId}
                  onChange={(e) => setBookingForm({...bookingForm, roomId: e.target.value})}
                >
                  <option value="">Select room</option>
                  {rooms.filter(r => r.status === 'available').map(r => (
                    <option key={r.id} value={r.id}>Room {r.roomNumber} - Floor {r.floor} (${r.price})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Check-in Date</label>
                <input 
                  type="date" className="form-input" required
                  value={bookingForm.checkInDate}
                  onChange={(e) => setBookingForm({...bookingForm, checkInDate: e.target.value})}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label className="form-label">Check-out Date (Optional)</label>
                <input 
                  type="date" className="form-input"
                  value={bookingForm.checkOutDate}
                  onChange={(e) => setBookingForm({...bookingForm, checkOutDate: e.target.value})}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowBookingModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm Book</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. METER READING MODAL */}
      {showReadingModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel animate-fade-in" style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Record Electricity Usage</h3>
              <button onClick={() => setShowReadingModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReadingSubmit}>
              <div className="form-group">
                <label className="form-label">Room Number</label>
                <select 
                  className="form-input" required style={{ background: 'var(--bg-secondary)' }}
                  value={readingForm.roomId}
                  onChange={(e) => setReadingForm({...readingForm, roomId: e.target.value})}
                >
                  <option value="">Select room</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>Room {r.roomNumber} (Current Reading: {r.currentMeterReading} units)</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Reading Date</label>
                <input 
                  type="date" className="form-input" required
                  value={readingForm.readingDate}
                  onChange={(e) => setReadingForm({...readingForm, readingDate: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Units Consumed (kWh)</label>
                <input 
                  type="number" className="form-input" required min={1}
                  value={readingForm.unitsConsumed}
                  onChange={(e) => setReadingForm({...readingForm, unitsConsumed: Number(e.target.value)})}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label className="form-label">Unit Rate ($ / unit)</label>
                <input 
                  type="number" className="form-input" required min={0} step="0.01"
                  value={readingForm.unitRate}
                  onChange={(e) => setReadingForm({...readingForm, unitRate: Number(e.target.value)})}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowReadingModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Reading</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. GENERATE BILL MODAL */}
      {showBillModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel animate-fade-in" style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Generate Monthly Bill</h3>
              <button onClick={() => setShowBillModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBillSubmit}>
              <div className="form-group">
                <label className="form-label">Active Booking</label>
                <select 
                  className="form-input" required style={{ background: 'var(--bg-secondary)' }}
                  value={billForm.bookingId}
                  onChange={(e) => setBillForm({...billForm, bookingId: e.target.value})}
                >
                  <option value="">Select active booking</option>
                  {bookings.filter(b => b.status.toLowerCase() === 'booked').map(b => (
                    <option key={b.id} value={b.id}>Room {b.roomNumber} - Tenant: {b.customerName}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Billing Month</label>
                <input 
                  type="month" className="form-input" required
                  value={billForm.billingMonth}
                  onChange={(e) => setBillForm({...billForm, billingMonth: e.target.value})}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label className="form-label">Fallback Unit Rate (If no meter reading logged)</label>
                <input 
                  type="number" className="form-input" required min={0} step="0.01"
                  value={billForm.fallbackUnitRate}
                  onChange={(e) => setBillForm({...billForm, fallbackUnitRate: Number(e.target.value)})}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowBillModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Generate Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. RECEIVE PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel animate-fade-in" style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Receive Bill Payment</h3>
              <button onClick={() => setShowPaymentModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ 
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', 
              padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '20px'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Billing Info - Room {showPaymentModal.roomNumber}</span>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '4px' }}>Tenant: {showPaymentModal.customerName}</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)', marginTop: '4px' }}>
                Remaining Balance: ${(showPaymentModal.totalAmount - showPaymentModal.paidAmount).toFixed(2)}
              </p>
            </div>

            <form onSubmit={handlePaymentSubmit}>
              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label className="form-label">Payment Amount ($)</label>
                <input 
                  type="number" className="form-input" required min={0.01} step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowPaymentModal(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--success)' }}>Record Paid</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
