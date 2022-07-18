import { useContract } from "../../context/ContractProvider";

export interface IAuthorizeButtonProps {
  amount: number;
}

const defaultProps: IAuthorizeButtonProps = {
  amount: 100,
};

AuthorizeButton.defaultProps = defaultProps;

export default function AuthorizeButton(props: IAuthorizeButtonProps) {
  const { approveAmount, isContractLoading } = useContract();

  const handleTokenApproval = async () => {
    //console.log("Allow to spend, "+ amount);
    await approveAmount(String(props.amount));
  };
  return (
    <button
      className="my-3 px-2 py-1 bg-red-600 text-white rounded-full disabled:bg-slate-300"
      onClick={() => handleTokenApproval()}
      disabled={isContractLoading}
    >
      Allow the SportVybe Protocol to use your VYBES Token
    </button>
  );
}
