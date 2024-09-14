import React, { useEffect, useState } from "react";
import { useVideoClient } from "../VideoClientContext";
import "@fortawesome/fontawesome-free/css/all.min.css"; // Import FontAwesome CSS
import logo from "../../assets/HomePage/logo.png";
import "./Logs.css";
import home from "../../assets/HomePage/home.png";
import { useNavigate } from "react-router-dom";
import debounce from "lodash.debounce"; // Import debounce function from lodash

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
  const server_ip = "rmvideocall.vercel.app";

  useEffect(() => {
    const fetchLogs = async () => {
      if (!user) {
        setError("User not logged in");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://${server_ip}/api/fetchlogs?userId=${user.id}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `Failed to fetch logs: ${response.status} - ${response.statusText}\n${errorText}`
          );
          throw new Error(
            `Failed to fetch logs: ${response.status} - ${response.statusText}\n${errorText}`
          );
        }
        const data = await response.json();
        setLogs(data);
        setFilteredLogs(data);
      } catch (err: any) {
        console.error("Error fetching logs:", err.message);
        setError(`Failed to fetch logs: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user]);

  const handleLogout = () => {
    console.log("Navigating to home...");
    navigate("/home");
  };

  // Debounced version of the filtering function
  const filterLogs = debounce((searchTerm: string) => {
    const results = logs.filter((log) =>
      log.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLogs(results);
    setCurrentPage(1); // Reset to first page when search term changes
  }, 300); // Adjust debounce delay as needed

  useEffect(() => {
    filterLogs(searchTerm);
  }, [searchTerm]);

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
      <nav className="navbar">
        <div className="brand-logo">
          <img src={logo} alt="Logo" />
        </div>
        <img
          src={home}
          onClick={handleLogout}
          alt="Exit"
          className="exit-icon"
        />
      </nav>
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
                    href={`${log}`}
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
