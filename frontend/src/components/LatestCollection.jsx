import React, { useContext, useEffect, useState, useRef, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "./ProductItem";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Search,
  ChevronDown,
  X,
  Plus,
  Minus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ShopByCountry from "./ShobByCountry";

const LatestCollection = () => {
  const { products, backendUrl } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [openGroups, setOpenGroups] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllMobile, setShowAllMobile] = useState(false); // Mobile toggle state
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const scrollRefTop = useRef(null);
  const scrollRefBottom = useRef(null);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/category/list");
      if (response.data.success) {
        setDbCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Category Fetch Error:", error);
    }
  };

  useEffect(() => {
    if (!products) return;
    const filtered = products
      .filter((item) => item.newArrival === true || item.newArrival === "true")
      .sort((a, b) => b.date - a.date)
      .slice(0, 15);
    setLatestProducts(filtered);
  }, [products]);

  useEffect(() => {
    if (backendUrl) fetchCategories();
  }, [backendUrl]);

  const unifiedIndex = useMemo(() => {
    if (!dbCategories.length) return [];

    const groupsMap = {};
    const independentList = [];
    const term = searchTerm.toLowerCase().trim();

    const normalize = (str) => {
      if (!str) return "";
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    dbCategories.forEach((cat) => {
      const catName = cat.name.toLowerCase();
      const groupNameRaw = cat.group ? cat.group.trim() : "";
      const groupNameLower = groupNameRaw.toLowerCase();

      // Match condition: search term is in category name OR group name
      const isMatch = catName.includes(term) || groupNameLower.includes(term);
      if (!isMatch && term !== "") return;

      const normalizedName = normalize(cat.name);
      const item = { name: normalizedName, count: cat.productCount || 0 };
      const isIndependent =
        !groupNameRaw ||
        ["general", "independent", "none", ""].includes(groupNameLower);

      if (isIndependent) {
        independentList.push({ ...item, type: "independent" });
      } else {
        const gName = normalize(groupNameRaw);
        if (!groupsMap[gName]) {
          groupsMap[gName] = {
            name: gName,
            type: "group",
            items: [],
            totalCount: 0,
          };
        }
        groupsMap[gName].items.push(item);
        groupsMap[gName].totalCount += item.count;

        // AUTO-OPEN: If we are searching and find a match in a group, force it open
        if (term !== "" && !openGroups[gName]) {
          setOpenGroups((prev) => ({ ...prev, [gName]: true }));
        }
      }
    });

    const combined = [...Object.values(groupsMap), ...independentList];
    return combined.sort((a, b) => a.name.localeCompare(b.name));
  }, [dbCategories, searchTerm]);

  // Logic to slice the index for mobile view
  const displayedIndex = useMemo(() => {
    if (showAllMobile || window.innerWidth >= 1024) {
      return unifiedIndex;
    }
    return unifiedIndex.slice(0, 5);
  }, [unifiedIndex, showAllMobile]);

  const toggleGroup = (groupName) =>
    setOpenGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));

  const handleCategoryClick = (catName) => {
    navigate(`/collection?category=${encodeURIComponent(catName)}`, {
      replace: true,
    });
    window.scrollTo(0, 0);
  };

  const handleProductClick = (productId) => {
    navigate("/collection", { state: { priorityId: productId } });
    window.scrollTo(0, 0);
  };

  const scrollRegistry = (direction) => {
    const scrollAmount = 400;

    [scrollRefTop.current, scrollRefBottom.current].forEach((ref) => {
      if (ref) {
        ref.scrollBy({
          left: direction === "left" ? -scrollAmount : scrollAmount,
          behavior: "smooth",
        });
      }
    });
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
      setScrollProgress(progress);
    }
  };

  return (
    <div className="bg-white py-12 md:py-32 overflow-hidden select-none relative">
      <div className="absolute -left-[10vw] top-[10%] h-[80%] w-[35%] bg-[#bd002d]/5 rounded-r-[600px] pointer-events-none"></div>

      <div className="px-6 md:px-10 relative z-10">
        {/* <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 border border-[#BC002D] rounded-full flex items-center justify-center">
                                <span className="text-[10px] font-serif italic text-[#BC002D] font-bold">PB</span>
                            </div>
                            <span className="text-[10px] tracking-[0.6em] text-[#BC002D] uppercase font-black">Featured Specimens</span>
                        </div>
                        <h2 className="text-5xl md:text-8xl font-bold text-gray-900 tracking-tighter leading-none">
                            NEW <span className="text-[#bd002d]">Arrivals.</span>
                        </h2>
                    </div>
                </div> */}

        <div className="flex flex-col lg:flex-row gap-12">
          {/* --- SIDEBAR --- */}

          {/* MAIN PRODUCT GRID */}
          {/* MAIN PRODUCT GRID CONTAINER */}
          <div className="w-full lg:w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-7 gap-6">
              <div>
                <div className="flex items-center gap-4 mt-4">
                  <span className="h-[1px] w-12 bg-[#BC002D]"></span>
                  <span className="text-[10px] tracking-[0.6em] text-[#BC002D] uppercase font-black">
                    Curated Selection
                  </span>
                </div>
                <h2 className="text-3xl font-bold tracking-tighter uppercase  text-gray-900">
                  New <span className="text-[#BC002D]">Arrivals.</span>
                </h2>
              </div>
              <button
                onClick={() => navigate("/collection")}
                className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group border-b border-black pb-1 text-[#BC002D] hover:border-[#BC002D] transition-all"
              >
                Explore All Products{" "}
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>

            {/* 1. Grid setup: Changed to carousel layout with horizontal scrolling */}
            <div className="relative group/nav">
              {/* Scroll Buttons */}
              <button
                onClick={() => scrollRegistry("left")}
                className="hidden text-black lg:flex absolute -left-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full items-center justify-center bg-white border border-gray-100 shadow-xl opacity-0 group-hover/nav:opacity-100 transition-all"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={() => scrollRegistry("right")}
                className="hidden text-black lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full items-center justify-center bg-white border border-gray-100 shadow-xl opacity-0 group-hover/nav:opacity-100 transition-all"
              >
                <ChevronRight size={18} />
              </button>

              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="overflow-x-auto pb-10 pt-4 mobile-scrollbar scroll-smooth"
              >
                <div className="overflow-hidden pt-4 pb-10">
                  {/* ROW 1 */}
                  <div
                    ref={scrollRefTop}
                    className="flex overflow-x-auto gap-6 mobile-scrollbar scroll-smooth mb-6"
                  >
                    {latestProducts
                      .filter((_, i) => i % 2 === 0)
                      .map((item) => (
                        <div
                          key={item._id}
                          className="min-w-[65%] sm:min-w-[40%] lg:min-w-[18%] max-w-[150px] group relative"
                        >
                          <div className="absolute -top-2 -left-2 z-20 pointer-events-none scale-75 md:scale-90">
                            <div className="bg-[#bd002d] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                              <span className="text-[10px] font-black uppercase">
                                New
                              </span>
                            </div>
                          </div>

                          <div
                            onClick={() => handleProductClick(item._id)}
                            className="bg-white border border-gray-100 shadow-md cursor-pointer hover:-translate-y-2 hover:shadow-xl transition-all rounded-br-[40px] overflow-hidden"
                          >
                            <div className="p-1 aspect-square bg-[#f8f8f8]">
                              <ProductItem {...item} isPriorityMode />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* ROW 2 */}
                  <div
                    ref={scrollRefBottom}
                    className="flex overflow-x-auto gap-6 mobile-scrollbar scroll-smooth"
                  >
                    {latestProducts
                      .filter((_, i) => i % 2 !== 0)
                      .map((item) => (
                        <div
                          key={item._id}
                          className="min-w-[65%] sm:min-w-[40%] lg:min-w-[18%] max-w-[150px] group relative"
                        >
                          <div className="absolute -top-2 -left-2 z-20 pointer-events-none scale-75 md:scale-90">
                            <div className="bg-[#bd002d] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                              <span className="text-[10px] font-black uppercase">
                                New
                              </span>
                            </div>
                          </div>

                          <div
                            onClick={() => handleProductClick(item._id)}
                            className="bg-white border border-gray-100 shadow-md cursor-pointer hover:-translate-y-2 hover:shadow-xl transition-all rounded-br-[40px] overflow-hidden"
                          >
                            <div className="p-1 aspect-square bg-[#f8f8f8]">
                              <ProductItem {...item} isPriorityMode />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* --- PROGRESS BAR --- */}
            <div className="hidden lg:flex mt-2 flex items-center gap-4 max-w-[200px] mx-auto opacity-30">
              <div className="relative h-[2px] flex-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-[#BC002D] transition-all duration-300"
                  style={{ width: `${scrollProgress}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-5 gap-6 mt-5">
              <div className="max-w-2xl">
                <div className="flex items-center gap-4 mt-4">
                  <span className="h-[1px] w-12 bg-[#BC002D]"></span>
                  <span className="text-[10px] tracking-[0.6em] text-[#BC002D] uppercase font-black">
                    Curated Selection
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tighter leading-none uppercase">
                  Shop By <span className="text-[#bd002d] ml-1">Country.</span>
                </h2>
              </div>
              <button
                onClick={() => {
                  navigate("/shopallcountry");
                  window.scroll(0, 0);
                }}
                className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group border-b border-black pb-1 text-[#BC002D] hover:border-[#BC002D] transition-all"
              >
                Explore All Countries{" "}
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>

            {/* 2. ShopByCountry placement: Moved outside the grid for proper full-width display */}
            <div className=" border-t border-gray-100 ">
              <ShopByCountry />
            </div>

            <div className="flex justify-center items-center mt-16">
              <button
                onClick={() => {
                  navigate("/collection");
                  window.scrollTo(0, 0);
                }}
                className="text-[11px] text-black uppercase tracking-[0.3em] font-black flex items-center gap-3 group border-b-2 border-black pb-2 hover:text-[#BC002D] hover:border-[#BC002D] transition-all duration-500"
              >
                Explore More Products
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-2 transition-transform duration-500"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatestCollection;
