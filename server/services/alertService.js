export const evaluateAlerts = (reading) => {
  const alerts = [];
  const { deviceId, waterLevel, sensorStatus, batteryPercentage } = reading;

  if (waterLevel === 0) {
    alerts.push({
      device_id: deviceId,
      alert_type: 'EMPTY_TANK',
      severity: 'CRITICAL',
      value: 0,
      message: 'Water tank is empty'
    });
  } else if (waterLevel > 0 && waterLevel <= 40) {
    alerts.push({
      device_id: deviceId,
      alert_type: 'LOW_WATER',
      severity: 'WARNING',
      value: waterLevel,
      message: `Water level is low: ${waterLevel}%`
    });
  }

  if (sensorStatus !== 'OK') {
    alerts.push({
      device_id: deviceId,
      alert_type: 'SENSOR_ERROR',
      severity: 'HIGH',
      value: null,
      message: `Sensor reporting error status: ${sensorStatus}`
    });
  }

  if (batteryPercentage !== null && batteryPercentage !== undefined && batteryPercentage <= 20) {
    alerts.push({
      device_id: deviceId,
      alert_type: 'LOW_BATTERY',
      severity: 'WARNING',
      value: batteryPercentage,
      message: `Battery level is low: ${batteryPercentage}%`
    });
  }

  return alerts;
};
