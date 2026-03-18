import React, { useContext, useEffect, useState, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import { Globe, ArrowRight, Loader2 } from "lucide-react";
import countriesLib from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import axios from "axios";

const ShopByCountry = () => {
  const { navigate, backendUrl } = useContext(ShopContext);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  countriesLib.registerLocale(enLocale);

  // 1. Fetch from Category Table instead of processing 1 Lakh+ products
  useEffect(() => {
    const fetchCountryCategories = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/category/list`);
        if (res.data.success) {
          // Filter categories where group is "Country"
          const countryCats = res.data.categories.filter(
            (cat) => cat.group === "Country",
          );
          setCountries(countryCats);
        }
      } catch (err) {
        console.error("Archive Jurisdictions sync error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCountryCategories();
  }, [backendUrl]);

  // 2. Map and Clean Data for UI
  const displayedCountries = useMemo(() => {
    const overrides = {
      // 🇬🇧 UK breakdown
      england: "gb",
      scotland: "gb",
      wales: "gb",
      "northern ireland": "gb",
      "great britain": "gb",
      britain: "gb",
      uk: "gb",

      // 🇺🇸 USA variations
      usa: "us",
      "u.s.a": "us",
      "united states of america": "us",

      // 🇦🇪 UAE
      uae: "ae",
      "u.a.e": "ae",

      // 🇰🇷 / 🇰🇵 Korea ambiguity
      "south korea": "kr",
      "north korea": "kp",

      // 🇷🇺 Russia naming
      "russian federation": "ru",

      // 🇻🇳 Vietnam variations
      vietnam: "vn",
      "viet nam": "vn",

      // 🇨🇿 Czechia
      "czech republic": "cz",

      // 🇹🇷 Turkey naming change
      turkey: "tr", // old common name
      türkiye: "tr", // new official name

      // 🇮🇷 Iran
      iran: "ir",
      "iran, islamic republic of": "ir",

      // 🇸🇾 Syria
      syria: "sy",
      "syrian arab republic": "sy",

      // 🇻🇪 Venezuela
      venezuela: "ve",
      "venezuela, bolivarian republic of": "ve",

      // 🇧🇴 Bolivia
      bolivia: "bo",
      "bolivia, plurinational state of": "bo",

      // 🇹🇿 Tanzania
      tanzania: "tz",
      "tanzania, united republic of": "tz",

      // 🇱🇦 Laos
      laos: "la",
      "lao people's democratic republic": "la",

      // 🇲🇩 Moldova
      moldova: "md",
      "moldova, republic of": "md",

      // 🇧🇳 Brunei
      brunei: "bn",
      "brunei darussalam": "bn",

      // 🇨🇻 Cape Verde
      "cape verde": "cv",
      "cabo verde": "cv",

      // 🇸🇿 Eswatini
      swaziland: "sz",
      eswatini: "sz",

      // fallback edge
      eu: "eu", // European Union (flagcdn supports this)
    };
    return countries
      .map((cat) => {
        const cleanName = cat.name.replace(/^Country\s*>\s*/i, "").trim();
        let code = countriesLib.getAlpha2Code(cleanName, "en");
        if (!code) {
          code = overrides[cleanName.toLowerCase()];
        }

        return {
          originalName: cat.name,
          displayName: cleanName,
          count: cat.productCount || 0,
          code: code?.toLowerCase() || "un",
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }, [countries]);
  const handleCountryClick = (categoryName) => {
    // Navigate using the full category name used in the DB (e.g., "Country > India")
    navigate(`/collection?category=${encodeURIComponent(categoryName)}`);
    window.scrollTo(0, 0);
  };

  if (loading)
    return (
      <div className="h-40 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#BC002D]" size={24} />
      </div>
    );

  return (
    <div className="py-5 bg-white border-y border-gray-100">
      <div>
        {/* Header */}
        {/* <div className='flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6'>
                    <div>
                        <h2 className='text-3xl font-bold tracking-tighter uppercase  text-gray-900'>
                            SHOP BY <span className='text-[#BC002D]'>Country.</span>
                        </h2>
                    </div>
                    <button 
                        onClick={() => navigate('/collection')}
                        className='text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group border-b border-black pb-1 hover:text-[#BC002D] hover:border-[#BC002D] transition-all'
                    >
                        Explore Global Archive <ArrowRight size={14} className='group-hover:translate-x-1 transition-transform' />
                    </button>
                </div> */}

        {/* Flag Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {displayedCountries.map((country) => (
            <div
              key={country.originalName}
              onClick={() => handleCountryClick(country.originalName)}
              className="group cursor-pointer bg-gray-50 p-4 border border-transparent hover:border-[#BC002D] hover:bg-white transition-all duration-500 rounded-sm"
            >
              <div className="aspect-[3/2] overflow-hidden mb-4 shadow-sm border border-gray-200 relative">
                <img
                  src={`https://flagcdn.com/w320/${country.code.toLowerCase()}.png`}
                  alt={`${country.displayName} Registry`}
                  className="w-full h-full object-cover  group-hover:grayscale-0 transition-all duration-700"
                  // Error handling: if the image fails, show a generic globe
                  onError={(e) => {
                    e.target.src = "https://flagcdn.com/w320/un.png";
                  }}
                />
                <div className="absolute inset-0 bg-black/5 mix-blend-multiply pointer-events-none"></div>
              </div>

              <div className="flex flex-col items-center text-center">
                <p className="text-[10px] lg:text-[13px] font-semibold tracking-tight text-gray-900 text-transform:capatlized tracking-tighter text-gray-900 group-hover:text-[#BC002D] transition-colors">
                  {country.displayName}
                </p>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  {country.count.toLocaleString()} Specimens
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopByCountry;