const calculatePriority = (notification) => {
  let score = 0;

  if (notification.Type === "Placement") {
    score += 30;
  } else if (notification.Type === "Result") {
    score += 20;
  } else if (notification.Type === "Event") {
    score += 10;
  }

  const timestamp = new Date(notification.Timestamp).getTime();

  const now = Date.now();

  const diffMinutes = (now - timestamp) / (1000 * 60);

  score += Math.max(0, 50 - diffMinutes);

  return score;
};

const getTopNotifications = (notifications, limit = 10) => {
  return notifications
    .map((notification) => ({
      ...notification,
      priorityScore: calculatePriority(notification),
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, limit);
};

module.exports = getTopNotifications;
