import { useState, useRef, useEffect } from 'react';
import './TimePicker.css';

const TimePicker = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedMinute, setSelectedMinute] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('PM');
  const [dropdownPosition, setDropdownPosition] = useState('bottom');
  const timePickerRef = useRef(null);

  // Initialize from value prop
  useEffect(() => {
    if (value) {
      const [hours, minutes] = value.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      
      setSelectedHour(displayHour);
      setSelectedMinute(minutes);
      setSelectedPeriod(period);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timePickerRef.current && !timePickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (hour, minute, period) => {
    if (hour === null || minute === null) return 'Select time';
    
    const displayHour = hour.toString().padStart(2, '0');
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  const handleTimeChange = (hour, minute, period) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setSelectedPeriod(period);
    
    // Only call onChange if both hour and minute are valid
    if (hour !== null && minute !== null) {
      // Convert to 24-hour format for form submission
      let militaryHour = hour;
      if (period === 'AM' && hour === 12) {
        militaryHour = 0;
      } else if (period === 'PM' && hour !== 12) {
        militaryHour = hour + 12;
      }
      
      const timeString = `${militaryHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      onChange(timeString);
    }
  };

  const toggleDropdown = () => {
    if (!isOpen && timePickerRef.current) {
      // Calculate available space
      const rect = timePickerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // If not enough space below, position above
      setDropdownPosition(spaceBelow < 350 && spaceAbove > 350 ? 'top' : 'bottom');
    }
    setIsOpen(!isOpen);
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className={`time-picker ${className}`} ref={timePickerRef}>
      <div 
        className={`time-picker-input ${isOpen ? 'open' : ''}`}
        onClick={toggleDropdown}
      >
        <span className="time-picker-value">
          {formatTime(selectedHour, selectedMinute, selectedPeriod)}
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
          className="time-picker-icon"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12,6 12,12 16,14"></polyline>
        </svg>
      </div>

      {isOpen && (
        <div className={`time-picker-dropdown ${dropdownPosition === 'top' ? 'time-picker-dropdown-top' : ''}`}>
          <div className="time-picker-header">
            <span>Select Time</span>
          </div>
          
          <div className="time-picker-wheels">
            {/* Hour Wheel */}
            <div className="time-picker-wheel">
              <div className="time-picker-wheel-label">Hour</div>
              <div className="time-picker-wheel-container">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className={`time-picker-wheel-item ${selectedHour === hour ? 'selected' : ''}`}
                    onClick={() => handleTimeChange(hour, selectedMinute, selectedPeriod)}
                  >
                    {hour}
                  </div>
                ))}
              </div>
            </div>

            {/* Minute Wheel */}
            <div className="time-picker-wheel">
              <div className="time-picker-wheel-label">Min</div>
              <div className="time-picker-wheel-container">
                {minutes.filter((_, i) => i % 5 === 0).map((minute) => (
                  <div
                    key={minute}
                    className={`time-picker-wheel-item ${selectedMinute === minute ? 'selected' : ''}`}
                    onClick={() => handleTimeChange(selectedHour, minute, selectedPeriod)}
                  >
                    {minute.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>

            {/* Period Wheel */}
            <div className="time-picker-wheel">
              <div className="time-picker-wheel-label">Period</div>
              <div className="time-picker-wheel-container">
                {['AM', 'PM'].map((period) => (
                  <div
                    key={period}
                    className={`time-picker-wheel-item ${selectedPeriod === period ? 'selected' : ''}`}
                    onClick={() => handleTimeChange(selectedHour, selectedMinute, period)}
                  >
                    {period}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="time-picker-footer">
            <button 
              type="button"
              className="time-picker-done"
              onClick={() => {
                handleTimeChange(selectedHour, selectedMinute, selectedPeriod);
                setIsOpen(false);
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker;