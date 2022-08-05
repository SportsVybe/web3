import { useState } from "react";
import { InviteCard } from "./InviteCard";
import { Invite } from "./InvitesController";

type Props = {
  pending: Invite[] | [];
  accepted: Invite[] | [];
  sent: Invite[] | [];
};
export const InvitesView = (props: Props) => {
  const { pending, accepted, sent } = props;
  const [activeTab, setActiveTab] = useState("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  return (
    <div>
      <div className="flex flex-row justify-center items-center">
        <div
          className={`flex cursor-pointer flex-col md:w-[240px] w-[130px] items-center justify-center p-2 ${
            activeTab == "pending" && "bg-green-200"
          }`}
          onClick={() => setActiveTab("pending")}
        >
          {pending && pending.length} Pending
        </div>
        <div
          className={`flex cursor-pointer flex-col md:w-[240px] w-[130px] items-center justify-center p-2 ${
            activeTab == "accepted" && "bg-green-200"
          }`}
          onClick={() => setActiveTab("accepted")}
        >
          {accepted && accepted.length} Accepted
        </div>
        <div
          className={`flex cursor-pointer flex-col md:w-[240px] w-[130px] items-center justify-center p-2 ${
            activeTab == "sent" && "bg-green-200"
          }`}
          onClick={() => setActiveTab("sent")}
        >
          {sent && sent.length} Sent
        </div>
      </div>
      {activeTab === "pending" && (
        <div className="flex flex-col justify-center items-center">
          {pending.length > 0 && activeTab === "pending" ? (
            <div className="flex flex-col justify-center items-center">
              <div className="flex flex-wrap justify-center items-center">
                {pending.map((invite) => (
                  <InviteCard
                    key={invite.id}
                    invite={invite}
                    isPending={true}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center">
              <h1 className="text-xl">No pending invites</h1>
            </div>
          )}
        </div>
      )}
      {activeTab === "accepted" && (
        <div className="flex flex-col justify-center items-center">
          {accepted.length > 0 && activeTab === "accepted" ? (
            <div className="flex flex-col justify-center items-center">
              <div className="flex flex-wrap justify-center items-center">
                {accepted.map((invite) => (
                  <InviteCard
                    key={invite.id}
                    invite={invite}
                    isAccepted={true}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center">
              <h1 className="text-xl">No accepted invites</h1>
            </div>
          )}
        </div>
      )}
      {activeTab === "sent" && (
        <div className="flex flex-col justify-center items-center">
          {sent.length > 0 && activeTab === "sent" ? (
            <div className="flex flex-col justify-center items-center">
              <div className="flex flex-wrap justify-center items-center">
                {sent.map((invite) => (
                  <InviteCard key={invite.id} invite={invite} isSent={true} />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center">
              <h1 className="text-xl">No sent invites</h1>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
