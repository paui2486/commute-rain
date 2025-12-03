// Mock Data Generator (Moved from App.jsx)

export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const LOCATIONS = {
  morning: { name: "信義區", time: "08:00 - 09:00" },
  evening: { name: "內湖陽光抽水站", time: "17:30 - 18:00" }
};

const generateCurrentStatus = () => {
  const isRainingNow = Math.random() > 0.5;
  return {
    timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
    location: "信義區 (台北站)",
    temp: 24.5,
    isRaining: isRainingNow,
    rainfall: isRainingNow ? (Math.random() * 5).toFixed(1) : "0.0",
    humidity: isRainingNow ? 95 : 70,
  };
};

export const generateMockData = (dayOffset, homeName, workName) => {
  const baseTemp = 20 + Math.floor(Math.random() * 8);
  const isRainy = Math.random() > 0.4;

  const currentData = dayOffset === 0 ? generateCurrentStatus() : null;

  return {
    current: currentData,
    morning: {
      name: homeName || LOCATIONS.morning.name,
      time: LOCATIONS.morning.time,
      temp: baseTemp,
      pop: isRainy ? 60 + Math.floor(Math.random() * 30) : 10,
      rainDetails: isRainy ? "1.5mm" : "0mm",
      desc: isRainy ? "短暫陣雨" : "多雲時晴",
      windSpeed: "3 m/s",
    },
    evening: {
      name: workName || LOCATIONS.evening.name,
      time: LOCATIONS.evening.time,
      temp: baseTemp - 2,
      pop: isRainy ? 70 + Math.floor(Math.random() * 20) : 20,
      rainDetails: isRainy ? "3.0mm" : "0mm",
      desc: isRainy ? "午後雷陣雨" : "陰天",
      windSpeed: "5 m/s",
    }
  };
};
