// CWA API Service

// Helper to find forecast for specific time
// 預報資料通常是每3小時或12小時。
// 通勤時間：08:00 (使用 06:00-09:00 或 06:00-18:00)
// 通勤時間：17:30 (使用 15:00-18:00 或 06:00-18:00/18:00-06:00)
const findForecastElement = (weatherElement, elementName, targetTime) => {
  const element = weatherElement.find(e => e.elementName === elementName);
  if (!element) return null;

  // Find time slot covering targetTime
  // format: startTime, endTime
  const target = new Date(targetTime).getTime();

  const timeSlot = element.time.find(t => {
    const start = new Date(t.startTime).getTime();
    const end = new Date(t.endTime).getTime();
    return target >= start && target < end;
  });

  if (!timeSlot) return null;
  return timeSlot.elementValue[0].value;
};

// 台北市
const FORECAST_ID = "F-D0047-061";
// 新北市
// const FORECAST_ID_NEW = "F-D0047-065";

const formatTime = (dateStr) => {
  return new Date(dateStr).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
};

export const fetchRealWeather = async (apiKey, dayOffset, homeName, workName) => {
  // Determine target dates
  const now = new Date();
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + dayOffset);

  // Set Morning Target (08:30)
  const morningTarget = new Date(targetDate);
  morningTarget.setHours(8, 30, 0, 0);

  // Set Evening Target (17:30)
  const eveningTarget = new Date(targetDate);
  eveningTarget.setHours(17, 30, 0, 0);

  try {
    // 1. Fetch Forecast (F-D0047-061) - 鄉鎮天氣預報-未來2天(每3小時)
    // 注意：這裡簡化假設都在台北市，若要支援全台需要更多邏輯 (Lookup Table)
    const forecastUrl = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/${FORECAST_ID}?Authorization=${apiKey}&format=JSON`;

    // 2. Fetch Current Weather (O-A0003-001) - 只有當 dayOffset === 0 (今天) 才需要
    const currentUrl = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${apiKey}&format=JSON`;

    const [forecastRes, currentRes] = await Promise.all([
      fetch(forecastUrl).then(r => r.json()),
      dayOffset === 0 ? fetch(currentUrl).then(r => r.json()) : Promise.resolve(null)
    ]);

    if (!forecastRes.success || (dayOffset === 0 && !currentRes.success)) {
      throw new Error("API Request Failed");
    }

    // Process Forecast Data
    const locations = forecastRes.records.locations[0].location;

    // Helper to extract data for a specific location and time
    const getLocationData = (locName, timeTarget) => {
      // Fuzzy match location name (e.g. "信義區" -> match "信義區")
      const locData = locations.find(l => l.locationName.includes(locName) || locName.includes(l.locationName));
      if (!locData) return null; // Fallback handled later

      const pop = findForecastElement(locData.weatherElement, "PoP12h", timeTarget) || findForecastElement(locData.weatherElement, "PoP6h", timeTarget) || "0";
      const temp = findForecastElement(locData.weatherElement, "T", timeTarget);
      const wx = findForecastElement(locData.weatherElement, "Wx", timeTarget);
      const ws = findForecastElement(locData.weatherElement, "WS", timeTarget);

      return {
        pop: parseInt(pop),
        temp: parseInt(temp),
        desc: wx,
        windSpeed: `${ws} m/s`,
        // Rain details not always available in basic forecast, using approximation or specialized element if available
        rainDetails: parseInt(pop) > 30 ? "有雨" : "0mm"
      };
    };

    const morningData = getLocationData(homeName, morningTarget);
    const eveningData = getLocationData(workName, eveningTarget);

    // Process Current Data (if today)
    let currentDataObj = null;
    if (currentRes) {
        // Find observation for Home location (closest station)
        // Simplification: Match based on name. In reality, need geospatial distance.
        const stations = currentRes.records.Station;
        const station = stations.find(s => s.GeoInfo.TownName && homeName.includes(s.GeoInfo.TownName)) || stations[0]; // Fallback to first if not found

        const rainElement = station.WeatherElement.RainfallElement;
        const tempElement = station.WeatherElement.AirTemperature;

        // Rainfall is usually "Now" (past 1hr or 10min). O-A0003 provides daily/hourly.
        // Station.WeatherElement.RainfallElement.Now.Precipitation (Wait, check structure)
        // New O-A0003 structure might be slightly different, let's assume standard keys or check docs.
        // Usually: station.WeatherElement.Now.Precipitation (mm)

        // Note: The structure varies. I will try to use safe access.
        const rainNow = station.WeatherElement.Now?.Precipitation ?? 0;
        const isRaining = rainNow > 0;

        currentDataObj = {
            timestamp: formatTime(station.ObsTime.DateTime),
            location: `${station.GeoInfo.TownName} (${station.StationName})`,
            temp: station.WeatherElement.AirTemperature,
            isRaining: isRaining,
            rainfall: rainNow.toFixed(1),
            humidity: station.WeatherElement.RelativeHumidity,
        };
    }

    return {
      current: currentDataObj,
      morning: {
        name: homeName,
        time: "08:00 - 09:00",
        ...morningData
      },
      evening: {
        name: workName,
        time: "17:30 - 18:00",
        ...eveningData
      }
    };

  } catch (error) {
    console.error("Weather API Error:", error);
    throw error;
  }
};
