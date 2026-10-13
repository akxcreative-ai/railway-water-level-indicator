import React from 'react';

const StatusBadge = ({ status, variant = 'neutral' }) => {
  return (
    <span className={`badge badge-${variant}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
