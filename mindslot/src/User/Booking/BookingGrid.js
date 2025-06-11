import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { rtdb, ref, get, set, update, remove, auth } from "../../firebaseConfig";
import { format, addDays, startOfWeek, isBefore, parseISO, isToday, isAfter } from "date-fns";
import "./BookingGrid.css";

const counsellorSlots = {
  1: ["8:30-9:00", "9:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-1:00", "1:00-2:00", "2:00-3:00", "3:00-4:00", "4:00-4:30"],
  2: ["8:00-8:50", "8:55-9:45", "9:50-10:40", "10:45-11:35", "11:40-12:30", "2:00-2:50", "2:55-3:45", "3:50-4:40"],
  3: ["8:00-8:50", "8:55-9:45", "9:50-10:40", "10:45-11:35", "11:40-12:30", "2:00-2:50", "2:55-3:45", "3:50-4:40"]
};

const BookingGrid = () => {
  const { counsellorId } = useParams();
  const [weekDays, setWeekDays] = useState([]);
  const [bookingData, setBookingData] = useState({});
  const [holidays, setHolidays] = useState({});
  const [modal, setModal] = useState({ open: false, date: "", slot: "", action: "book" });
  const [reason, setReason] = useState("");
  const [weeklyBookings, setWeeklyBookings] = useState(0);
  const [userData, setUserData] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    updateWeekDays(false);
    fetchBookings();
    fetchUserAppointments();
    fetchUserData();
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
        const data = snapshot.val();
        setBookingData(data);

        // Extract holiday information
        let holidayDays = {};
        Object.keys(data).forEach((date) => {
          if (data[date].holiday) {
            holidayDays[date] = true;
          }
        });
        setHolidays(holidayDays);
      }
    } catch (error) {
      console.error("Error fetching booking data:", error);
    }
  };

  const fetchUserAppointments = async () => {
    try {
      if (user) {
        const snapshot = await get(ref(rtdb, `userBookings/${user.uid}`));
        if (snapshot.exists()) {
          const data = snapshot.val();

          const today = new Date();
          const weekStart = startOfWeek(today, { weekStartsOn: 1 });
          const weekEnd = addDays(weekStart, 4);

          const upcomingAppointments = Object.values(data).filter(app =>
            (isAfter(parseISO(app.date), today) || isToday(parseISO(app.date))) &&
            isBefore(parseISO(app.date), parseISO(format(weekEnd, "yyyy-MM-dd")))
          );

          setWeeklyBookings(upcomingAppointments.length);
        } else {
          setWeeklyBookings(0);
        }
      }
    } catch (error) {
      console.error("Error fetching user appointments:", error);
      setWeeklyBookings(0);
    }
  };

  const fetchUserData = async () => {
    if (user) {
      const snapshot = await get(ref(rtdb, `users/${user.uid}`));
      if (snapshot.exists()) {
        setUserData(snapshot.val());
      }
    }
  };

  const getSlotStatus = (date, slot) => {
    const today = format(new Date(), "yyyy-MM-dd");
    if (isBefore(parseISO(date), parseISO(today))) return "Past";
    if (holidays[date]) return "Holiday";

    if (bookingData?.[date]?.[slot]) {
      const bookedSlot = bookingData[date][slot];

      if (bookedSlot.status === "Blocked") return "Blocked";
      if (bookedSlot.status === "Booked") {
        return bookedSlot.userId === user?.uid ? "Your Slot" : "Booked";
      }
    }

    return "Free";
  };

  const handleSlotClick = (date, slot) => {
    const status = getSlotStatus(date, slot);

    if (weeklyBookings >= 2) {
      alert("You can only book a maximum of 2 slots per week.");
      return;
    }

    if (status === "Free") {
      setModal({ open: true, date, slot, action: "book" });
    } else if (status === "Your Slot") {
      setModal({ open: true, date, slot, action: "cancel" });
    }
  };

  const confirmBooking = async () => {
    const { date, slot, action } = modal;
    const userId = user.uid;
    const userName = userData?.name || user.displayName || "Unknown";
    const regNumber = userData?.regNumber || user.email.split("@")[0];

    const bookingRef = ref(rtdb, `bookings/${counsellorId}/${date}/${slot}`);
    const userBookingRef = ref(rtdb, `userBookings/${userId}/${date}/${slot}`);

    if (action === "book") {
      await set(bookingRef, { userId, userName, regNumber, reason, status: "Booked", timestamp: new Date().toISOString() });
      await set(userBookingRef, { counsellorId, date, slot, reason });
    } else if (action === "cancel") {
      await remove(bookingRef);
      await remove(userBookingRef);
    }

    setModal({ open: false, date: "", slot: "", action: "" });
    fetchBookings();
    fetchUserAppointments();
  };

  return (
    <div className="booking-grid-container">
      <h2>Booking Schedule</h2>

      <div className="week-nav">
        <button onClick={() => updateWeekDays(false)}>This Week</button>
        <button onClick={() => updateWeekDays(true)}>Next Week</button>
      </div>

      <div className="grid-table">
        <div className="grid-header">
          <div className="grid-cell time-header">Time</div>
          {weekDays.map((day) => (
            <div key={day.date} className="grid-cell day-header">{day.day}, {day.date}</div>
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
            <h3>{modal.action === "book" ? "Book Slot" : "Cancel Booking"}: {modal.slot} on {modal.date}</h3>
            {modal.action === "book" && <textarea placeholder="Enter reason..." value={reason} onChange={(e) => setReason(e.target.value)} />}
            <button onClick={confirmBooking}>{modal.action === "book" ? "Confirm Booking" : "Confirm Cancellation"}</button>
            <button onClick={() => setModal({ open: false })}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingGrid;
