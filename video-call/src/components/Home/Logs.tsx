import React, { useEffect, useState } from "react";
import { useVideoClient } from "../VideoClientContext";
import "@fortawesome/fontawesome-free/css/all.min.css";
import logo from "../../assets/HomePage/logo.png";
import "./Logs.css";
import home from "../../assets/HomePage/home.png";
import { useNavigate } from "react-router-dom";

// Fetch environment variables
const isProduction = import.meta.env.MODE === "production";
const server_ip = isProduction ? "rmvideocall.vercel.app" : "localhost:3002";
const server_protocol = isProduction ? "https" : "http";

// Define types
interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
}

interface Log {
  createdAt: FirebaseTimestamp | string; // Timestamp or string
  url: string;
  fileName: string; // Add file name property
}
// Utility function to extract file name from URL
const extractFileName = (url: string): string => {
  const urlParts = url.split("/");
  const fileWithToken = urlParts[urlParts.length - 1];
  const fileName = fileWithToken.split("?")[0]; // Remove query parameters
  const cleanFileName = fileName.replace("%2F", "").replace(".pdf", ""); // Remove %2F and .pdf
  const finalFileName = cleanFileName.replace("transcriptions", ""); // Remove "transcriptions"
  return finalFileName; // Return the cleaned file name
};
const Logs: React.FC = () => {
  const { user } = useVideoClient(); // Get user from context
  const [logs, setLogs] = useState<Log[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc"); // State for sort order
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
          `${server_protocol}://${server_ip}/api/fetchlogs?userId=${user.id}`,
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
        const logsWithFileNames = data.map((log: Log) => ({
          ...log,
          fileName: extractFileName(log.url), // Extract file name from URL
        }));
        setLogs(logsWithFileNames);
        setFilteredLogs(logsWithFileNames); // Set initial filtered logs to all logs
      } catch (err: any) {
        console.error("Error fetching logs:", err.message);
        setError(`Failed to fetch logs: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user]);

  useEffect(() => {
    const results = logs.filter(
      (log) =>
        log.fileName.toLowerCase().includes(searchTerm.toLowerCase()) || // Filter by file name
        log.url.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLogs(results);
    setCurrentPage(1); // Reset to first page when search term changes
  }, [searchTerm, logs]);

  useEffect(() => {
    const sortedLogs = [...filteredLogs].sort((a, b) => {
      const dateA =
        typeof a.createdAt === "object"
          ? a.createdAt.seconds
          : new Date(a.createdAt).getTime();
      const dateB =
        typeof b.createdAt === "object"
          ? b.createdAt.seconds
          : new Date(b.createdAt).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA; // Sort based on selected order
    });
    setFilteredLogs(sortedLogs);
  }, [sortOrder, logs]); // Sort whenever sortOrder changes

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const formatDate = (createdAt: FirebaseTimestamp | string) => {
    if (typeof createdAt === "object" && "seconds" in createdAt) {
      return new Date(createdAt.seconds * 1000).toLocaleString();
    }
    return new Date(createdAt).toLocaleString();
  };

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  if (loading) return <div>Loading logs... 🕵️‍♂️</div>;
  if (error) return <div>Error: {error} 😓</div>;

  return (
    <div className="logs-container">
      <nav className="navbar">
        <div className="brand-logo">
          <img src={logo} alt="Logo" />
        </div>
        <img
          src={home}
          onClick={() => navigate("/home")}
          alt="Exit"
          className="exit-icon"
        />
      </nav>
      <h1 className="title">Transcription Logs</h1>
      <input
        type="text"
        placeholder="Search by file name or URL..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="search-input"
      />
      <table className="logs-table">
        <thead>
          <tr>
            <th>File</th>
            <th>
              Date{" "}
              <i
                className={`fas fa-sort-${sortOrder === "asc" ? "up" : "down"}`}
                onClick={toggleSortOrder}
                style={{ cursor: "pointer", marginLeft: "5px" }}
              ></i>
            </th>
            <th>Actions</th>
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
                  ></i>
                  {log.fileName} {/* Display file name */}
                </td>
                <td>{formatDate(log.createdAt)}</td>
                <td>
                  <a
                    href={log.url}
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
              <td colSpan={3}>No logs found 🤷‍♂️</td>
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
