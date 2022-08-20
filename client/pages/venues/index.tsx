import { VenuesController } from "../../components/Venues/VenuesPage/VenuesController";

export default function VenuesPage() {
  return (
    <div className="mb-auto">
      <div className="flex flex-col justify-center items-center">
        <div className="pb-4">
          <h1 className="md:text-xl md:mb-8 text-white">
            Explore venues around you!
          </h1>
        </div>
        <VenuesController />
      </div>
    </div>
  );
}
