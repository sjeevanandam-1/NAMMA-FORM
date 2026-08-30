import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import api from '../../lib/api.js';
import {
  CloudSun,
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  MapPin,
  Calendar,
  Sparkles,
  Sun,
  CloudLightning,
} from 'lucide-react';

export const WeatherPage: React.FC = () => {
  const { language } = useLanguage();
  const [district, setDistrict] = useState('Coimbatore');
  const [weather, setWeather] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const districts = ['Coimbatore', 'Erode', 'Tiruppur', 'Salem', 'Madurai', 'Thanjavur', 'Trichy', 'Dindigul'];

  useEffect(() => {
    fetchWeather();
  }, [district]);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      const res = await api.get('/weather', {
        params: { district, state: 'Tamil Nadu' },
      });
      if (res.data?.data) {
        setWeather(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch weather', err);
    } finally {
      setLoading(false);
    }
  };

  const forecast = weather?.forecastDays ? JSON.parse(weather.forecastDays) : [];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-sky-900 via-blue-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/20 border border-sky-400/30 rounded-full text-sky-200 text-xs font-semibold uppercase tracking-wider">
              <CloudSun className="w-3.5 h-3.5" />
              {language === 'ta' ? 'ஹைப்பர்லோகல் வானிலை & எச்சரிக்கைகள்' : 'Hyperlocal Weather & Agro Alerts'}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
              {language === 'ta' ? 'பண்ணை அளவிலான வானிலை அறிக்கை' : 'Farm-Level Hyperlocal Weather'}
            </h1>
            <p className="text-sky-100 text-sm sm:text-base max-w-2xl">
              {language === 'ta'
                ? 'நேரடி வெப்பநிலை, மழைப்பொழிவு சாத்தியக்கூறு, 7 நாள் வானிலை முன்னறிவிப்பு மற்றும் விவசாய ஆலோசனை.'
                : 'Real-time temperature, precipitation probability, 7-day forecast, and automated crop advisories.'}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-sky-950/60 p-2 rounded-2xl border border-sky-600/40">
            <MapPin className="w-4 h-4 text-sky-300" />
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="bg-transparent text-white text-xs sm:text-sm font-bold focus:outline-none cursor-pointer"
            >
              {districts.map((d) => (
                <option key={d} value={d} className="bg-slate-900 text-white">
                  {d}, Tamil Nadu
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm">Syncing weather satellites...</div>
        ) : weather ? (
          <>
            {/* Live Weather Overview (Main Hero) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Current Temperature Box (7 Cols) */}
              <div className="lg:col-span-7 bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col justify-between space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sky-100 text-xs font-semibold uppercase tracking-wider block">
                      {district}, Tamil Nadu
                    </span>
                    <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight mt-2">
                      {Math.round(weather.temperature)}°C
                    </h2>
                    <span className="text-sky-100 text-sm font-medium">Feels like {Math.round(weather.temperature + 1.5)}°C • {weather.condition}</span>
                  </div>
                  <CloudSun className="w-16 h-16 sm:w-24 sm:h-24 text-sky-200/80" />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-sky-400/30 text-xs text-sky-100">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-sky-200" />
                    <div>
                      <span className="block text-[10px] text-sky-200">Humidity</span>
                      <strong className="text-white text-sm">{weather.humidity}%</strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-sky-200" />
                    <div>
                      <span className="block text-[10px] text-sky-200">Rain Prob</span>
                      <strong className="text-white text-sm">{weather.rainProbability}%</strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-sky-200" />
                    <div>
                      <span className="block text-[10px] text-sky-200">Wind</span>
                      <strong className="text-white text-sm">{weather.windSpeedKmh} km/h</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agro Weather Advisory (5 Cols) */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-base font-bold text-slate-900">Agro-Meteorological Advisory</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100">
                    {weather.agroAdvisory ||
                      'Favorable humidity and soil moisture levels for vegetable nursery transplanting. Schedule irrigation in early morning hours.'}
                  </p>
                </div>

                {weather.rainProbability > 50 ? (
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <span>Postpone foliar pesticide sprays due to predicted shower window.</span>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                    <Sun className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>Clear weather window optimal for fertilizer application and harvesting.</span>
                  </div>
                )}
              </div>
            </div>

            {/* 7-Day Forecast Row */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-600" />
                {language === 'ta' ? '7 நாள் வானிலை முன்னறிவிப்பு' : '7-Day Extended Weather Forecast'}
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {forecast.map((f: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2 hover:bg-sky-50 transition"
                  >
                    <span className="text-xs font-bold text-slate-700 block">{f.day}</span>
                    {f.rainProb > 50 ? (
                      <CloudRain className="w-8 h-8 text-blue-500 mx-auto" />
                    ) : (
                      <Sun className="w-8 h-8 text-amber-500 mx-auto" />
                    )}
                    <div className="text-lg font-extrabold text-slate-900">{f.temp}°C</div>
                    <span className="text-[11px] text-slate-500 block">{f.condition}</span>
                    <span className="text-[10px] font-semibold text-blue-600 block">Rain: {f.rainProb}%</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
export default WeatherPage;
