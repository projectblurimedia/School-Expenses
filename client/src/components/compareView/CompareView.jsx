import './compareView.scss'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const CompareView = ({ compareYear, compareRange, compareStartYear, compareEndYear, compareData, formatPrice }) => {
  const getFilterSummary = () => {
    if (compareRange === 'Year') {
      return `Monthly Expenses for ${compareYear}`
    } else {
      return `Yearly Expenses from ${compareStartYear} to ${compareEndYear}`
    }
  }

  return (
    <div className="compareWrapper">
      <div className="filterSummaryContainer">
        <div className="filterSummary">{getFilterSummary()}</div>
      </div>
      <div className="compareContainer">
        {compareData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={compareData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis 
                stroke="#64748b" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={formatPrice}
              />
              <Tooltip 
                formatter={(value) => formatPrice(value)}
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="total" 
                name={compareRange === 'Year' ? 'Monthly Total' : 'Yearly Total'} 
                stroke="#1d9bf0" 
                strokeWidth={2}
                dot={{ r: 4, fill: '#1d9bf0' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="chartPlaceholder">
            {compareRange === 'Year' 
              ? `No data available for ${compareYear}`
              : `No data available for ${compareStartYear || 'start year'} - ${compareEndYear || 'end year'}`}
          </div>
        )}
      </div>
    </div>
  )
}

export default CompareView