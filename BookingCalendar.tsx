import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addDays, startOfToday, isBefore, setHours, setMinutes } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { cn } from './utils';

interface BookingCalendarProps {
  onSelect: (dateTime: string) => void;
  selectedDateTime?: string;
}

export function BookingCalendar({ onSelect, selectedDateTime }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(selectedDateTime ? new Date(selectedDateTime) : null);
  const [selectedTime, setSelectedTime] = useState<string | null>(selectedDateTime ? format(new Date(selectedDateTime), 'HH:mm') : null);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleDateClick = (day: Date) => {
    if (isBefore(day, startOfToday())) return;
    setSelectedDate(day);
    if (selectedTime) {
      updateFinalDateTime(day, selectedTime);
    }
  };

  const handleTimeClick = (time: string) => {
    if (!selectedDate) return;
    setSelectedTime(time);
    updateFinalDateTime(selectedDate, time);
  };

  const updateFinalDateTime = (date: Date, time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const finalDate = setMinutes(setHours(date, hours), minutes);
    onSelect(format(finalDate, "PPpp"));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 italic">
            Calendar Node // {format(currentMonth, 'MMMM yyyy')}
          </h4>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-gray-200">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-gray-200">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-[8px] font-black text-gray-400 uppercase text-center py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((day, idx) => {
            const isDisabled = isBefore(day, startOfToday()) || !isSameMonth(day, currentMonth);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            
            return (
              <button
                key={day.toString()}
                onClick={() => !isDisabled && handleDateClick(day)}
                disabled={isDisabled}
                className={cn(
                  "aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all relative",
                  isDisabled ? "text-gray-200 cursor-not-allowed" : "hover:bg-primary/5 hover:text-primary",
                  isSelected ? "bg-primary text-white hover:bg-primary hover:text-white shadow-lg shadow-primary/20 scale-105 z-10" : "",
                  isToday(day) && !isSelected ? "text-primary border border-primary/20" : ""
                )}
              >
                {format(day, 'd')}
                {isToday(day) && !isSelected && <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
           <div className="flex items-center gap-2 mb-4">
             <Clock className="w-4 h-4 text-primary" />
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 italic">Available Intervals</h4>
           </div>
           <div className="grid grid-cols-3 gap-2">
             {timeSlots.map(time => (
               <button
                 key={time}
                 onClick={() => handleTimeClick(time)}
                 className={cn(
                   "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                   selectedTime === time 
                    ? "bg-secondary text-primary border-secondary shadow-lg shadow-secondary/10" 
                    : "bg-white text-gray-500 border-gray-100 hover:border-primary/20 hover:text-primary"
                 )}
               >
                 {time} CAT
               </button>
             ))}
           </div>
        </div>
      )}
    </div>
  );
}
