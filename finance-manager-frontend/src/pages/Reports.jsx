import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { 
  FileText, Download, Calendar, ArrowUpRight, ArrowDownRight, 
  TrendingUp, TrendingDown, DollarSign
} from 'lucide-react';

const Reports = () => {
  const [period, setPeriod] = useState('MONTHLY');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = { period };
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      const res = await api.get('/reports', { params });
      setReport(res.data);
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [period, startDate, endDate]);

  const handleExportCsv = async () => {
    try {
      setExportingCsv(true);
      const params = {};
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      const res = await api.get('/export/csv', { params, responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `financial_report_${period.toLowerCase()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting CSV:', err);
    } finally {
      setExportingCsv(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setExportingPdf(true);
      const params = {};
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      const res = await api.get('/export/pdf', { params, responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `financial_report_${period.toLowerCase()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting PDF:', err);
    } finally {
      setExportingPdf(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val || 0);

  return (
    <div>
      <Navbar title="Financial Reports & Export" />

      <div className="page-container">
        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].map((p) => (
                <button
                  key={p}
                  onClick={() => { setPeriod(p); setStartDate(''); setEndDate(''); }}
                  className={`btn ${period === p && (!startDate || !endDate) ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '8px 16px', textTransform: 'capitalize' }}
                >
                  {p.toLowerCase()}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Calendar size={18} color="var(--text-muted)" />
              <input
                type="date"
                className="form-input"
                style={{ padding: '8px 12px' }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span style={{ color: 'var(--text-muted)' }}>to</span>
              <input
                type="date"
                className="form-input"
                style={{ padding: '8px 12px' }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleExportCsv} className="btn btn-secondary" disabled={exportingCsv}>
                <Download size={16} />
                <span>{exportingCsv ? 'Exporting...' : 'Export CSV'}</span>
              </button>
              <button onClick={handleExportPdf} className="btn btn-primary" disabled={exportingPdf}>
                <FileText size={16} />
                <span>{exportingPdf ? 'Exporting...' : 'Export PDF'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="stats-grid" style={{ marginBottom: '32px' }}>
          <div className="stat-card">
            <div>
              <div className="card-title">Total Income</div>
              <div className="stat-value">{formatCurrency(report?.totalIncome || 0)}</div>
            </div>
            <div className="stat-icon-wrapper income">
              <TrendingUp size={28} />
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div className="card-title">Total Expenses</div>
              <div className="stat-value">{formatCurrency(report?.totalExpense || 0)}</div>
            </div>
            <div className="stat-icon-wrapper expense">
              <TrendingDown size={28} />
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div className="card-title">Net Savings</div>
              <div className="stat-value" style={{ color: (report?.netSavings || 0) >= 0 ? 'var(--income)' : 'var(--expense)' }}>
                {formatCurrency(report?.netSavings || 0)}
              </div>
            </div>
            <div className="stat-icon-wrapper balance">
              <DollarSign size={28} />
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: '32px' }}>
          <div className="card">
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>
              Category Expense Breakdown ({report?.period})
            </h3>

            {report?.categoryBreakdown && report.categoryBreakdown.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {report.categoryBreakdown.map((item, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{item.categoryName}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {formatCurrency(item.amount)} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="progress-container" style={{ margin: 0 }}>
                      <div
                        className="progress-bar success"
                        style={{ width: `${item.percentage}%`, background: 'linear-gradient(90deg, #6366f1, #a855f7)' }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                No category expenses recorded for this period.
              </div>
            )}
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px', color: 'var(--text-primary)' }}>
              Period Financial Statement
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              Your financial statement reflects all income and expenses logged during <strong>{report?.period}</strong>.
              Generate certified CSV spreadsheets or printable PDF documents using the export triggers above.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleExportCsv} className="btn btn-secondary">
                <Download size={16} /> Download CSV
              </button>
              <button onClick={handleExportPdf} className="btn btn-primary">
                <FileText size={16} /> Download PDF Statement
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>
            Transactions for Selected Period ({report?.transactions?.length || 0})
          </h3>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Account</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {report?.transactions && report.transactions.length > 0 ? (
                  report.transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td style={{ color: 'var(--text-secondary)' }}>{tx.transactionDate}</td>
                      <td>
                        <span className={`badge ${tx.type.toLowerCase()}`}>
                          {tx.type === 'INCOME' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          {tx.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: '500' }}>{tx.categoryName}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{tx.accountName}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{tx.description || '-'}</td>
                      <td style={{ textAlign: 'right', fontWeight: '700', color: tx.type === 'INCOME' ? 'var(--income)' : 'var(--expense)' }}>
                        {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No transactions recorded in this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
