import { TeamCard } from "../TeamCard";

type Props = {
  data: any;
  isLoading: boolean;
};

export default function Teams({ data, isLoading }: Props) {
  return (
    <div className="flex flex-col w-[480px] lg:w-[600px]">
      {data &&
        !isLoading &&
        data.length > 0 &&
        data.map((team: any, i: number) => {
          return <TeamCard team={team.attributes} teamObject={team} key={i} />;
        })}

      {data.length === 0 && !isLoading && (
        <h1>No teams found. Try another search</h1>
      )}
    </div>
  );
}
