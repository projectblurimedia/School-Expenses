import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHourglassStart } from '@fortawesome/free-solid-svg-icons'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import './analyticsView.scss'

const AnalyticsView = ({
  records,
  filterSummary,
  pieData,
  total,
  formatPrice,
  COLORS,
  renderCustomizedLabel,
  isFetching
}) => {
  if (isFetching) {
    return (
      <div className="loadingContainer">
        <FontAwesomeIcon icon={faHourglassStart} className="spinnerIcon" spin />
        <span>Loading...</span>
      </div>
    )
  }

  return (
    <div className="analyticsWrapper">
      <div className={`filterSummaryContainer ${records.length > 0 ? 'has-total' : ''}`}>
        <div className="filterSummary">{filterSummary}</div>
        {records.length > 0 && (
          <div className="totalAmount">Total: {formatPrice(total)} INR</div>
        )}
      </div>
      <div className="analyticsContainer">
        <div className="chartContainer">
          <h3>Expense Trends</h3>
          {records.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={1}
                  label={renderCustomizedLabel}
                  labelLine={true}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `${formatPrice(value)} INR`} 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '2px solid #dde9f5ff', 
                    borderRadius: '8px',
                    fontFamily: "'Poppins', 'Inter', 'Segoe UI', sans-serif",
                  }}
                  labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                  itemStyle={{ color: '#1d9bf0', fontWeight: 500 }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chartPlaceholder">No data available</div>
          )}
        </div>
        <div className="categoryBreakdown">
          <h3>Category Breakdown</h3>
          <div className="breakdownList">
            {records.length > 0 ? (
              pieData.map((entry, index) => (
                <div className="breakdownItem" key={index}>
                  <div className="categoryColor" style={{background: COLORS[index % COLORS.length]}}></div>
                  <div className="categoryName">{entry.name}</div>
                  <div className="categoryAmount">{formatPrice(entry.value)} INR</div>
                  <div className="categoryPercentage">{((entry.value / total) * 100).toFixed(0)}%</div>
                </div>
              ))
            ) : (
              <div className="noRecords">No records found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsView