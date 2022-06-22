import { useEffect, useState } from "react";

export default function TeamsFilter({ filterTeams, isLoading }) {
  const [teamPOS, setTeamPOS] = useState(0);
  const [sport, setSport] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [filterValue, setFilterValue] = useState("");

  const handleChange = (filterSelected) => {
    switch (filterSelected) {
      case "all":
        setFilterBy("all");
        break;
      case "teamPOS":
        setFilterBy("teamPOS");
        setFilterValue(teamPOS);
        break;
      case "sport":
        setFilterBy("sport");
        setFilterValue(sport);
        break;
      default:
        setFilterBy("all");
        break;
    }
    // filterTeams(filterBy, filterValue);
  };

  const updateFilterValue = () => {
    switch (filterBy) {
      case "all":
        setFilterBy("all");
        setFilterValue("all");
        break;
      case "teamPOS":
        setFilterBy("teamPOS");
        setFilterValue(teamPOS);
        break;
      case "sport":
        setFilterBy("sport");
        setFilterValue(sport);
        break;
      default:
        setFilterValue("all");
        break;
    }
  };

  useEffect(() => {
    updateFilterValue();
  }, [filterBy, teamPOS, sport]);

  return (
    <div className="flex flex-row items-center justify-around j w-[480px] lg:w-[600px]">
      <h1>Filter:</h1>
      <div>
        <input
          type="radio"
          defaultChecked
          className="m-2"
          name="filter"
          value="all"
          onChange={(e) => handleChange("all")}
        />{" "}
        All
      </div>
      <div>
        <input
          type="radio"
          className="m-2"
          name="filter"
          value="teamPOS"
          onChange={(e) => handleChange("teamPOS")}
        />
        Sportsmanship:
        <input
          type="number"
          placeholder="Search"
          onChange={(e) => setTeamPOS(e.target.value)}
          value={teamPOS}
          className="w-[60px] ml-2 py-1 px-2 disabled:bg-gray-300"
          disabled={filterBy !== "teamPOS"}
        />
      </div>

      <div>
        <input
          type="radio"
          className="m-2"
          name="filter"
          value="sport"
          onChange={() => handleChange("sport")}
        />
        Sports:
        <select
          disabled={filterBy !== "sport"}
          className="w-[120px] ml-2 py-1 px-2  disabled:bg-gray-300"
          onChange={(e) => setSport(e.target.value)}
        >
          <option value="all">All</option>
          <option value="basketball">Basketball</option>
          <option value="football">Football</option>
          <option value="hockey">Hockey</option>
          <option value="soccer">Soccer</option>
          <option value="volleyball">Volleyball</option>
        </select>
      </div>

      <button
        onClick={() => filterTeams(filterBy, filterValue)}
        disabled={isLoading}
        className="px-4 py-2 mx-3 my-2 bg-green-200 hover:bg-green-500 rounded-full"
      >
        Apply
      </button>
    </div>
  );
}
