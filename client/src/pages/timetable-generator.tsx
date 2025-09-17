import React from 'react';
import { TimetableGenerator } from '@/components/timetable/TimetableGenerator';

const TimetableGeneratorPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <TimetableGenerator />
    </div>
  );
};

export default TimetableGeneratorPage;
