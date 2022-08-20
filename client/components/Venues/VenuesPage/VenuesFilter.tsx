import { useState } from "react";
import { sports } from "../../../configs/constants";
import { capitalizeWord } from "../../../helper/formatter";

type Props = {
  fetchSearchVenues: (
    attribute: string,
    value: string | number
  ) => Promise<any>;
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;
};

export default function VenuesFilter({
  fetchSearchVenues,
  isSearching,
}: Props) {
  const [value, setValue] = useState("");
  const selectMenu = ["featured", ...sports];

  const applySearch = (value: string) => {
    if (value === "featured") {
      fetchSearchVenues("status", 4);
    } else {
      fetchSearchVenues("availableActivities", value);
    }
  };

  return (
    <div className="flex flex-row items-center justify-around j w-[480px] lg:w-[600px] text-white">
      <h1>Filter:</h1>

      <div>
        Sports:
        <select
          className="w-[120px] ml-2 py-1 px-2  disabled:bg-gray-300"
          onChange={(e) => setValue(e.target.value)}
        >
          {selectMenu.map((item, i) => (
            <option
              defaultChecked={item == "featured"}
              key={item}
              value={item.toLowerCase()}
            >
              {capitalizeWord(item)}
            </option>
          ))}
        </select>
      </div>

      {isSearching ? (
        "Searching..."
      ) : (
        <button
          onClick={() => applySearch(value)}
          className="px-4 py-2 mx-3 my-2 bg-green-200 hover:bg-green-500 rounded-full  text-black"
        >
          Apply
        </button>
      )}
    </div>
  );
}
