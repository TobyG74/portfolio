export function daylightAt(date = new Date()) {
  const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  const angle = ((hour - 6) / 24) * Math.PI * 2;
  const altitude = Math.sin(angle);
  const twilight = Math.max(0, Math.min(1, (altitude + 0.13) / 0.26));
  const daylight = twilight * twilight * (3 - 2 * twilight);
  return {
    daylight,
    night: 1 - daylight,
    sunset: (1 - Math.min(1, Math.abs(altitude) / 0.3)) * daylight,
    sun: [Math.cos(angle) * 65, altitude * 75, -35],
  };
}

export function lampPosition(building) {
  const [x, , z] = building.pos;
  const distance = Math.hypot(x, z);
  const inset = building.h * 1.4 + 2;
  return [x - (x / distance) * inset, 0, z - (z / distance) * inset];
}
