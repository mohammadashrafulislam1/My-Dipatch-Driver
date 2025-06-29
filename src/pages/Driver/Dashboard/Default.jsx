import { useState } from "react";
import { DateRange } from "react-date-range";
import { IoChevronDown } from "react-icons/io5";
import { format } from "date-fns";
import "react-date-range/dist/styles.css"; // main style
import "react-date-range/dist/theme/default.css"; // theme style
import { FaArrowAltCircleDown, FaArrowAltCircleUp, FaClipboardList } from "react-icons/fa";
import { TbTruckDelivery } from "react-icons/tb";
import { FaCircleCheck, FaSackDollar } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import { GrDeliver } from "react-icons/gr";

const Default = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [range, setRange] = useState([
    {
      startDate: new Date("2024-04-17"),
      endDate: new Date("2025-05-21"),
      key: "selection",
    },
  ]);

  const toggleCalendar = () => {
    setShowCalendar((prev) => !prev);
  };

  const formattedRange = `${format(range[0].startDate, "dd MMMM yyyy")} - ${format(
    range[0].endDate,
    "dd MMMM yyyy"
  )}`;

  return (
   <div>
    {/* Date and year */}
    <div className="pt-2 relative">
      {/* Header */}
      <button
        onClick={toggleCalendar}
        className="flex items-center gap-2 text-gray-700 text-sm font-medium"
      >
        <span>{formattedRange}</span>
        <IoChevronDown className="text-base" />
      </button>

      {/* Calendar Dropdown */}
      {showCalendar && (
        <div className="absolute mt-2 z-50 bg-white shadow-lg rounded-md p-2">
          <DateRange
            editableDateInputs={true}
            onChange={(item) => setRange([item.selection])}
            moveRangeOnFirstSelection={false}
            ranges={range}
            rangeColors={["#006FFF"]}
          />
        </div>
      )}
    </div>


    {/* Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mt-6">
  {/* Card 1 */}
  <div className="stat bg-white flex items-center gap-4 p-4 rounded shadow-sm">
    <div className="stat-title bg-[#006eff2a] rounded-full w-[70px] h-[70px] flex items-center justify-center relative">
      <FaClipboardList className="text-[40px] text-[#006FFF]" />
      <FaArrowAltCircleDown
        className="bg-[#FF0500] text-white text-[20px] px-1 rounded-full absolute top-[14px] right-[8px]"
      />
    </div>
    <div>
      <div className="stat-value">75</div>
      <div className="poppins-light text-[12px]">Total Orders</div>
    </div>
  </div>

  {/* Card 2 */}
  <div className="stat bg-white flex items-center gap-4 p-4 rounded shadow-sm">
    <div className="stat-title bg-[#006eff2a] rounded-full w-[70px] h-[70px] flex items-center justify-center relative">
      <TbTruckDelivery className="text-[40px] text-[#006FFF]" />
      <FaCircleCheck
        className="bg-[#008000] text-white text-[20px] px-1 rounded-full absolute top-[14px] right-[8px]"
      />
    </div>
    <div>
      <div className="stat-value">85</div>
      <div className="poppins-light text-[12px]">Total Delivered</div>
    </div>
  </div>

  {/* Card 3 */}
  <div className="stat bg-white flex items-center gap-4 p-4 rounded shadow-sm">
    <div className="stat-title bg-[#006eff2a] rounded-full w-[70px] h-[70px] flex items-center justify-center relative">
      <GrDeliver className="text-[40px] text-[#006FFF]" />
      <MdCancel
        className="bg-[#FF0500] text-white text-[20px] px-1 rounded-full absolute top-[14px] right-[8px]"
      />
    </div>
    <div>
      <div className="stat-value">95</div>
      <div className="poppins-light text-[12px]">Total Cancelled</div>
    </div>
  </div>

  {/* Card 4 */}
  <div className="stat bg-white flex items-center gap-4 p-4 rounded shadow-sm">
    <div className="stat-title bg-[#006eff2a] rounded-full w-[70px] h-[70px] flex items-center justify-center relative">
      <FaSackDollar className="text-[40px] text-[#006FFF]" />
      <FaArrowAltCircleUp
        className="bg-[#008000] text-white text-[20px] px-1 rounded-full absolute top-[14px] right-[8px]"
      />
    </div>
    <div>
      <div className="stat-value">$175</div>
      <div className="poppins-light text-[12px]">Total Revenue</div>
    </div>
  </div>
</div>

{/* charts */}
   </div>
  );
};

export default Default;
