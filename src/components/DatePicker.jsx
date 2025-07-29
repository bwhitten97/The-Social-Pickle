import { useState, useRef, useEffect } from 'react';
import './DatePicker.css';

const DatePicker = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dropdownPosition, setDropdownPosition] = useState('bottom');
  const datePickerRef = useRef(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date) => {
    // Use local date formatting to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'Select a date';
    // Parse the date string as local date to avoid timezone issues
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handleDateClick = (date) => {
    // Prevent selecting past dates
    if (isPastDate(date)) {
      return;
    }
    const formattedDate = formatDate(date);
    onChange(formattedDate);
    setIsOpen(false);
  };

  const toggleCalendar = () => {
    if (!isOpen && datePickerRef.current) {
      // Calculate available space
      const rect = datePickerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const spaceRight = viewportWidth - rect.left;
      
      // If not enough space below, position above
      setDropdownPosition(spaceBelow < 350 && spaceAbove > 350 ? 'top' : 'bottom');
    }
    setIsOpen(!isOpen);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    handleDateClick(today);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!value) return false;
    // Parse the selected date as local date to avoid timezone issues
    const [year, month, day] = value.split('-');
    const selectedDate = new Date(year, month - 1, day);
    return date.toDateString() === selectedDate.toDateString();
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className={`date-picker ${className}`} ref={datePickerRef}>
      <div 
        className={`date-picker-input ${isOpen ? 'open' : ''}`}
        onClick={toggleCalendar}
      >
        <span className="date-picker-value">
          {formatDisplayDate(value)}
        </span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="date-picker-icon"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </div>

      {isOpen && (
        <div className={`date-picker-calendar ${dropdownPosition === 'top' ? 'date-picker-calendar-top' : ''}`}>
          <div className="date-picker-header">
            <button 
              type="button"
              className="date-picker-nav"
              onClick={goToPreviousMonth}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
            
            <h3 className="date-picker-month">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            
            <button 
              type="button"
              className="date-picker-nav"
              onClick={goToNextMonth}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          </div>

          <div className="date-picker-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="date-picker-weekday">{day}</div>
            ))}
          </div>

          <div className="date-picker-days">
            {days.map((date, index) => (
              <button
                key={index}
                type="button"
                className={`date-picker-day ${
                  !date ? 'empty' : ''
                } ${
                  date && isToday(date) ? 'today' : ''
                } ${
                  date && isSelected(date) ? 'selected' : ''
                } ${
                  date && isPastDate(date) ? 'past' : ''
                }`}
                onClick={() => date && !isPastDate(date) && handleDateClick(date)}
                disabled={!date || isPastDate(date)}
              >
                {date ? date.getDate() : ''}
              </button>
            ))}
          </div>

          <div className="date-picker-footer">
            <button 
              type="button"
              className="date-picker-today"
              onClick={goToToday}
            >
              Today
            </button>
            {value && (
              <button 
                type="button"
                className="date-picker-clear"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;