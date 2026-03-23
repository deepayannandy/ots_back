function validateDayNight(date) {
  const now = new Date(date);
  const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

  const startMinutes = 8 * 60 + 0; // 08:00
  const endMinutes = 18 * 60 + 0; // 18:00

  return (
    currentTimeInMinutes >= startMinutes && currentTimeInMinutes < endMinutes
  );
}

module.exports = new validateDayNight();
