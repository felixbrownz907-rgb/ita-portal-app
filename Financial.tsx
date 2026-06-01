import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DollarSign, Download, Plus, Receipt, TrendingUp, AlertCircle, Hash, Calendar, ShieldCheck, History, FileText, Filter, Search, Check, X, Camera, Link2, CreditCard, Users, RotateCcw } from 'lucide-react';
import { cn } from '../components/utils';
import { motion, AnimatePresence } from 'motion/react';

export function Financial() {
  const { payments, students, addPayment, updatePayment, approvePayment, rejectPayment, auditLogs, addAuditLog, invoices, addInvoice, user, courses, submitPIN, submitPaymentProof, mentorBookings, updateMentorBooking, refreshData } = useAuth();
  const [activeTab, setActiveTab] = useState<'ledger' | 'audit' | 'invoices' | 'verify' | 'check' | 'students-audit' | 'student-pin' | 'submit-proof' | 'mentor-bookings'>('ledger');
  const [paymentIdToCheck, setPaymentIdToCheck] = useState('');
  const [checkResult, setCheckResult] = useState<{status: string, modules: number} | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [isSubmittingPin, setIsSubmittingPin] = useState(false);
  
  const [proofData, setProofData] = useState({ amount: '', transactionId: '', notes: '', type: 'Fees' as 'Fees' | 'Mentor' });
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Manual receipts registry local state synced from window matrix
  const [ledgerTransactions, setLedgerTransactions] = useState(() => (window as any).AcademyFinanceLedger || []);
  const [editingTxnId, setEditingTxnId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    amountPaid: 0,
    balanceDue: 0,
    paymentStatus: 'PENDING' as 'PENDING' | 'VERIFIED' | 'REJECTED'
  });

  React.useEffect(() => {
    const handleUpdate = () => {
      setLedgerTransactions([...((window as any).AcademyFinanceLedger || [])]);
    };
    window.addEventListener('academy-finance-updated', handleUpdate);
    
    // Bind dynamic refresh UI handlers to React state setters
    (window as any).refreshAdminFinanceTable = () => {
      setLedgerTransactions([...((window as any).AcademyFinanceLedger || [])]);
    };

    return () => {
      window.removeEventListener('academy-finance-updated', handleUpdate);
    };
  }, []);

  const MODULE_COST = 500; 

  const isStudent = user?.role === 'student';
  const studentData = user?.studentData;
  const isAdmin = user?.role === 'admin';

  const totalPaid = payments.filter(p => p.status === 'Approved').reduce((sum, p) => sum + p.amountPaid, 0);
  const totalBalance = payments.filter(p => p.status === 'Approved').reduce((sum, p) => sum + p.balance, 0);
  const pendingPayments = payments.filter(p => p.status === 'Pending');
  const totalPaidStudents = students.filter(s => s.paymentStatus === 'Cleared').length;
  const myPayments = payments.filter(p => p.studentId === studentData?.studentId);
  const myPendingPayment = myPayments.find(p => p.status === 'Pending');

  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentData) return;
    setIsSubmittingProof(true);
    setSubmissionError(null);
    try {
      if (proofData.type === 'Fees') {
        await submitPaymentProof({
          studentId: studentData.studentId,
          studentName: studentData.fullName,
          amountPaid: Number(proofData.amount),
          balance: 0,
          transactionId: proofData.transactionId,
          accountNumber: 'Transferred to Academy Account'
        });
      } else {
        // Mentor payment - find a pending booking or create a payment record
        await addPayment({
          id: '',
          studentId: studentData.studentId,
          studentName: studentData.fullName,
          amountPaid: Number(proofData.amount),
          balance: 0,
          paymentDate: new Date().toISOString(),
          status: 'Pending',
          accountNumber: `Mentor Booking Ref: ${proofData.transactionId}`,
          transactionId: proofData.transactionId
        });
      }
      setProofData({ amount: '', transactionId: '', notes: '', type: 'Fees' });
      setSubmissionSuccess(true);
      setTimeout(() => setSubmissionSuccess(false), 5000);
    } catch (err: any) {
      console.error("Submission error:", err);
      setSubmissionError(err.message || "Transmission failure. Please check your data or try again later.");
    } finally {
      setIsSubmittingProof(false);
    }
  };

  const handleCheckPayment = () => {
    const payment = payments.find(p => p.id === paymentIdToCheck || p.studentId === paymentIdToCheck);
    if (payment && payment.status === 'Approved') {
      setCheckResult({
        status: 'Confirmed',
        modules: Math.floor(payment.amountPaid / MODULE_COST)
      });
    } else {
      setCheckResult({ status: 'Not Found or Pending', modules: 0 });
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput) return;
    setIsSubmittingPin(true);
    setSubmissionError(null);
    try {
      await submitPIN(pinInput);
      setPinInput('');
      setSubmissionSuccess(true);
      setTimeout(() => setSubmissionSuccess(false), 5000);
    } catch (err: any) {
      setSubmissionError(err.message || "Failed to validate PIN.");
    } finally {
      setIsSubmittingPin(false);
    }
  };

  if (isStudent) {
    const isLocked = studentData?.paymentStatus !== 'Cleared';
    
    return (
      <div className="space-y-12 max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-black uppercase tracking-tighter text-gray-900 italic">Financial Gateway</h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.4em] text-[10px]">Academic Treasury // Student Access Node</p>
          
          {isLocked && (
            <div className="bg-red-500 text-white p-6 rounded-[2rem] border-4 border-red-600 shadow-2xl flex flex-col items-center gap-4 animate-bounce">
              <div className="flex items-center gap-4">
                <AlertCircle className="w-10 h-10" />
                <h2 className="text-2xl font-black uppercase tracking-widest leading-none">System Restricted</h2>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 max-w-lg">
                "You can't open academic modules because you haven't made your first payment, or unless being given permission by the admin."
              </p>
              <div className="bg-black/20 p-4 rounded-2xl border border-white/10 w-full text-left space-y-2">
                 <p className="text-[9px] font-black uppercase text-white/60">Required Initial Deposits:</p>
                 <div className="flex justify-between text-[10px] font-black italic">
                    <span>3 Months Program - K650 total</span>
                    <span>K200 initial deposit</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-black italic">
                    <span>6 Months Program - K1200 total</span>
                    <span>K200 initial deposit</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-black italic">
                    <span>6 Weeks Intensive - K450 total</span>
                    <span>K150 initial deposit</span>
                 </div>
                 <div className="h-px bg-white/10 my-2" />
                 <p className="text-[11px] font-black text-center text-primary italic underline uppercase tracking-widest">Send all payments to: 0779417675</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-900 rounded-[48px] p-12 text-white shadow-2xl relative overflow-hidden group border-4 border-white/5">
           <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <ShieldCheck className="w-64 h-64" />
           </div>

           <div className="relative z-10 space-y-10">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                 <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">Account Ownership</p>
                    <h3 className="text-3xl font-black italic tracking-tighter leading-none">{studentData?.fullName}</h3>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-2">{studentData?.studentId} // ADM {studentData?.admissionYear}</p>
                 </div>
                 <div className="flex flex-col md:flex-row gap-4 items-center">
                   <button 
                      onClick={async () => {
                        const btn = document.getElementById('sync-fiscal-btn');
                        if (btn) btn.classList.add('animate-spin');
                        try {
                          await refreshData();
                          // Force a brief delay for state propagation
                          setTimeout(() => window.location.reload(), 800);
                        } finally {
                          if (btn) btn.classList.remove('animate-spin');
                        }
                      }}
                      className="bg-primary/20 text-primary p-4 rounded-2xl flex items-center gap-2 hover:bg-primary hover:text-secondary transition-all shadow-lg border border-primary/20 group/sync"
                      title="Force Profile Synchronization"
                    >
                      <RotateCcw id="sync-fiscal-btn" className="w-5 h-5 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">Synchronize Portal</span>
                    </button>
                   {(studentData?.paymentStatus === 'Pending Approval' || myPendingPayment) && (
                     <div className="bg-amber-500/20 border-2 border-amber-500/30 px-6 py-3 rounded-2xl animate-pulse flex items-center gap-3">
                       <History className="w-5 h-5 text-amber-500" />
                       <div className="text-left">
                          <p className="text-[8px] font-black uppercase tracking-widest text-amber-500">Verification Pending</p>
                          <p className="text-[10px] font-bold text-white italic">Administrator Reviewing</p>
                       </div>
                     </div>
                   )}
                   <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center min-w-[200px]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Status</p>
                      <p className="text-xl font-black italic tracking-tight">{studentData?.paymentStatus || 'Cleared'}</p>
                   </div>
                 </div>
              </div>

              <div className="h-px bg-white/10" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 {/* Transaction ID Submission */}
                 <div className="space-y-6 text-left">
                    <div className="flex justify-between items-end px-1">
                       <h4 className="text-sm font-black uppercase tracking-widest text-primary italic">Submit Transaction ID</h4>
                       <div className="text-right">
                          <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">E-Wallet Node</p>
                          <p className="text-xs font-black text-white italic">0779417675 / 0973685936</p>
                       </div>
                    </div>
                    
                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 mb-4">
                       <p className="text-[9px] font-black text-primary uppercase tracking-widest leading-relaxed">
                          Note: Please ensure the Transaction ID is copied exactly from your mobile provider's SMS notification.
                       </p>
                    </div>

                    <form onSubmit={handleProofSubmit} className="space-y-4">
                       <AnimatePresence>
                          {submissionSuccess && (
                             <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-center"
                             >
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Transmission Successful</p>
                                <p className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest mt-1">Status: Pending Verification</p>
                             </motion.div>
                          )}
                          {submissionError && (
                             <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center"
                             >
                                <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Transmission Failed</p>
                                <p className="text-[9px] font-bold text-red-500/60 uppercase tracking-widest mt-1">{submissionError}</p>
                             </motion.div>
                          )}
                       </AnimatePresence>
                       <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/10 mb-6 font-black">
                          {['Fees', 'Mentor'].map((t) => (
                             <button
                                key={t}
                                type="button"
                                onClick={() => setProofData({ ...proofData, type: t as any })}
                                className={cn(
                                   "flex-1 py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all",
                                   proofData.type === t ? "bg-primary text-secondary shadow-lg" : "text-white/60 hover:text-white"
                                )}
                             >
                                {t === 'Fees' ? 'Academic Fee' : 'Mentor Booking'}
                             </button>
                          ))}
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-white/50 px-1">Transaction ID Reference</label>
                          <input 
                            required
                            placeholder="TXN123456789"
                            className="w-full h-14 bg-black/40 border border-white/10 px-6 rounded-2xl outline-none focus:border-primary font-bold text-sm text-white placeholder-white/20"
                            value={proofData.transactionId}
                            onChange={e => setProofData({...proofData, transactionId: e.target.value})}
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-white/50 px-1">Amount Transferred (K)</label>
                          <input 
                            type="number"
                            required
                            placeholder="500"
                            className="w-full h-14 bg-black/40 border border-white/10 px-6 rounded-2xl outline-none focus:border-primary font-bold text-sm text-white placeholder-white/20"
                            value={proofData.amount}
                            onChange={e => setProofData({...proofData, amount: e.target.value})}
                          />
                       </div>
                       <button 
                         type="submit"
                         disabled={isSubmittingProof}
                         className="w-full py-4 bg-primary text-secondary rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                       >
                         {isSubmittingProof ? 'Transmitting...' : 'Transmit Transaction ID'}
                       </button>
                    </form>
                 </div>

                 {/* Legacy PIN Support */}
                 <div className="space-y-6 text-left border-l border-white/5 pl-10">
                    <h4 className="text-sm font-black uppercase tracking-widest text-white/40 italic">Secured PIN Validation</h4>
                    <form onSubmit={handlePinSubmit} className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-white/30 px-1">Enter PIN</label>
                          <input 
                            required
                            placeholder="XXXXXX"
                            className="w-full h-14 bg-black/40 border border-white/10 px-6 rounded-2xl outline-none focus:border-primary font-black text-xl tracking-[0.3em] text-white placeholder-white/20"
                            maxLength={10}
                            value={pinInput}
                            onChange={e => setPinInput(e.target.value)}
                          />
                       </div>
                       <button 
                        disabled={isSubmittingPin}
                        className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all disabled:opacity-50"
                       >
                         {isSubmittingPin ? 'Verifying...' : 'Validate PIN'}
                       </button>
                    </form>
                 </div>
              </div>
            </div>
        </div>

        <div className="space-y-6">
            {/* Manual Finance Registry Engine & Receipts Matrix */}
            <div className="space-y-6 mb-12">
               <div className="text-left font-bold">
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 italic flex items-center gap-3">
                     <Receipt className="w-4 h-4 text-primary" /> Manual Finance Registry Matrix
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 font-sans">Official Receipts & Verification Ledger</p>
               </div>

               <div className="financial-registry-receipts matrix-grid grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Filter for current student's records */}
                  {ledgerTransactions.filter((txn: any) => 
                     txn.studentId === studentData?.studentId || 
                     (studentData?.fullName && txn.studentName && txn.studentName.toLowerCase().includes(studentData.fullName.toLowerCase()))
                  ).map((txn: any, idx: number) => {
                     const isVerified = txn.paymentStatus === "VERIFIED";
                     const isRejected = txn.paymentStatus === "REJECTED";
                     const isCompleted = txn.balanceDue <= 0 && isVerified;
                     const statusColor = isCompleted || isVerified ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5 mr-1" : isRejected ? "text-red-500 border-red-500/20 bg-red-500/5 mr-1" : "text-amber-500 border-amber-500/20 bg-amber-500/5 mr-1";
                     
                     return (
                        <div key={txn.transactionId || idx} className="bg-white p-8 rounded-[36px] border border-gray-100 shadow-xl relative overflow-hidden group hover:border-primary transition-all text-left">
                           <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-[40px] flex items-center justify-center text-gray-300 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                              <Receipt className="w-8 h-8" />
                           </div>
                           
                           <div className="space-y-6 animate-in fade-in duration-300">
                              <div className="flex justify-between items-center pr-12">
                                 <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 font-mono">TXN ID</p>
                                    <h4 className="text-lg font-black text-secondary italic tracking-tight font-mono">{txn.transactionId}</h4>
                                 </div>
                                 <span className={cn(
                                    "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm font-bold",
                                    statusColor
                                 )}>
                                    {isCompleted ? "COMPLETED" : txn.paymentStatus}
                                 </span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-100 py-6">
                                 <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5 italic font-mono font-bold">Amount Paid</p>
                                    <p className="text-2xl font-black italic text-gray-900 tracking-tighter">K{txn.amountPaid}</p>
                                 </div>
                                 <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5 italic font-mono font-bold">Balance Due</p>
                                    <p className={cn(
                                       "text-2xl font-black italic tracking-tighter",
                                       txn.balanceDue > 0 ? "text-red-600" : "text-emerald-600"
                                    )}>K{txn.balanceDue}</p>
                                 </div>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                 <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5 font-mono">STUDENT ID</p>
                                    <p className="text-xs font-bold text-gray-700 tracking-wider font-mono">{txn.studentId}</p>
                                 </div>
                                 <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5 font-mono font-bold text-right">REFERENCE</p>
                                    <p className="text-xs font-bold text-gray-500 tracking-wider text-right font-mono">{txn.receiptReference}</p>
                                 </div>
                              </div>
                           </div>
                        </div>
                     );
                  })}
                  {ledgerTransactions.filter((txn: any) => 
                     txn.studentId === studentData?.studentId || 
                     (studentData?.fullName && txn.studentName && txn.studentName.toLowerCase().includes(studentData.fullName.toLowerCase()))
                  ).length === 0 && (
                     <div className="col-span-full py-12 px-8 text-center bg-gray-50/50 rounded-[40px] border-4 border-dashed border-gray-100 text-gray-400 font-bold">
                        <p className="text-[10px] font-black uppercase tracking-widest">No custom ledger entries registered under your ID.</p>
                        <p className="text-[9px] font-bold text-gray-400/60 uppercase tracking-widest mt-2 font-mono">Any manual payments sent to 0779417675 will be securely processed and displayed here once approved by the administrator.</p>
                     </div>
                  )}
               </div>
            </div>

           <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 italic flex items-center gap-3">
             <History className="w-4 h-4 text-primary" /> Recent Fiscal Activity
           </h3>
           <div className="space-y-4">
              {myPayments.length > 0 ? [...myPayments].reverse().map(p => (
                <div key={p.id} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between shadow-sm group hover:border-primary transition-all">
                   <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all">
                         <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                         <p className="text-sm font-black uppercase italic text-gray-900 leading-none mb-1">REF: {p.transactionId || 'N/A'}</p>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(p.paymentDate).toLocaleDateString()}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-base font-black italic text-gray-900 tracking-tighter leading-none mb-1">K{p.amountPaid}</p>
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                        p.status === 'Approved' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                      )}>{p.status}</span>
                   </div>
                </div>
              )) : (
                <div className="py-20 text-center bg-gray-50 rounded-[40px] border-4 border-dashed border-gray-100">
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">No transactions recorded in the current session</p>
                </div>
              )}
           </div>
        </div>
      </div>
    );
  }
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    studentId: students[0]?.id || '',
    amountPaid: 0,
    balance: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    evidenceUrl: '',
    accountNumber: '0779417675'
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === formData.studentId);
    if (!student) return;

    addPayment({
      ...formData,
      id: '',
      studentId: student.studentId,
      studentName: student.fullName,
      status: 'Pending'
    });
    
    setIsAdding(false);
  };

  const handleReject = (paymentId: string) => {
    rejectPayment(paymentId);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end text-left">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-gray-900 uppercase">Financial Center</h1>
          <p className="text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Academic Treasury // Integrated Fiscal Gateway</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest italic">Total Paid Students: {totalPaidStudents}</p>
          </div>
          <div className="flex flex-wrap md:flex-nowrap md:overflow-x-auto md:no-scrollbar gap-2 p-1.5 bg-secondary/5 rounded-2xl border border-secondary/10">
            {[
              { id: 'ledger', label: 'Financial Ledger', icon: TrendingUp },
              { id: 'verify', label: 'Verify Queue', icon: ShieldCheck, count: pendingPayments.length, adminOnly: true },
              { id: 'students-audit', label: 'Arrears Audit', icon: AlertCircle, adminOnly: true },
              { id: 'mentor-bookings', label: 'Mentors', icon: Users, count: mentorBookings.filter(b => b.status === 'Pending').length, adminOnly: true },
              { id: 'invoices', label: 'Invoices', icon: FileText, adminOnly: true },
              { id: 'check', label: 'ID Check', icon: Hash },
              { id: 'audit', label: 'Logs', icon: History, adminOnly: true }
            ].filter(t => !t.adminOnly || isAdmin).map(t => (
             <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all relative",
                activeTab === t.id ? "bg-secondary text-white shadow-xl" : "text-gray-400 hover:text-gray-600 hover:bg-white"
              )}
             >
               <t.icon className="w-3.5 h-3.5" />
               {t.label}
               {t.count && t.count > 0 && (
                 <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center text-[8px] animate-bounce font-black shadow-lg shadow-primary/40">
                   {t.count}
                 </span>
               )}
             </button>
           ))}
        </div>
      </div>
    </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div className="bg-white p-8 rounded-[40px] border-2 border-gray-100 shadow-xl flex items-center gap-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-24 h-24" />
          </div>
          <div className="bg-emerald-50 text-emerald-600 w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl relative z-10 transition-transform group-hover:-translate-y-1">
             <TrendingUp className="w-10 h-10" />
          </div>
          <div className="relative z-10 text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Verified Revenue</p>
            <p className="text-4xl font-black italic text-gray-900 tracking-tighter">K{totalPaid.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border-2 border-gray-100 shadow-xl flex items-center gap-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
            <Users className="w-24 h-24" />
          </div>
          <div className="bg-blue-50 text-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl relative z-10 transition-transform group-hover:-translate-y-1">
             <Users className="w-10 h-10" />
          </div>
          <div className="relative z-10 text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Paid Students</p>
            <p className="text-4xl font-black italic text-gray-900 tracking-tighter">{totalPaidStudents}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border-2 border-gray-100 shadow-xl flex items-center gap-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
            <AlertCircle className="w-24 h-24" />
          </div>
          <div className="bg-amber-50 text-amber-500 w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl relative z-10 transition-transform group-hover:-translate-y-1">
             <AlertCircle className="w-10 h-10" />
          </div>
          <div className="relative z-10 text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Outstanding Arrears</p>
            <p className="text-4xl font-black italic text-gray-900 tracking-tighter">K{totalBalance.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-secondary p-8 rounded-[40px] text-white shadow-xl flex items-center gap-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <ShieldCheck className="w-24 h-24" />
          </div>
          <div className="bg-primary text-secondary w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl relative z-10 transition-transform group-hover:-translate-y-1">
             <CreditCard className="w-10 h-10" />
          </div>
          <div className="relative z-10 text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Queue Status</p>
            <div className="flex items-baseline gap-2">
               <p className="text-4xl font-black italic text-white tracking-tighter">{pendingPayments.length}</p>
               <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Pending</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <h3 className="text-xl font-black uppercase tracking-tight text-secondary italic flex items-center gap-4">
             <div className="w-2 h-2 bg-primary rounded-full animate-pulse" /> Fiscal Operations
           </h3>
           <div className="flex gap-4">
              <button 
                onClick={() => setIsAdding(true)}
                className="bg-primary text-secondary px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4" /> Deposit Protocol
              </button>
           </div>
        </div>

        {isAdding && (
          <div className="bg-white p-12 rounded-[48px] border-2 border-primary shadow-2xl animate-in zoom-in-95 duration-300">
             <h2 className="text-2xl font-black italic mb-8 uppercase text-gray-900 flex items-center gap-3">
                <Receipt className="w-8 h-8 text-primary" /> Institutional Payment Deposit
             </h2>
              <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="space-y-3 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1 italic">Academic Entity (Student)</label>
                  <select className="w-full h-16 bg-gray-50 border-0 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-sm" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})}>
                    {students.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.studentId})</option>)}
                  </select>
                </div>
                <div className="space-y-3 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1 italic">Target Account</label>
                  <select className="w-full h-16 bg-gray-50 border-0 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-sm" onChange={e => setFormData({...formData, accountNumber: e.target.value})}>
                    <option value="0779417675">Admin & Certificates (0779417675)</option>
                    <option value="0766149405">1-on-1 Sessions (0766149405)</option>
                  </select>
                </div>
                <div className="space-y-3 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1 italic">Transaction Value (K)</label>
                  <input type="number" required className="w-full h-16 bg-gray-50 border-0 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold" value={formData.amountPaid} onChange={e => setFormData({...formData, amountPaid: Number(e.target.value)})} />
                </div>
                <div className="md:col-span-1 space-y-3 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1 italic">Balance Remaining (K)</label>
                  <input type="number" required className="w-full h-16 bg-gray-50 border-0 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold" value={formData.balance} onChange={e => setFormData({...formData, balance: Number(e.target.value)})} />
                </div>
                <div className="md:col-span-2 space-y-3 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1 italic">Proof of Deposit (Evidence Link)</label>
                  <div className="relative">
                     <Link2 className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                     <input className="w-full h-16 bg-gray-50 border-0 pl-16 pr-6 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-sm" placeholder="https://..." value={formData.evidenceUrl} onChange={e => setFormData({...formData, evidenceUrl: e.target.value})} />
                  </div>
                </div>
                <div className="md:col-span-3 flex gap-6 pt-6">
                  <button type="submit" className="flex-1 bg-secondary text-white py-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:scale-[1.02] transition-all">Submit for Verification</button>
                  <button type="button" onClick={() => setIsAdding(false)} className="px-16 bg-gray-100 text-gray-500 py-6 rounded-2xl font-black uppercase tracking-widest text-xs">Abort</button>
                </div>
              </form>
          </div>
        )}

        <div className="bg-white rounded-[48px] border border-gray-100 shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
           <div className="flex border-b border-gray-50">
               {[
                { id: 'ledger', label: 'Financial Ledger', icon: TrendingUp },
                { id: 'verify', label: 'Verification Queue', icon: ShieldCheck, count: pendingPayments.length },
                { id: 'check', label: 'Payment Confirmation', icon: Hash },
                { id: 'mentor-bookings', label: 'Mentor Session Payments', icon: Users, count: mentorBookings.filter(b => b.status === 'Pending').length },
                { id: 'students-audit', label: 'Student Debt Audit', icon: Users },
                { id: 'invoices', label: 'Certificate Invoices', icon: FileText },
                { id: 'audit', label: 'Security Audit', icon: History }
              ].map(t => (
                <button
                 key={t.id}
                 onClick={() => setActiveTab(t.id as any)}
                 className={cn(
                   "flex-1 px-8 py-8 text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all relative border-r last:border-r-0 border-gray-50",
                   activeTab === t.id ? "bg-white text-secondary" : "bg-gray-50/50 text-gray-400 hover:bg-white"
                 )}
                >
                  {activeTab === t.id && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />}
                  <t.icon className={cn("w-5 h-5", activeTab === t.id ? "text-primary" : "text-gray-300")} />
                  {t.label}
                  {t.count && t.count > 0 && (
                    <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-black">
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
           </div>

           <div className="flex-1 p-10">
              {activeTab === 'ledger' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                   {/* Manual Receipts Department Ledger Matrix */}
                   <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-xl space-y-8 text-left">
                     <div className="flex justify-between items-center bg-gray-50/50 p-6 rounded-[32px] border border-gray-100/30">
                       <div className="text-left font-bold">
                         <h3 className="text-lg font-black text-secondary uppercase tracking-tight flex items-center gap-3 italic">
                           <Receipt className="w-5 h-5 text-primary animate-pulse" /> Manual Receipt Ledger Matrix
                         </h3>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 font-sans">
                           Official Student Account Synchronization Registry
                         </p>
                       </div>
                       <button
                         type="button"
                         onClick={() => {
                           const newId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
                           const newRecord = {
                             transactionId: newId,
                             studentId: `SEC-2026-N${Math.floor(100 + Math.random() * 900)}`,
                             studentName: "Felix Chisenga",
                             program: "Software Engineering Diploma",
                             amountPaid: 200,
                             balanceDue: 0,
                             paymentStatus: "PENDING" as const,
                             receiptReference: `MANUAL_Ref_${Math.floor(1000 + Math.random() * 9000)}`
                           };
                           // Add to global window ledger
                           (window as any).AcademyFinanceLedger.push(newRecord);
                           setLedgerTransactions([...(window as any).AcademyFinanceLedger]);
                           // Highlight edit mode
                           setEditingTxnId(newId);
                           setEditForm({
                             amountPaid: 200,
                             balanceDue: 0,
                             paymentStatus: "PENDING"
                           });
                         }}
                         className="flex items-center gap-2 bg-primary text-secondary px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-secondary hover:text-white transition-all shadow"
                       >
                         <Plus className="w-4 h-4" /> Register Transaction Entry
                       </button>
                     </div>

                     <div className="overflow-x-auto rounded-[32px] border border-gray-100 overflow-hidden">
                       <table className="w-full text-left border-collapse">
                         <thead>
                           <tr className="bg-gray-50/80 border-b border-gray-100">
                             <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Student Identity</th>
                             <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Transaction ID</th>
                             <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Program / Course</th>
                             <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Reference Info</th>
                             <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Metrics (Amount / Balance)</th>
                             <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Status State</th>
                             <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Registry Sync</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-50 font-bold">
                           {ledgerTransactions.map((txn: any) => {
                             const isEditing = editingTxnId === txn.transactionId;
                             return (
                               <tr 
                                 key={txn.transactionId}
                                 onClick={() => {
                                   if (!isEditing && !editingTxnId) {
                                     setEditingTxnId(txn.transactionId);
                                     setEditForm({
                                       amountPaid: txn.amountPaid,
                                       balanceDue: txn.balanceDue,
                                       paymentStatus: txn.paymentStatus
                                     });
                                   }
                                 }}
                                 className={cn(
                                   "transition-colors cursor-pointer border-b border-gray-50",
                                   isEditing ? "bg-primary/5 hover:bg-primary/5" : "hover:bg-gray-50/20"
                                 )}
                               >
                                 <td className="px-10 py-8">
                                   {isEditing ? (
                                     <div className="space-y-2" onClick={e => e.stopPropagation()}>
                                       <div className="space-y-1">
                                         <label className="text-[8px] font-black uppercase text-gray-400 block font-mono">Student Name</label>
                                         <input 
                                           type="text"
                                           className="h-10 bg-white border border-gray-200 rounded-xl px-3 text-xs font-bold w-48 outline-none focus:border-primary"
                                           defaultValue={txn.studentName}
                                           onChange={e => { txn.studentName = e.target.value; }}
                                         />
                                       </div>
                                       <div className="space-y-1">
                                         <label className="text-[8px] font-black uppercase text-gray-400 block font-mono">Student ID</label>
                                         <input 
                                           type="text"
                                           className="h-10 bg-white border border-gray-200 rounded-xl px-3 text-xs font-bold w-48 outline-none focus:border-primary font-mono"
                                           defaultValue={txn.studentId}
                                           onChange={e => { txn.studentId = e.target.value; }}
                                         />
                                       </div>
                                     </div>
                                   ) : (
                                     <div className="flex items-center gap-5">
                                       <div className="w-10 h-10 bg-secondary/5 rounded-xl flex items-center justify-center text-secondary text-sm font-black italic">
                                         {txn.studentName?.[0] || 'S'}
                                       </div>
                                       <div>
                                         <p className="text-gray-900 tracking-tight leading-none mb-1 text-sm">{txn.studentName}</p>
                                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                                           {txn.studentId}
                                         </p>
                                       </div>
                                     </div>
                                   )}
                                 </td>
                                 <td className="px-10 py-8">
                                   <span className="font-mono text-xs font-black text-secondary bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                     {txn.transactionId}
                                   </span>
                                 </td>
                                 <td className="px-10 py-8">
                                   {isEditing ? (
                                     <div className="space-y-1" onClick={e => e.stopPropagation()}>
                                       <label className="text-[8px] font-black uppercase text-gray-400 block font-mono">Program</label>
                                       <input 
                                         type="text"
                                         className="h-10 bg-white border border-gray-200 rounded-xl px-3 text-xs font-bold w-48 outline-none focus:border-primary"
                                         defaultValue={txn.program}
                                         onChange={e => { txn.program = e.target.value; }}
                                       />
                                     </div>
                                   ) : (
                                     <p className="text-xs text-gray-500 font-bold max-w-[150px] truncate">{txn.program}</p>
                                   )}
                                 </td>
                                 <td className="px-10 py-8">
                                   {isEditing ? (
                                     <div className="space-y-1" onClick={e => e.stopPropagation()}>
                                       <label className="text-[8px] font-black uppercase text-gray-400 block font-mono">Receipt Reference</label>
                                       <input 
                                         type="text"
                                         className="h-10 bg-white border border-gray-200 rounded-xl px-3 text-xs font-bold w-48 outline-none focus:border-primary font-mono"
                                         defaultValue={txn.receiptReference}
                                         onChange={e => { txn.receiptReference = e.target.value; }}
                                       />
                                     </div>
                                   ) : (
                                     <p className="text-[11px] font-black text-gray-500 font-mono italic">{txn.receiptReference}</p>
                                   )}
                                 </td>
                                 <td className="px-10 py-8">
                                   {isEditing ? (
                                     <div className="flex gap-4 items-center" onClick={e => e.stopPropagation()}>
                                       <div className="space-y-1">
                                         <label className="text-[8px] font-black uppercase text-gray-400 block font-mono">Paid (K)</label>
                                         <input 
                                           type="number"
                                           className="h-10 bg-white border border-gray-200 rounded-xl px-3 text-xs font-bold w-20 outline-none focus:border-primary font-mono"
                                           value={editForm.amountPaid}
                                           onChange={e => setEditForm({ ...editForm, amountPaid: Number(e.target.value) })}
                                         />
                                       </div>
                                       <div className="space-y-1">
                                         <label className="text-[8px] font-black uppercase text-gray-400 block font-mono">Balance (K)</label>
                                         <input 
                                           type="number"
                                           className="h-10 bg-white border border-gray-200 rounded-xl px-3 text-xs font-bold w-20 outline-none focus:border-primary font-mono"
                                           value={editForm.balanceDue}
                                           onChange={e => setEditForm({...editForm, balanceDue: Number(e.target.value)})}
                                         />
                                       </div>
                                     </div>
                                   ) : (
                                     <div className="text-left font-bold font-mono">
                                       <p className="text-xs text-emerald-600 font-bold">Paid: K{txn.amountPaid}</p>
                                       <p className="text-xs text-red-600 mt-1 font-bold">Due: K{txn.balanceDue}</p>
                                     </div>
                                   )}
                                 </td>
                                 <td className="px-10 py-8">
                                   {isEditing ? (
                                     <div className="space-y-1" onClick={e => e.stopPropagation()}>
                                       <label className="text-[8px] font-black uppercase text-gray-400 block font-mono">Status</label>
                                       <select
                                         className="h-10 bg-white border border-gray-200 rounded-xl px-2 text-xs font-bold outline-none focus:border-primary"
                                         value={editForm.paymentStatus}
                                         onChange={e => setEditForm({...editForm, paymentStatus: e.target.value as any})}
                                       >
                                         <option value="PENDING" className="font-bold">PENDING</option>
                                         <option value="VERIFIED" className="font-bold">VERIFIED</option>
                                         <option value="REJECTED" className="font-bold">REJECTED</option>
                                       </select>
                                     </div>
                                   ) : (
                                     <span className={cn(
                                       "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border font-mono font-bold",
                                       txn.paymentStatus === "VERIFIED" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                       txn.paymentStatus === "REJECTED" ? "bg-red-50 text-red-600 border-red-200" : "bg-amber-50 text-amber-600 border-amber-200"
                                     )}>
                                       {txn.paymentStatus}
                                     </span>
                                   )}
                                 </td>
                                 <td className="px-10 py-8 text-right">
                                   {isEditing ? (
                                     <div className="flex gap-2 justify-end" onClick={e => e.stopPropagation()}>
                                       <button
                                         type="button"
                                         onClick={() => {
                                           // Execute manual updates through core system interface
                                           (window as any).updateStudentFinanceRecord(txn.transactionId, {
                                             amountPaid: editForm.amountPaid,
                                             balanceDue: editForm.balanceDue,
                                             paymentStatus: editForm.paymentStatus
                                           });
                                           setEditingTxnId(null);
                                         }}
                                         className="bg-primary text-secondary px-4 py-2 border border-primary/20 rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-secondary hover:text-white transition-all shadow-sm font-bold"
                                       >
                                         Save Changes
                                       </button>
                                       <button
                                         type="button"
                                         onClick={() => setEditingTxnId(null)}
                                         className="bg-gray-100 text-gray-500 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-gray-200 transition-all border border-gray-200 font-bold"
                                       >
                                         Cancel
                                       </button>
                                     </div>
                                   ) : (
                                     <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest font-mono opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                                       Click Row to Sync
                                     </p>
                                   )}
                                 </td>
                               </tr>
                             );
                           })}
                         </tbody>
                       </table>
                     </div>
                   </div>

                   {/* Standard Payment Registry Summary Header */}
                   <div className="space-y-6">
                     <div className="text-left font-bold">
                       <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 italic flex items-center gap-3">
                         <History className="w-4 h-4 text-primary" /> Core Institution Revenues
                       </h3>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                         Verified Digital Payments & Archives
                       </p>
                     </div>
                     <div className="overflow-x-auto rounded-[32px] border border-gray-100 overflow-hidden bg-white">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-100">
                          <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Student Identity</th>
                          <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Transaction ID</th>
                          <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Financial Metrics</th>
                          <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Account State</th>
                          <th className="px-10 py-8 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 font-bold">
                        {payments.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50/20 transition-colors group">
                            <td className="px-10 py-10">
                              <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-xl font-black italic">
                                   {p.studentName?.[0] || 'S'}
                                </div>
                                <div>
                                  <p className="text-gray-900 tracking-tight leading-none mb-2 text-base">{p.studentName}</p>
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 font-mono">
                                    {p.studentId}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-10 py-10">
                              <div className="flex items-center gap-2">
                                <Hash className="w-3.5 h-3.5 text-primary/40" />
                                <span className="text-[11px] font-black uppercase tracking-widest text-gray-600 font-mono">
                                  {p.transactionId || 'NO_TXN_ID'}
                                </span>
                              </div>
                              <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-1">
                                {new Date(p.paymentDate).toLocaleDateString()}
                              </p>
                            </td>
                            <td className="px-10 py-10">
                              <div className="space-y-2">
                                 <p className="text-[12px] font-black text-emerald-600 uppercase tracking-widest">K{p.amountPaid} <span className="text-gray-300 text-[8px] italic">REVENUE</span></p>
                                 <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
                                 </div>
                              </div>
                            </td>
                            <td className="px-10 py-10">
                              <span className={cn(
                                "px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border shadow-sm",
                                p.status === 'Approved' ? "bg-emerald-500 text-white border-emerald-400" :
                                p.status === 'Rejected' ? "bg-red-500 text-white border-red-400" : "bg-primary text-secondary border-primary/20"
                              )}>
                                {p.status}
                              </span>
                            </td>
                            <td className="px-10 py-10 text-right">
                               <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {p.evidenceUrl && (
                                    <a href={p.evidenceUrl} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all shadow-sm">
                                      <Camera className="w-5 h-5" />
                                    </a>
                                  )}
                                  <button className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-secondary hover:border-secondary transition-all shadow-sm">
                                    <Download className="w-5 h-5" />
                                  </button>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              )}

              {activeTab === 'verify' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                   <div className="bg-amber-50 border-2 border-amber-100 p-8 rounded-[3rem] flex items-center gap-6">
                      <div className="w-16 h-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                         <ShieldCheck className="w-10 h-10" />
                      </div>
                      <div>
                         <h3 className="text-2xl font-black uppercase text-amber-900 italic tracking-tighter">Fiscal Verification Queue</h3>
                         <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest italic">Authenticating academic node access payloads</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 gap-4">
                      {pendingPayments.map(p => (
                        <div key={p.id} className="p-6 bg-white shadow-xl rounded-[2.5rem] border-2 border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/50 transition-all group relative overflow-hidden">
                           <div className="flex gap-5 items-center flex-1">
                              <div className="w-14 h-14 bg-secondary text-primary rounded-2xl flex items-center justify-center shadow-lg shrink-0 group-hover:scale-110 transition-transform">
                                 <CreditCard className="w-7 h-7" />
                              </div>
                              <div className="text-left flex-1 min-w-0">
                                 <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className="text-[7px] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-amber-500 text-white rounded-full font-mono">PENDING_REVIEW</span>
                                    <span className="text-[8px] font-black text-secondary uppercase tracking-widest italic bg-gray-100 px-2 py-0.5 rounded border border-gray-200 truncate max-w-[150px]">
                                       REF: {p.transactionId || 'NO_ID'}
                                    </span>
                                 </div>
                                 <h4 className="text-xl font-black text-gray-900 italic tracking-tighter truncate leading-tight">{p.studentName}</h4>
                                 <p className="text-[9px] font-bold text-gray-400 font-mono tracking-widest uppercase truncate">
                                    ID: {p.studentId} // {new Date(p.paymentDate).toLocaleDateString()}
                                 </p>
                              </div>
                           </div>
                           
                           <div className="bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100 shadow-inner flex flex-col items-center md:items-end justify-center min-w-[150px]">
                              <p className="text-[8px] font-black uppercase tracking-widest text-emerald-700/60 mb-1 leading-none">Net Amount</p>
                              <p className="text-3xl font-black text-emerald-600 tracking-tighter italic leading-none">K{p.amountPaid.toLocaleString()}</p>
                           </div>

                           <div className="flex flex-row md:flex-col lg:flex-row gap-2">
                                 <button 
                                   onClick={() => approvePayment(p.id)}
                                   className="flex-1 min-w-[120px] bg-primary text-secondary px-6 py-4 rounded-xl font-black uppercase tracking-widest text-[9px] shadow-lg hover:bg-secondary hover:text-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                                 >
                                    <Check className="w-4 h-4" /> AUTHORIZE
                                 </button>
                                 <div className="flex gap-2">
                                    <button 
                                      onClick={() => handleReject(p.id)}
                                      className="w-12 h-14 bg-gray-50 text-red-500 rounded-xl font-black transition-all flex items-center justify-center hover:bg-red-500 hover:text-white"
                                      title="Reject/Void"
                                    >
                                       <X className="w-5 h-5" />
                                    </button>
                                    {p.evidenceUrl && (
                                       <a 
                                         href={p.evidenceUrl} 
                                         target="_blank" 
                                         rel="noreferrer" 
                                         className="w-12 h-14 bg-secondary text-primary rounded-xl font-black transition-all flex items-center justify-center hover:bg-black"
                                         title="View Evidence"
                                       >
                                          <Camera className="w-5 h-5" />
                                       </a>
                                    )}
                                 </div>
                           </div>
                        </div>
                      ))}
                   </div>

                   {pendingPayments.length === 0 && (
                     <div className="py-40 text-center bg-emerald-50/30 rounded-[4rem] border-4 border-dashed border-emerald-100">
                        <ShieldCheck className="w-24 h-24 text-emerald-100 mx-auto mb-8" />
                        <p className="text-3xl font-black uppercase tracking-tighter text-emerald-800 italic">Queue Clear</p>
                        <p className="text-xs font-bold text-emerald-600/40 uppercase tracking-widest mt-4">All fiscal transactions have been verified</p>
                     </div>
                   )}
                </div>
              )}

              {activeTab === 'mentor-bookings' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                   {mentorBookings.map(b => (
                     <div key={b.id} className="p-10 bg-gray-50 rounded-[40px] border-2 border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-10 hover:border-primary transition-all group">
                        <div className="flex gap-8 items-center">
                           <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl text-secondary group-hover:bg-secondary group-hover:text-primary transition-all">
                              <Calendar className="w-10 h-10" />
                           </div>
                           <div className="text-left">
                              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 italic">Mentor Session Request</p>
                              <h4 className="text-3xl font-black text-gray-900 italic leading-none mb-2">{b.studentName}</h4>
                              <p className="text-xs font-bold text-gray-300 font-mono tracking-widest uppercase">TXN: {b.transactionId} // {b.preferredTime}</p>
                           </div>
                        </div>
                        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-inner flex flex-col items-center min-w-[200px]">
                           <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-2 italic">Session Notes</p>
                           <p className="text-[10px] font-bold text-gray-600 uppercase max-w-[200px] text-center line-clamp-2">{b.notes || 'No notes provided'}</p>
                        </div>
                        <div className="flex gap-4">
                           <div className="flex flex-col gap-2">
                              <button 
                                onClick={() => updateMentorBooking(b.id, { status: 'Approved' })}
                                className="bg-emerald-500 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                              >
                                 <Check className="w-5 h-5" /> Approve Session
                              </button>
                              <button 
                                onClick={() => updateMentorBooking(b.id, { status: 'Rejected' })}
                                className="bg-white text-red-500 px-10 py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] border-2 border-red-50 shadow-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3"
                              >
                                 <X className="w-5 h-5" /> Reject
                              </button>
                           </div>
                        </div>
                     </div>
                   ))}
                   {mentorBookings.length === 0 && (
                      <div className="py-40 text-center bg-gray-50/50 rounded-[40px] border-4 border-dashed border-gray-100">
                         <Calendar className="w-24 h-24 text-gray-200 mx-auto mb-8" />
                         <p className="text-2xl font-black uppercase tracking-[0.4em] text-gray-300 italic">No Sessions Pending</p>
                      </div>
                   )}
                </div>
              )}

              {activeTab === 'invoices' && (
                 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                    {invoices.map(inv => (
                      <div key={inv.id} className="bg-gray-50 border-2 border-gray-100 rounded-[40px] p-10 shadow-xl hover:shadow-2xl hover:border-primary transition-all relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-bl-[5rem] flex items-center justify-center -mr-6 -mt-6 shadow-xl transition-all group-hover:scale-110">
                           <FileText className="w-10 h-10 text-primary" />
                        </div>
                        <div className="relative">
                          <span className="text-[10px] font-black uppercase text-gray-300 tracking-[0.5em] mb-10 block">DOC:INV{inv.id.slice(0,8).toUpperCase()}</span>
                          <h3 className="text-4xl font-black text-gray-900 italic mb-3 tracking-tighter">K{inv.amount.toLocaleString()}</h3>
                          <p className="text-xs font-bold text-gray-500 mb-10 uppercase tracking-tight leading-relaxed">{inv.description}</p>
                          <div className="flex justify-between items-end border-t border-gray-200/50 pt-8 mt-10">
                             <div>
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3">State Log</p>
                                <span className={cn(
                                  "text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full border shadow-sm",
                                  inv.status === 'Paid' ? "bg-emerald-500 text-white border-emerald-400" : "bg-orange-500 text-white border-orange-400"
                                )}>{inv.status}</span>
                             </div>
                             <button className="w-14 h-14 bg-white text-secondary rounded-2xl flex items-center justify-center shadow-xl hover:bg-primary group-hover:scale-105 transition-all">
                                <Download className="w-6 h-6" />
                             </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {invoices.length === 0 && (
                      <div className="col-span-full py-40 text-center bg-gray-50/50 rounded-[40px] border-4 border-dashed border-gray-100 text-gray-300 font-black uppercase text-xl italic">No invoice records generated</div>
                    )}
                 </div>
              )}

               {activeTab === 'check' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto py-12">
                   <div className="bg-gray-900 rounded-[40px] p-12 text-white shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-12 opacity-10">
                         <Hash className="w-48 h-48" />
                      </div>
                      <div className="relative z-10 space-y-8">
                         <div className="text-center">
                            <h3 className="text-2xl font-black uppercase tracking-tighter italic text-primary">Payment ID Verification</h3>
                            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-2">Check Coverage & Access Nodes</p>
                         </div>
                         
                         <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block px-4">Enter Payment ID or Student ID</label>
                            <div className="flex gap-4">
                               <input 
                                 type="text"
                                 className="flex-1 h-16 bg-white/10 border-0 px-8 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-black text-xl tracking-widest placeholder:text-white/10"
                                 placeholder="TRX-XXXX-XXXX"
                                 value={paymentIdToCheck}
                                 onChange={e => setPaymentIdToCheck(e.target.value)}
                               />
                               <button 
                                 onClick={handleCheckPayment}
                                 className="px-8 bg-primary text-secondary rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all"
                               >
                                 Search
                               </button>
                            </div>
                         </div>

                         {checkResult && (
                           <motion.div 
                             initial={{ opacity: 0, scale: 0.95 }}
                             animate={{ opacity: 1, scale: 1 }}
                             className="p-8 bg-white rounded-3xl text-gray-900 shadow-2xl space-y-6"
                           >
                              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                 <p className="text-[10px] font-black uppercase text-gray-400">System Status</p>
                                 <span className={cn(
                                   "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                   checkResult.status === 'Confirmed' ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                                 )}>{checkResult.status}</span>
                              </div>
                              
                              {checkResult.status === 'Confirmed' && (
                                <div className="space-y-4 text-center">
                                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Module Coverage Calculation</p>
                                   <h4 className="text-6xl font-black italic tracking-tighter text-secondary leading-none">{checkResult.modules}</h4>
                                   <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Academic Modules Covered</p>
                                   
                                   <div className="pt-6 grid grid-cols-2 gap-4">
                                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                         <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Unit Rate</p>
                                         <p className="text-sm font-black text-gray-900 italic">K{MODULE_COST}/Module</p>
                                      </div>
                                      <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                         <p className="text-[8px] font-black text-emerald-400 uppercase mb-1">Authorization</p>
                                         <p className="text-sm font-black text-emerald-600 italic">Access Granted</p>
                                      </div>
                                   </div>
                                </div>
                              )}
                           </motion.div>
                         )}
                      </div>
                   </div>
                </div>
              )}

               {activeTab === 'mentor-bookings' && (
                 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                    {mentorBookings.map(booking => (
                      <div key={booking.id} className="p-8 bg-gray-50 rounded-[40px] border-2 border-gray-100 flex items-center justify-between gap-8 hover:border-primary transition-all group text-left">
                         <div className="flex gap-6 items-center">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl text-secondary group-hover:bg-secondary group-hover:text-primary transition-all">
                               <Users className="w-8 h-8" />
                            </div>
                            <div>
                               <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-1">Mentor Request</p>
                               <h4 className="text-2xl font-black text-gray-900 italic leading-none mb-1">{booking.studentName}</h4>
                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preferred: {booking.preferredTime} // {new Date(booking.bookingDate).toLocaleDateString()}</p>
                            </div>
                         </div>
                         <div className="flex-1 px-10">
                            <div className="space-y-4 text-left">
                               <div>
                                  <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Technical Intent & Questions</p>
                                  <p className="text-sm font-bold text-gray-700 italic bg-white p-4 rounded-xl border border-gray-100 shadow-sm leading-relaxed">
                                     "{booking.notes}"
                                  </p>
                               </div>
                               <div>
                                  <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Preferred Timeframe</p>
                                  <p className="text-[10px] font-black text-secondary uppercase bg-secondary/5 px-3 py-1.5 rounded-lg inline-block">
                                     {booking.preferredTime}
                                  </p>
                               </div>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl",
                              booking.status === 'Approved' ? "bg-emerald-500 text-white" :
                              booking.status === 'Rejected' ? "bg-red-500 text-white" : "bg-primary text-secondary"
                            )}>{booking.status}</span>
                            
                            {booking.status === 'Pending' && (
                              <div className="flex gap-2">
                                 <button 
                                   onClick={() => updateMentorBooking(booking.id, { status: 'Approved' })}
                                   className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-all shadow-lg"
                                 >
                                    <Check className="w-5 h-5" />
                                 </button>
                                 <button 
                                   onClick={() => updateMentorBooking(booking.id, { status: 'Rejected' })}
                                   className="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-all shadow-lg"
                                 >
                                    <X className="w-5 h-5" />
                                 </button>
                              </div>
                            )}
                         </div>
                      </div>
                    ))}
                    {mentorBookings.length === 0 && (
                      <div className="py-40 text-center bg-gray-50/50 rounded-[40px] border-4 border-dashed border-gray-100">
                         <Users className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                         <p className="text-xl font-black uppercase tracking-[0.3em] text-gray-300">No session requests</p>
                      </div>
                    )}
                 </div>
               )}

               {activeTab === 'students-audit' && (
                 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="overflow-x-auto rounded-[32px] border border-gray-100 overflow-hidden bg-white">
                       <table className="w-full text-left border-collapse border-0">
                          <thead>
                             <tr className="bg-gray-900 border-b border-white/10 text-white">
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-white/50">Student Profile</th>
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-white/50">Core Program</th>
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-white/50">Fiscal Status</th>
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-white/50">Arrears / Debt</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                             {students.map(student => {
                                const studentPayments = payments.filter(p => p.studentId === student.studentId && p.status === 'Approved');
                                const totalPaidByStudent = studentPayments.reduce((sum, p) => sum + p.amountPaid, 0);
                                const latestBalance = studentPayments.length > 0 ? studentPayments[studentPayments.length - 1].balance : 0;
                                
                                return (
                                   <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                      <td className="px-10 py-8">
                                         <div className="flex items-center gap-4 text-left">
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black italic text-gray-400">
                                               {student.fullName?.[0] || 'S'}
                                            </div>
                                            <div>
                                               <p className="text-sm font-black text-gray-900 uppercase italic leading-none mb-1">{student.fullName}</p>
                                               <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest font-mono">{student.studentId}</p>
                                            </div>
                                         </div>
                                      </td>
                                      <td className="px-10 py-8">
                                         <p className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">
                                            {courses.find(c => c.id === student.courseId)?.name || 'Unassigned'}
                                         </p>
                                      </td>
                                      <td className="px-10 py-8">
                                         <div className="flex items-center gap-2">
                                            <div className={cn(
                                              "w-2 h-2 rounded-full",
                                              student.paymentStatus === 'Cleared' ? "bg-emerald-500" : 
                                              student.paymentStatus === 'Pending Approval' ? "bg-amber-500 animate-pulse" : "bg-red-500"
                                            )} />
                                            <span className={cn(
                                               "text-[9px] font-black uppercase tracking-widest",
                                               student.paymentStatus === 'Cleared' ? "text-emerald-600" : 
                                               student.paymentStatus === 'Pending Approval' ? "text-amber-600" : "text-red-600"
                                            )}>
                                               {student.paymentStatus || 'Debit Detected'}
                                            </span>
                                         </div>
                                      </td>
                                      <td className="px-10 py-8">
                                         <p className={cn(
                                            "text-sm font-black italic tracking-tighter",
                                            latestBalance > 0 ? "text-red-600" : "text-emerald-600"
                                         )}>
                                            K{latestBalance.toLocaleString()}
                                         </p>
                                      </td>
                                   </tr>
                                );
                             })}
                          </tbody>
                       </table>
                    </div>
                 </div>
               )}

              {activeTab === 'audit' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="overflow-hidden rounded-[32px] border border-gray-100 shadow-xl">
                    <div className="bg-gray-900 p-8 text-white flex justify-between items-center group">
                      <div className="flex items-center gap-5">
                         <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ShieldCheck className="w-6 h-6" />
                         </div>
                         <h2 className="text-2xl font-black uppercase tracking-tighter italic">Ledger Audit Surveillance</h2>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20 px-4 py-2 rounded-xl bg-primary/5">Immutable Log Layer</span>
                    </div>
                    {auditLogs.map((log, index) => (
                       <div key={log.id || `log-${index}`} className={cn(
                         "px-10 py-8 flex flex-col md:flex-row md:items-center gap-10 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors",
                         index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                       )}>
                          <div className="w-64 shrink-0 text-left">
                             <p className="text-[10px] font-black text-gray-300 uppercase mb-2 italic">{new Date(log.timestamp).toLocaleString()}</p>
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-black text-primary">
                                   {(log.userId?.[0] || 'U').toUpperCase()}
                                </div>
                                <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{log.userId}</p>
                             </div>
                          </div>
                          <div className="flex-1 text-left">
                             <p className="text-base font-black text-gray-800 uppercase tracking-tight mb-1">{log.action}</p>
                             <p className="text-xs font-bold text-gray-400 group-hover:text-gray-600 transition-colors">{log.details}</p>
                          </div>
                          <div className="text-right">
                             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">{log.userRole}</span>
                          </div>
                       </div>
                    ))}
                  </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
