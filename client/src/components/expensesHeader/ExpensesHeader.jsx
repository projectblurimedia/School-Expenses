import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faDownload, faSpinner } from '@fortawesome/free-solid-svg-icons'
import './expensesHeader.scss'

const ExpensesHeader = ({
  activeTab,
  annualTotal,
  monthlyTotal,
  isFetchingTotals,
  formatPrice,
  handleGoBackToHome,
  showExportDropdown,
  setShowExportDropdown,
  exportDropdownRef,
  handleExport,
  handleDownloadScreenshot,
  analyticsRef,
  compareRef
}) => {
  const handleDownload = () => {
    if (activeTab === 'analytics') {
      handleDownloadScreenshot(analyticsRef)
    } else if (activeTab === 'compare') {
      handleDownloadScreenshot(compareRef)
    }
  }

  return (
    <div className="topHeader">
      <div className="leftSection">
        <FontAwesomeIcon 
          icon={faArrowLeft} 
          className='backIcon' 
          onClick={handleGoBackToHome}
        />
        <div className="pageTitle">Expenses</div>
      </div>
      <div className="centerSection">
        <div className="amountDetails">
          <div className="amountItem">
            <div className="amountLabel">Annual Amount</div>
            <div className="amountValue">
              {isFetchingTotals ? (
                <FontAwesomeIcon icon={faSpinner} className="spinnerIcon" spin />
              ) : (
                `₹ ${formatPrice(annualTotal)}`
              )}
            </div>
          </div>
          <div className="divider"></div>
          <div className="amountItem">
            <div className="amountLabel">This Month</div>
            <div className="amountValue">
              {isFetchingTotals ? (
                <FontAwesomeIcon icon={faSpinner} className="spinnerIcon" spin />
              ) : (
                `₹ ${formatPrice(monthlyTotal)}`
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="rightSection">
        {activeTab === 'table' ? (
          <div className="exportDropdown" ref={exportDropdownRef}>
            <button
              className="exportBtn"
              onClick={() => setShowExportDropdown(!showExportDropdown)}
            >
              Export
              <FontAwesomeIcon icon={faDownload} className="exportIcon" style={{ marginLeft: 6 }} />
            </button>
            {showExportDropdown && (
              <div className="exportMenu">
                <div className="exportItem" onClick={() => { handleExport("csv"); setShowExportDropdown(false); }}>
                  CSV File
                </div>
                <div className="exportItem" onClick={() => { handleExport("xlsx"); setShowExportDropdown(false); }}>
                  Excel Sheet
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            className="exportBtn"
            onClick={handleDownload}
          >
            Download
            <FontAwesomeIcon icon={faDownload} className="exportIcon" style={{ marginLeft: 6 }} />
          </button>
        )}
      </div>
    </div>
  )
}

export default ExpensesHeader