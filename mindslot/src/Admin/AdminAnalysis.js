import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { rtdb, ref, get } from "../firebaseConfig";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto"; // ✅ Fixes "category" not registered issue
import "./AdminAnalysis.css";

const visitReasonOptions = [
  "All Visit Reasons",
  "Academic",
  "Career",
  "Relationship",
  "Sexual Problems",
  "Self-harm",
  "Placements",
  "Depression",
  "Others",
];

const AdminAnalysis = () => {
  const { counsellorId } = useParams();
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [supportLevel, setSupportLevel] = useState("All Support Levels");
  const [visitReasonFilter, setVisitReasonFilter] = useState("All Visit Reasons");
  const [tableVisible, setTableVisible] = useState(false);

  useEffect(() => {
    fetchUserSessions();
  }, [counsellorId]);

  // ✅ Fetch all user sessions for this counsellor
  const fetchUserSessions = async () => {
    try {
      const snapshot = await get(ref(rtdb, "users"));
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        let allSessions = [];

        Object.keys(usersData).forEach((regNumber) => {
          const user = usersData[regNumber];

          if (user.sessions && user.sessions[counsellorId]) {
            const userSessions = user.sessions[counsellorId];

            Object.keys(userSessions).forEach((sessionKey) => {
              const sessionData = userSessions[sessionKey];

              allSessions.push({
                date: sessionData.date || "Unknown Date",
                time: sessionData.time || "Unknown Time",
                visitReason: sessionData.visitReason || "No Visit Reason",
                otherReason: sessionData.otherReason || "-",
                notes: sessionData.notes || "-",
                supportLevel: sessionData.supportLevel || 1,
                regNumber: regNumber || "Unknown Reg",
                userName: user.name ? user.name : `User ${regNumber}`,
                phone: user.phone ? user.phone : "No phone",
                email: user.email ? user.email : "No email",
              });
            });
          }
        });

        setSessions(allSessions);
        setFilteredSessions(allSessions);
      }
    } catch (error) {
      console.error("Error fetching user sessions:", error);
    }
  };

  // ✅ Apply Filters
  const applyFilters = () => {
    let filtered = sessions;

    if (fromDate && toDate) {
      filtered = filtered.filter(
        (s) => s.date >= fromDate && s.date <= toDate
      );
    }

    if (supportLevel !== "All Support Levels") {
      filtered = filtered.filter(
        (s) => s.supportLevel === parseInt(supportLevel)
      );
    }

    if (visitReasonFilter !== "All Visit Reasons") {
      filtered = filtered.filter((s) => s.visitReason === visitReasonFilter);
    }

    setFilteredSessions(filtered);
  };

  // ✅ KPI Data
  const totalSessions = filteredSessions.length;
  const avgSupportLevel =
    filteredSessions.reduce((sum, s) => sum + s.supportLevel, 0) /
      (filteredSessions.length || 1);
  const uniqueUsers = new Set(filteredSessions.map((s) => s.regNumber)).size;

  // ✅ Chart Data
  const sessionsOverTime = {
    labels: filteredSessions.map((s) => s.date),
    datasets: [
      {
        label: "Sessions Over Time",
        data: filteredSessions.map((_, i) => i + 1),
        backgroundColor: "black",
      },
    ],
  };

  const supportLevelDistribution = {
    labels: ["1", "2", "3", "4", "5"],
    datasets: [
      {
        label: "Support Levels",
        data: [1, 2, 3, 4, 5].map(
          (level) => filteredSessions.filter((s) => s.supportLevel === level).length
        ),
        backgroundColor: "black",
      },
    ],
  };

  const visitReasonsChart = {
    labels: visitReasonOptions.slice(1), // Exclude "All Visit Reasons"
    datasets: [
      {
        label: "Visit Reasons",
        data: visitReasonOptions.slice(1).map(
          (reason) => filteredSessions.filter((s) => s.visitReason === reason).length
        ),
        backgroundColor: "black",
      },
    ],
  };

  return (
    <div className="admin-analysis-container">
      <h2>ANALYSIS DASHBOARD</h2>

      {/* Filters Section */}
      <div className="filters">
        <p>Data for: {fromDate || "All Dates"} to {toDate || "All Dates"} | Support Level: {supportLevel} | Visit Reason: {visitReasonFilter}</p>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <select value={supportLevel} onChange={(e) => setSupportLevel(e.target.value)}>
          <option>All Support Levels</option>
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
          <option>5</option>
        </select>
        <select value={visitReasonFilter} onChange={(e) => setVisitReasonFilter(e.target.value)}>
          {visitReasonOptions.map((reason, i) => (
            <option key={i}>{reason}</option>
          ))}
        </select>
        <button onClick={applyFilters}>Apply Filters</button>
      </div>

      {/* KPIs */}
      <div className="kpis">
        <div className="kpi">Total Sessions: {totalSessions}</div>
        <div className="kpi">Avg. Support Level: {avgSupportLevel.toFixed(1)}</div>
        <div className="kpi">Unique Users: {uniqueUsers}</div>
      </div>

      {/* Graphs */}
      <div className="charts">
        <div className="chart"><Bar data={sessionsOverTime} /></div>
        <div className="chart"><Pie data={supportLevelDistribution} /></div>
        <div className="chart"><Bar data={visitReasonsChart} /></div>
      </div>

      {/* Session Table */}
      <button onClick={() => setTableVisible(!tableVisible)}>Toggle Table</button>
      {tableVisible && (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>User Name</th>
              <th>Reg Number</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Visit Reason</th>
              <th>Other Reason</th>
              <th>Notes</th>
              <th>Support Level</th>
            </tr>
          </thead>
          <tbody>
            {filteredSessions.map((s, i) => (
              <tr key={i}>
                <td>{s.date}</td>
                <td>{s.time}</td>
                <td>{s.userName}</td>
                <td>{s.regNumber}</td>
                <td>{s.phone}</td>
                <td>{s.email}</td>
                <td>{s.visitReason}</td>
                <td>{s.otherReason}</td>
                <td>{s.notes}</td>
                <td>{s.supportLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminAnalysis;
