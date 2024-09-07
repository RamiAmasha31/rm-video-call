import React, { useEffect, useState } from "react";
import { useVideoClient } from "../VideoClientContext";
import "@fortawesome/fontawesome-free/css/all.min.css"; // Import FontAwesome CSS
import "./Logs.css";
import { Link } from "react-router-dom";
import home from "../../assets/HomePage/home.png";
import { useNavigate } from "react-router-dom";

const Logs: React.FC = () => {
  const { user } = useVideoClient(); // Get user from context
  const [logs, setLogs] = useState<string[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const logsPerPage = 6;
  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    const fetchLogs = async () => {
      if (!user) {
        setError("User not logged in");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3002/api/logs/${user.id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch logs");
        }
        const data = await response.json();
        setLogs(data);
        setFilteredLogs(data);
      } catch (err) {
        setError("Failed to fetch logs");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user]);
  const handleLogout = () => {
    console.log("navigate to home..");
    navigate("/home");
  };
  useEffect(() => {
    // Filter logs based on search term
    const results = logs.filter((log) =>
      log.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLogs(results);
    setCurrentPage(1); // Reset to first page when search term changes
  }, [searchTerm, logs]);

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (loading) return <div>Loading logs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="logs-container">
      <Link to="/home" className="exit-button">
        <img
          src={home}
          onClick={handleLogout}
          alt="Exit"
          className="exit-icon"
        />
      </Link>
      <h1 className="title">Transcription Logs</h1>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="search-input"
      />
      <table className="logs-table">
        <thead>
          <tr>
            <th>File</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentLogs.length > 0 ? (
            currentLogs.map((log, index) => (
              <tr key={index}>
                <td>
                  <i
                    className="fas fa-file-pdf"
                    style={{ marginLeft: "8px", color: "#d9534f" }}
                  ></i>{" "}
                  Transcription {indexOfFirstLog + index + 1}
                  {/* PDF Icon */}
                </td>
                <td>
                  <a
                    href={`http://localhost:3002/${log}`}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download
                  </a>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2}>No logs found</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="pagination">
        {Array.from(
          { length: Math.ceil(filteredLogs.length / logsPerPage) },
          (_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`page-button ${
                currentPage === index + 1 ? "active" : ""
              }`}
            >
              {index + 1}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default Logs;
