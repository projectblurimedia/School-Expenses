import { useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHourglassStart } from '@fortawesome/free-solid-svg-icons'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import './compareView.scss'

const CompareView = ({ appliedCompareYear, appliedCompareRange, appliedCompareStartYear, appliedCompareEndYear, compareData, formatPrice, isFetching }) => {
  const contentContainerRef = useRef(null)

  // useEffect(() => {
  //   const scrollToContent = () => {
  //     if (contentContainerRef.current) {
  //       contentContainerRef.current.scrollIntoView({ behavior: 'smooth' })
  //     }
  //   }
  //   setTimeout(scrollToContent, 50)
  // }, [])

  const getFilterSummary = () => {
    if (appliedCompareRange === 'Year') {
      return `Monthly Expenses for ${appliedCompareYear}`
    } else {
      return `Yearly Expenses from ${appliedCompareStartYear} to ${appliedCompareEndYear}`
    }
  }

  const getCategories = () => {
    const categories = new Set()
    compareData.forEach(dataPoint => {
      if (dataPoint.categories) {
        Object.keys(dataPoint.categories).forEach(category => categories.add(category))
      }
    })
    return Array.from(categories)
  }

  // Sort data based on range (months stay in order, years sorted ascending)
  const sortedData = appliedCompareRange === 'Year' 
    ? compareData 
    : [...compareData].sort((a, b) => parseInt(a.name) - parseInt(b.name))

  if (isFetching) {
    return (
      <div className="loadingContainer">
        <FontAwesomeIcon icon={faHourglassStart} className="spinnerIcon" spin />
        <span>Loading...</span>
      </div>
    )
  }

  return (
    <div className="compareWrapper" ref={contentContainerRef}>
      <div className="filterSummaryContainer">
        <div className="filterSummary">{getFilterSummary()}</div>
      </div>
      <div className="compareContainer">
        {sortedData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={300} style={{ marginLeft: -10 }}>
              <LineChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
                  name={appliedCompareRange === 'Year' ? 'Monthly Total' : 'Yearly Total'} 
                  stroke="#1d9bf0" 
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#1d9bf0' }}
                  activeDot={{ r: 6 }}
                  // isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="categoryBreakdown">
              <h3>Category Breakdown</h3>
              <table className="categoryTable">
                <thead>
                  <tr>
                    <th>{appliedCompareRange === 'Year' ? 'Month' : 'Year'}</th>
                    {getCategories().map(category => (
                      <th key={category}>{category}</th>
                    ))}
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map(dataPoint => (
                    <tr key={dataPoint.name}>
                      <td>{dataPoint.name}</td>
                      {getCategories().map(category => (
                        <td key={`${dataPoint.name}-${category}`}>
                          {dataPoint.categories && dataPoint.categories[category] 
                            ? formatPrice(dataPoint.categories[category]) 
                            : '-'}
                        </td>
                      ))}
                      <td>{formatPrice(dataPoint.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="chartPlaceholder">
            {appliedCompareRange === 'Year' 
              ? `No data available for ${appliedCompareYear}`
              : `No data available for ${appliedCompareStartYear || 'start year'} - ${appliedCompareEndYear || 'end year'}`}
          </div>
        )}
      </div>
    </div>
  )
}

export default CompareView