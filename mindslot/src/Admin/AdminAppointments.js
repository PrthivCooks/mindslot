import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { rtdb, ref, get, remove, update, set } from "../firebaseConfig";
import { format, addDays, startOfWeek, isBefore, parseISO } from "date-fns";
import "./AdminAppointments.css";

const counsellorSlots = {
  1: ["8:30-9:00", "9:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-1:00", "1:00-2:00", "2:00-3:00", "3:00-4:00", "4:00-4:30"],
  2: ["8:00-8:50", "8:55-9:45", "9:50-10:40", "10:45-11:35", "11:40-12:30", "2:00-2:50", "2:55-3:45", "3:50-4:40"],
  3: ["8:00-8:50", "8:55-9:45", "9:50-10:40", "10:45-11:35", "11:40-12:30", "2:00-2:50", "2:55-3:45", "3:50-4:40"]
};

const AdminAppointments = () => {
  const { counsellorId } = useParams();
  const navigate = useNavigate();
  const [weekDays, setWeekDays] = useState([]);
  const [bookingData, setBookingData] = useState({});
  const [modal, setModal] = useState({ open: false, date: "", slot: "", regNumber: "" });

  useEffect(() => {
    updateWeekDays(false);
    fetchBookings();
  }, [counsellorId]);

  const updateWeekDays = (nextWeek) => {
    const today = new Date();
    let monday = startOfWeek(today, { weekStartsOn: 1 });
    if (nextWeek) monday = addDays(monday, 7);

    const daysArray = Array.from({ length: 5 }, (_, i) => ({
      date: format(addDays(monday, i), "yyyy-MM-dd"),
      day: format(addDays(monday, i), "EEEE")
    }));
    setWeekDays(daysArray);
  };

  const fetchBookings = async () => {
    try {
      const snapshot = await get(ref(rtdb, `bookings/${counsellorId}`));
      if (snapshot.exists()) {
        setBookingData(snapshot.val());
      }
    } catch (error) {
      console.error("Error fetching booking data:", error);
    }
  };

  const getSlotStatus = (date, slot) => {
    const today = format(new Date(), "yyyy-MM-dd");

    if (isBefore(parseISO(date), parseISO(today))) return "Past";

    if (bookingData?.[date]) {
      if (bookingData[date].holiday) return "Holiday";
      if (bookingData[date][slot]) {
        const bookedSlot = bookingData[date][slot];
        if (bookedSlot.status === "Blocked") return "Blocked";
        if (bookedSlot.status === "Booked") return bookedSlot.userName || "Booked";
      }
    }
    return "Free";
  };

  const handleSlotClick = (date, slot) => {
    const status = getSlotStatus(date, slot);

    if (status === "Blocked") {
      unblockSlot(date, slot);
      return;
    }

    if (status === "Free") {
      blockSlot(date, slot);
      return;
    }

    if (status !== "Free" && status !== "Blocked" && status !== "Past") {
      const bookedSlot = bookingData?.[date]?.[slot];
      if (bookedSlot?.regNumber) {
        setModal({ open: true, date, slot, regNumber: bookedSlot.regNumber });
      }
    }
  };

  const blockSlot = async (date, slot) => {
    const bookingRef = ref(rtdb, `bookings/${counsellorId}/${date}/${slot}`);
    await set(bookingRef, { status: "Blocked" });
    fetchBookings();
  };

  const unblockSlot = async (date, slot) => {
    const bookingRef = ref(rtdb, `bookings/${counsellorId}/${date}/${slot}`);
    await remove(bookingRef);
    fetchBookings();
  };

  const handleCancelAppointment = async () => {
    const { date, slot } = modal;
    const bookingRef = ref(rtdb, `bookings/${counsellorId}/${date}/${slot}`);
    await remove(bookingRef);
    setModal({ open: false, date: "", slot: "", regNumber: "" });
    fetchBookings();
  };

  const toggleHoliday = async (date) => {
    const dayRef = ref(rtdb, `bookings/${counsellorId}/${date}`);
    if (bookingData[date]?.holiday) {
      await update(dayRef, { holiday: false });
    } else {
      await update(dayRef, { holiday: true });
    }
    fetchBookings();
  };

  return (
    <div className="admin-appointments-container">
      

      <div className="week-nav">
        <button onClick={() => updateWeekDays(false)}>This Week</button>
        <button onClick={() => updateWeekDays(true)}>Next Week</button>
      </div>

      <div className="grid-table">
        <div className="grid-header">
          <div className="grid-cell time-header">Time</div>
          {weekDays.map((day) => (
            <div key={day.date} className="grid-cell day-header">
              {day.day}, {day.date}
              <button className="holiday-btn" onClick={() => toggleHoliday(day.date)}>
                {bookingData[day.date]?.holiday ? "Unmark Holiday" : "Mark Holiday"}
              </button>
            </div>
          ))}
        </div>

        {counsellorSlots[counsellorId].map((slot, index) => (
          <div key={index} className="grid-row">
            <div className="grid-cell time-slot">{slot}</div>
            {weekDays.map((day) => (
              <div
                key={`${day.date}-${slot}`}
                className={`grid-cell slot ${getSlotStatus(day.date, slot)}`}
                onClick={() => handleSlotClick(day.date, slot)}
              >
                {getSlotStatus(day.date, slot)}
              </div>
            ))}
          </div>
        ))}
      </div>

      {modal.open && (
        <div className="modal">
          <div className="modal-content">
            <h3>Appointment Details</h3>
            <p><strong>Date:</strong> {modal.date}</p>
            <p><strong>Time Slot:</strong> {modal.slot}</p>
            <p><strong>Reg Number:</strong> {modal.regNumber}</p>
            <div className="modal-buttons">
              <button onClick={handleCancelAppointment}>Cancel Appointment</button>
              <button onClick={() => navigate(`/admin-profiles/${counsellorId}/${modal.regNumber}`)}>Go to Profile</button>
              <button onClick={() => setModal({ open: false, date: "", slot: "", regNumber: "" })}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
