import { TeamsController } from "../../components/Teams/TeamsPage/TeamsController";

export default function TeamsPage() {
  return (
    <div className="mb-auto">
      <div className="flex flex-col justify-center items-center">
        <div className="pb-4">
          <h1 className="md:text-xl md:mb-8">
            Explore the various teams Available!
          </h1>
        </div>
        <TeamsController />
      </div>
    </div>
  );
}
