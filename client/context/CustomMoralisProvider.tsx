import { createContext, useContext } from "react";
import { useMoralis } from "react-moralis";

const defaultState = {
  createUserAction: async (contractAction: string) => {
    return { id: "", actionId: "", contractAction: "" };
  },
  getObject: async (schema: string, field: string, objectId: string) => {
    return {};
  },
};

const CustomMoralisContext = createContext(defaultState);

const CustomMoralisProvider = ({ children }: { children: any }) => {
  const { Moralis } = useMoralis();

  const createUserAction = async (contractAction: string): Promise<any> => {
    const action = await getObject(
      "contractActions",
      "objectId",
      contractAction
    );
    const userAction = new Moralis.Object("user_actions");
    userAction.set("contractAction", action);
    userAction.set("createdBy", Moralis.User.current());
    await userAction.save();
    return userAction;
  };

  const getObject = async (
    schema: string,
    field: string,
    objectId: string
  ): Promise<any> => {
    const query = new Moralis.Query(schema);
    query.equalTo(field, objectId);
    return await query.first();
  };

  return (
    <CustomMoralisContext.Provider value={{ createUserAction, getObject }}>
      {children}
    </CustomMoralisContext.Provider>
  );
};

const useCustomMoralis = () => useContext(CustomMoralisContext);

export { CustomMoralisProvider, useCustomMoralis };
