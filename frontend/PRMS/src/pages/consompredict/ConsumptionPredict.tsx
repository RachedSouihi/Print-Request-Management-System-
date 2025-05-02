import React, { useState } from 'react';
import { FiSearch, FiCalendar, FiPrinter, FiFileText, FiDownload, FiBarChart2, FiDollarSign, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import './ConsumptionPredict.css';

const ConsumptionPredict: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  const [timeRange, setTimeRange] = useState<'7days' | '30days'>('7days');
  const [currency, setCurrency] = useState<'TND'>('TND');

  // Sample prediction data with costs in TND
  const predictionData = {
    daily: [
      { date: '2023-06-01', inkVolume: 120, paperSheets: 85, inkCost: 24.5, paperCost: 12.75, trend: 'up' },
      { date: '2023-06-02', inkVolume: 115, paperSheets: 80, inkCost: 23.5, paperCost: 12.00, trend: 'down' },
      { date: '2023-06-03', inkVolume: 125, paperSheets: 90, inkCost: 25.5, paperCost: 13.50, trend: 'up' },
      { date: '2023-06-04', inkVolume: 130, paperSheets: 95, inkCost: 26.5, paperCost: 14.25, trend: 'up' },
      { date: '2023-06-05', inkVolume: 110, paperSheets: 75, inkCost: 22.5, paperCost: 11.25, trend: 'down' },
      { date: '2023-06-06', inkVolume: 105, paperSheets: 70, inkCost: 21.5, paperCost: 10.50, trend: 'down' },
      { date: '2023-06-07', inkVolume: 140, paperSheets: 100, inkCost: 28.5, paperCost: 15.00, trend: 'up' },
    ],
    weekly: [
      { week: 'Week 22', inkVolume: 850, paperSheets: 600, inkCost: 173.5, paperCost: 90.00, trend: 'up' },
      { week: 'Week 23', inkVolume: 790, paperSheets: 550, inkCost: 161.5, paperCost: 82.50, trend: 'down' },
      { week: 'Week 24', inkVolume: 920, paperSheets: 650, inkCost: 187.5, paperCost: 97.50, trend: 'up' },
      { week: 'Week 25', inkVolume: 880, paperSheets: 620, inkCost: 179.5, paperCost: 93.00, trend: 'down' },
    ]
  };

  // Calculate totals for summary cards
  const calculateTotals = () => {
    const data = activeTab === 'daily' 
      ? predictionData.daily.slice(0, timeRange === '7days' ? 7 : 30) 
      : predictionData.weekly;
    
    return data.reduce((acc, item) => ({
      inkVolume: acc.inkVolume + item.inkVolume,
      paperSheets: acc.paperSheets + item.paperSheets,
      inkCost: acc.inkCost + item.inkCost,
      paperCost: acc.paperCost + item.paperCost,
    }), { inkVolume: 0, paperSheets: 0, inkCost: 0, paperCost: 0 });
  };

  const totals = calculateTotals();

  return (
    <div className="consumption-predict-container">
      <div className="predict-header">
        <h1 className="predict-title">Printing Resources Consumption Forecast</h1>
        <p>AI-powered predictions for ink and paper usage with cost estimation</p>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon ink">
            <FiPrinter />
          </div>
          <div className="card-content">
            <h3>Total Ink</h3>
            <p>{totals.inkVolume} ml</p>
            <span className="cost">{totals.inkCost.toFixed(2)} {currency}</span>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon paper">
            <FiFileText />
          </div>
          <div className="card-content">
            <h3>Total Paper</h3>
            <p>{totals.paperSheets} sheets</p>
            <span className="cost">{totals.paperCost.toFixed(2)} {currency}</span>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon total">
            <FiDollarSign />
          </div>
          <div className="card-content">
            <h3>Total Cost</h3>
            <p>{(totals.inkCost + totals.paperCost).toFixed(2)} {currency}</p>
            <span className="trend up">+5.2% vs last period</span>
          </div>
        </div>
      </div>

      <div className="predict-tabs">
        <div className="tab-nav">
          <button
            className={`tab-button ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            <FiCalendar className="tab-icon" />
            Daily View
          </button>
          <button
            className={`tab-button ${activeTab === 'weekly' ? 'active' : ''}`}
            onClick={() => setActiveTab('weekly')}
          >
            <FiFileText className="tab-icon" />
            Weekly View
          </button>
        </div>
      </div>

      <div className="predict-controls">
        <div className="time-range-selector">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7days' | '30days')}
          >
            <option value="7days">Next 7 days</option>
            <option value="30days">Next 30 days</option>
          </select>
        </div>
        <div className="currency-selector">
          <span>Currency:</span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as 'TND')}
          >
            <option value="TND">TND (Tunisian Dinar)</option>
          </select>
        </div>
      </div>

      <div className="predictions-container">
        <div className="predictions-header">
          <h2 className="section-title">
            {activeTab === 'daily' ? 'Daily Predictions' : 'Weekly Predictions'}
          </h2>
          <div className="search-container">
            <input type="text" placeholder="Search predictions..." />
            <FiSearch className="search-icon" />
          </div>
        </div>

        <div className="table-container">
          <table className="predictions-table">
            <thead>
              <tr>
                <th>{activeTab === 'daily' ? 'Date' : 'Week'}</th>
                <th>Ink Volume (ml)</th>
                <th>Ink Cost ({currency})</th>
                <th>Paper (sheets)</th>
                <th>Paper Cost ({currency})</th>
                <th>Total Cost ({currency})</th>
                <th>Trend</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {predictionData[activeTab].map((item, index) => (
                <tr key={index}>
                  <td>
                    <div className="date-cell">
                      <FiBarChart2 className="icon" />
                      <div>
                        <div className="primary">{activeTab === 'daily' ? item.date : item.week}</div>
                        <div className="secondary">{activeTab === 'daily' ? 'Daily forecast' : 'Weekly forecast'}</div>
                      </div>
                    </div>
                  </td>
                  <td className={item.trend === 'up' ? 'up' : 'down'}>
                    {item.inkVolume}
                    {item.trend === 'up' ? <FiTrendingUp className="trend-icon" /> : <FiTrendingDown className="trend-icon" />}
                  </td>
                  <td>{item.inkCost.toFixed(2)}</td>
                  <td className={item.trend === 'up' ? 'up' : 'down'}>
                    {item.paperSheets}
                    {item.trend === 'up' ? <FiTrendingUp className="trend-icon" /> : <FiTrendingDown className="trend-icon" />}
                  </td>
                  <td>{item.paperCost.toFixed(2)}</td>
                  <td className="total-cost">{(item.inkCost + item.paperCost).toFixed(2)}</td>
                  <td>
                    <span className={`trend-badge ${item.trend}`}>
                      {item.trend === 'up' ? '↑ Increase' : '↓ Decrease'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-details">
                        <FiPrinter /> Details
                      </button>
                      <button className="btn-export">
                        <FiDownload /> Export
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
  );
};

export default ConsumptionPredict;