// CWA API Service

// Helper to find forecast for specific time
// 預報資料通常是每3小時或12小時。
// 通勤時間：08:00 (使用 06:00-09:00 或 06:00-18:00)
// 通勤時間：17:30 (使用 15:00-18:00 或 06:00-18:00/18:00-06:00)
const findForecastElement = (weatherElement, elementName, targetTime) => {
  // Element keys might be "elementName" or "ElementName"
  const element = weatherElement.find(e => (e.elementName === elementName) || (e.ElementName === elementName));
  if (!element) return null;

  // Find time slot covering targetTime
  // format: startTime, endTime
  // Note: key might be "time" or "Time"
  const timeArray = element.time || element.Time;
  const target = new Date(targetTime).getTime();

  const timeSlot = timeArray.find(t => {
    // Keys might be "startTime"/"endTime" or "StartTime"/"EndTime" or "dataTime"/"DataTime"
    const startStr = t.startTime || t.StartTime || t.dataTime || t.DataTime;
    const endStr = t.endTime || t.EndTime;

    // If only dataTime is present (point-in-time forecast), assume it covers a 3-hour window or exact match
    if (!endStr) {
        const start = new Date(startStr).getTime();
        // Assuming 3-hour block for safety if no end time, or checking valid range
        return Math.abs(target - start) < 3 * 60 * 60 * 1000;
    }

    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    return target >= start && target < end;
  });

  if (!timeSlot) return null;

  // elementValue structure: [{ value: "20", measures: "..." }] or [{ ElementValue: [{ Temperature: "19" }] }]
  // The structure in debug log is:
  // "ElementValue": [{"Temperature": "19"}] or [{"ProbabilityOfPrecipitation": "20"}]
  // This is non-standard compared to other CWA APIs.

  const valObj = timeSlot.elementValue || timeSlot.ElementValue;
  if (Array.isArray(valObj)) {
      if (valObj[0].value) return valObj[0].value;

      // Handle the complex object structure seen in debug log
      // e.g. [{"Temperature": "19"}]
      const firstVal = valObj[0];
      const values = Object.values(firstVal);
      if (values.length > 0) return values[0];
  }

  return null;
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
    // Note: Parameter must be 'ElementName' (Capital E) for F-D0047 dataset filtering to work.
    const forecastUrl = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/${FORECAST_ID}?Authorization=${apiKey}&format=JSON&ElementName=溫度,3小時降雨機率,天氣現象,風速`;

    // 2. Fetch Current Weather (O-A0001-001) - Automatic Weather Station (more stations than O-A0003-001)
    // Switching to O-A0001-001 to get better coverage (e.g., Xinyi, Neihu) which are missing in Manned (O-A0003-001)
    const currentUrl = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0001-001?Authorization=${apiKey}&format=JSON`;

    const [forecastRes, currentRes] = await Promise.all([
      fetch(forecastUrl).then(r => r.json()),
      dayOffset === 0 ? fetch(currentUrl).then(r => r.json()) : Promise.resolve(null)
    ]);

    if (!forecastRes.success || (dayOffset === 0 && !currentRes.success)) {
      throw new Error("API Request Failed");
    }

    // Process Forecast Data
    // Note: CWA API keys might be capitalized differently depending on the dataset version.
    // F-D0047-061 returns "Locations" (capital L) and "Location" (capital L).
    const records = forecastRes.records;
    const locationsNode = records.locations || records.Locations;
    if (!locationsNode || locationsNode.length === 0) {
        throw new Error("Invalid API Response: No locations node found");
    }
    const locationList = locationsNode[0].location || locationsNode[0].Location;

    // Helper to extract data for a specific location and time
    const getLocationData = (locName, timeTarget) => {
      // Fuzzy match location name (e.g. "信義區" -> match "信義區")
      // Handle both locationName and LocationName
      const locData = locationList.find(l => {
          const name = l.locationName || l.LocationName;
          return name.includes(locName) || locName.includes(name);
      });

      if (!locData) return null; // Fallback handled later

      // Element keys might also vary (weatherElement vs WeatherElement)
      const weatherElements = locData.weatherElement || locData.WeatherElement;

      const pop = findForecastElement(weatherElements, "PoP12h", timeTarget) || findForecastElement(weatherElements, "PoP6h", timeTarget) || findForecastElement(weatherElements, "3小時降雨機率", timeTarget) || "0";
      const temp = findForecastElement(weatherElements, "T", timeTarget) || findForecastElement(weatherElements, "溫度", timeTarget);
      const wx = findForecastElement(weatherElements, "Wx", timeTarget) || findForecastElement(weatherElements, "天氣現象", timeTarget);
      const ws = findForecastElement(weatherElements, "WS", timeTarget) || findForecastElement(weatherElements, "風速", timeTarget);

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
        const stations = currentRes.records.Station;

        // Strategy:
        // 1. Exact/Fuzzy match on TownName (e.g. "信義區")
        // 2. Fallback to "臺北" (Taipei Station, usually reliable proxy)
        // 3. Fallback to first available station

        let station = stations.find(s => {
            const townName = s.GeoInfo.TownName;
            return townName && (homeName.includes(townName) || townName.includes(homeName));
        });

        if (!station) {
            // Fallback: Try "Zhongzheng District" (Taipei City Center) if the specific district station is missing
            // This is a common proxy for "Taipei" in AWS datasets where the named station "Taipei" might not exist.
            station = stations.find(s => s.GeoInfo.TownName === "中正區");
        }

        if (!station) {
            // Check for Taipei Main Station proxy by name (just in case)
            station = stations.find(s => s.StationName === "臺北");
        }

        if (!station) {
            station = stations[0];
        }

        const rainRaw = station.WeatherElement.Now?.Precipitation;
        const rainNow = parseFloat(rainRaw === 'X' || rainRaw === '-' ? 0 : (rainRaw ?? 0));
        const isRaining = rainNow > 0;

        // Display logic: If exact town not found, show "Taipei (Proxy)" or similar?
        // Actually, just showing the station name is clear enough.

        currentDataObj = {
            timestamp: formatTime(station.ObsTime.DateTime),
            location: `${station.GeoInfo.TownName || station.StationName}`,
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
