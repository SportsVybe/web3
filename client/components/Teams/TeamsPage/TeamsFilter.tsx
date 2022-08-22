import { useState } from "react";

import { sports } from "../../../configs/constants";
import { capitalizeWord } from "../../../helper/formatter";

type Props = {
  fetchSearchTeams: (
    attribute: string,
    value: string | number | boolean
  ) => Promise<any>;
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;
};

export default function TeamsFilter({ fetchSearchTeams, isSearching }: Props) {
  const [teamPOS, setTeamPOS] = useState<string | number>(0);

  const selectMenu = ["all", ...sports];
  const [value, setValue] = useState("");

  const applySearch = (value: string) => {
    if (value === "all") {
      fetchSearchTeams("isTeamActive", true);
    } else {
      fetchSearchTeams("teamSportsPreferences", value);
    }
  };

  return (
    <div className="flex md:flex-row flex-col items-center justify-around w-full md:w-[600px] text-white">
      <div className="py-2">
        <span> Sports:</span>
        <select
          className="w-[120px] ml-2 py-1 px-2 bg-black  disabled:bg-gray-300"
          onChange={(e) => setValue(e.target.value)}
        >
          {selectMenu.map((item, i) => (
            <option
              defaultChecked={item == "all"}
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
              className="px-2 py-1 my-2 mx-3 bg-green-200 hover:bg-green-500 rounded-full  text-black"
            >
              Apply
            </button>
          )}
        </span>
      </div>
    </div>
  );
}
