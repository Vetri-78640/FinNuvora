import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import { transactionAPI, categoryAPI, goalAPI, insightsAPI } from '../lib/api';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const { token, user, logout } = useAuthStore();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [goals, setGoals] = useState([]);
  const [insights, setInsights] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [token, router]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [transRes, catRes, goalRes, statsRes] = await Promise.all([
        transactionAPI.getTransactions({ limit: 10 }),
        categoryAPI.getCategories(),
        goalAPI.getGoals(),
        transactionAPI.getStats()
      ]);

      setTransactions(transRes.data.transactions);
      setCategories(catRes.data.categories);
      setGoals(goalRes.data.goals);
      setStats(statsRes.data.stats);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    try {
      const response = await insightsAPI.generateInsights();
      setInsights(response.data.insights);
    } catch (err) {
      console.error('Error generating insights:', err);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!token) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-brand">FinNuvora</div>
        <div className="navbar-links">
          <span className="user-name">{user?.name}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-container">
        <aside className="sidebar">
          <div className="menu">
            <button
              className={`menu-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`menu-item ${activeTab === 'transactions' ? 'active' : ''}`}
              onClick={() => setActiveTab('transactions')}
            >
              Transactions
            </button>
            <button
              className={`menu-item ${activeTab === 'goals' ? 'active' : ''}`}
              onClick={() => setActiveTab('goals')}
            >
              Financial Goals
            </button>
            <button
              className={`menu-item ${activeTab === 'insights' ? 'active' : ''}`}
              onClick={() => setActiveTab('insights')}
            >
              AI Insights
            </button>
          </div>
        </aside>

        <main className="dashboard-content">
          {loading ? (
            <div className="loading">Loading dashboard...</div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="tab-content">
                  <h2>Financial Overview</h2>

                  {stats && (
                    <div className="stats-grid">
                      <div className="stat-card">
                        <h3>Total Income</h3>
                        <p className="amount income">
                          ${stats.totalIncome?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="stat-card">
                        <h3>Total Expenses</h3>
                        <p className="amount expense">
                          ${stats.totalExpense?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="stat-card">
                        <h3>Investments</h3>
                        <p className="amount investment">
                          ${stats.totalInvestment?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="stat-card">
                        <h3>Net Amount</h3>
                        <p className={`amount ${stats.netAmount >= 0 ? 'positive' : 'negative'}`}>
                          ${stats.netAmount?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="section">
                    <h3>Recent Transactions</h3>
                    {transactions.length > 0 ? (
                      <table className="transactions-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Category</th>
                            <th>Type</th>
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.slice(0, 5).map((t) => (
                            <tr key={t.id}>
                              <td>{new Date(t.date).toLocaleDateString()}</td>
                              <td>{t.category.name}</td>
                              <td>{t.type}</td>
                              <td className={`amount ${t.type}`}>
                                ${t.amount.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p>No transactions yet</p>
                    )}
                  </div>

                  <div className="section">
                    <h3>Active Goals</h3>
                    {goals.length > 0 ? (
                      <div className="goals-list">
                        {goals.slice(0, 3).map((goal) => (
                          <div key={goal.id} className="goal-card">
                            <h4>{goal.title}</h4>
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{ width: `${goal.progress}%` }}
                              />
                            </div>
                            <p>
                              ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No goals set</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'transactions' && (
                <div className="tab-content">
                  <h2>Transactions</h2>
                  <p>Transaction management will be implemented here</p>
                </div>
              )}

              {activeTab === 'goals' && (
                <div className="tab-content">
                  <h2>Financial Goals</h2>
                  <p>Goal management will be implemented here</p>
                </div>
              )}

              {activeTab === 'insights' && (
                <div className="tab-content">
                  <h2>AI Financial Insights</h2>
                  <button onClick={generateInsights} className="btn-primary">
                    Generate Insights
                  </button>
                  {insights && (
                    <div className="insights-box">
                      <p>{insights}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
