import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';
import "./home.scss"

function Home() {
  return (
    <div className="schoolExpensesWebsiteContainer">
      Let's build our First Earning Project
      <br />
      <FontAwesomeIcon icon={faCoffee} /> {/* Example icon */}
    </div>
  );
}

export default Home;