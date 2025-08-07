import { useState, useEffect, useRef, useMemo } from 'react';
import './BirthDatePicker.css';

const BirthDatePicker = ({ value, onChange, className = '' }) => {
  const currentYear = new Date().getFullYear();
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [year, setYear] = useState(currentYear - 25); // Default to 25 years old
  const [initialized, setInitialized] = useState(false);
  
  const monthRef = useRef(null);
  const dayRef = useRef(null);
  const yearRef = useRef(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = [];
  for (let i = currentYear - 80; i <= currentYear - 13; i++) {
    years.push(i);
  }

  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const days = [];
  const daysInCurrentMonth = getDaysInMonth(month, year);
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    days.push(i);
  }

  // Initialize from existing value
  useEffect(() => {
    if (value && !initialized) {
      const date = new Date(value);
      setMonth(date.getMonth() + 1);
      setDay(date.getDate());
      setYear(date.getFullYear());
      setInitialized(true);
    }
  }, [value, initialized]);

  // Update parent when values change
  useEffect(() => {
    // Only trigger after initialization
    if (!initialized && !value) {
      setInitialized(true);
      return;
    }
    
    // Ensure day is valid for current month/year
    const maxDays = getDaysInMonth(month, year);
    const validDay = Math.min(day, maxDays);
    
    if (validDay !== day) {
      setDay(validDay);
      return; // Don't trigger onChange if we're just adjusting the day
    }
    
    const birthDate = new Date(year, month - 1, validDay);
    if (onChange && initialized) {
      onChange(birthDate.toISOString().split('T')[0]);
    }
  }, [month, day, year, onChange, initialized, value]);

  // Initialize scroll positions when component mounts or values change
  useEffect(() => {
    if (initialized) {
      setTimeout(() => {
        scrollToOption(monthRef, month - 1);
        scrollToOption(dayRef, day - 1);
        scrollToOption(yearRef, years.indexOf(year));
      }, 100);
    }
  }, [initialized, month, day, year, years]);

  const scrollToOption = (wheelRef, selectedIndex, itemHeight = 40) => {
    if (wheelRef.current) {
      const container = wheelRef.current.querySelector('.wheel-options');
      if (container) {
        const scrollTop = selectedIndex * itemHeight - (container.clientHeight / 2) + (itemHeight / 2);
        container.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
      }
    }
  };

  const handleSelect = (type, value) => {
    switch (type) {
      case 'month':
        setMonth(value);
        setTimeout(() => scrollToOption(monthRef, value - 1), 100);
        break;
      case 'day':
        setDay(value);
        setTimeout(() => scrollToOption(dayRef, value - 1), 100);
        break;
      case 'year':
        setYear(value);
        const yearIndex = years.indexOf(value);
        setTimeout(() => scrollToOption(yearRef, yearIndex), 100);
        break;
    }
  };

  // Snap to nearest option on scroll end
  const handleScrollEnd = (type, wheelRef) => {
    const container = wheelRef.current?.querySelector('.wheel-options');
    if (!container) return;

    const itemHeight = 40;
    const scrollTop = container.scrollTop;
    const containerCenter = container.clientHeight / 2;
    const adjustedScrollTop = scrollTop + containerCenter - (itemHeight / 2);
    const selectedIndex = Math.round(adjustedScrollTop / itemHeight);

    let options, currentValue;
    switch (type) {
      case 'month':
        options = months;
        currentValue = month;
        if (selectedIndex >= 0 && selectedIndex < options.length && selectedIndex + 1 !== currentValue) {
          setMonth(selectedIndex + 1);
        }
        scrollToOption(monthRef, month - 1);
        break;
      case 'day':
        options = days;
        currentValue = day;
        if (selectedIndex >= 0 && selectedIndex < options.length && selectedIndex + 1 !== currentValue) {
          setDay(selectedIndex + 1);
        }
        scrollToOption(dayRef, day - 1);
        break;
      case 'year':
        options = years;
        currentValue = year;
        if (selectedIndex >= 0 && selectedIndex < options.length && options[selectedIndex] !== currentValue) {
          setYear(options[selectedIndex]);
        }
        scrollToOption(yearRef, years.indexOf(year));
        break;
    }
  };

  const calculatedAge = useMemo(() => {
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }, [year, month, day]);

  return (
    <div className={`birth-date-picker ${className}`}>
      <div className="birth-date-picker-label">
        Birth Date (Age: {calculatedAge})
      </div>
      
      <div className="birth-date-picker-wheels">
        {/* Month Wheel */}
        <div className="wheel-container">
          <div className="wheel-label">Month</div>
          <div className="wheel" ref={monthRef}>
            <div className="wheel-selection-indicator"></div>
            <div 
              className="wheel-options"
              onScrollEnd={() => handleScrollEnd('month', monthRef)}
              onScroll={(e) => {
                clearTimeout(e.target.scrollTimer);
                e.target.scrollTimer = setTimeout(() => handleScrollEnd('month', monthRef), 150);
              }}
            >
              {months.map((monthName, index) => (
                <div
                  key={index + 1}
                  className={`wheel-option ${month === index + 1 ? 'selected' : ''}`}
                  onClick={() => handleSelect('month', index + 1)}
                >
                  {monthName}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Day Wheel */}
        <div className="wheel-container">
          <div className="wheel-label">Day</div>
          <div className="wheel" ref={dayRef}>
            <div className="wheel-selection-indicator"></div>
            <div 
              className="wheel-options"
              onScrollEnd={() => handleScrollEnd('day', dayRef)}
              onScroll={(e) => {
                clearTimeout(e.target.scrollTimer);
                e.target.scrollTimer = setTimeout(() => handleScrollEnd('day', dayRef), 150);
              }}
            >
              {days.map((dayNum) => (
                <div
                  key={dayNum}
                  className={`wheel-option ${day === dayNum ? 'selected' : ''}`}
                  onClick={() => handleSelect('day', dayNum)}
                >
                  {dayNum}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Year Wheel */}
        <div className="wheel-container">
          <div className="wheel-label">Year</div>
          <div className="wheel" ref={yearRef}>
            <div className="wheel-selection-indicator"></div>
            <div 
              className="wheel-options"
              onScrollEnd={() => handleScrollEnd('year', yearRef)}
              onScroll={(e) => {
                clearTimeout(e.target.scrollTimer);
                e.target.scrollTimer = setTimeout(() => handleScrollEnd('year', yearRef), 150);
              }}
            >
              {years.map((yearNum) => (
                <div
                  key={yearNum}
                  className={`wheel-option ${year === yearNum ? 'selected' : ''}`}
                  onClick={() => handleSelect('year', yearNum)}
                >
                  {yearNum}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BirthDatePicker;