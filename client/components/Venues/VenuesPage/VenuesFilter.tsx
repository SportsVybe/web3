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
    <div className="flex md:flex-row flex-col items-center justify-around w-full md:w-[600px] text-white">
      <div className="p-2">
        <span>Sports:</span>
        <select
          className="w-[120px] ml-2 py-1 px-2 bg-black disabled:bg-gray-300"
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
        <span>
          {isSearching ? (
            "Searching..."
          ) : (
            <button
              onClick={() => applySearch(value)}
              className="px-2 py-1 mx-3 my-2 bg-green-200 hover:bg-green-500 rounded-full  text-black"
            >
              Apply
            </button>
          )}
        </span>
      </div>
    </div>
  );
}
