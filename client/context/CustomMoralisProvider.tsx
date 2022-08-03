import { createContext, useContext } from "react";
import { useMoralis } from "react-moralis";
import { validateUsername } from "../helper/validateUsername";

const defaultState = {
  createUserAction: async (contractAction: string) => {
    return { id: "", actionId: "", contractAction: "", save: async ({}) => {} };
  },
  getFirstObject: async (schema: string, field: string, objectId: string) => {
    return {};
  },
  getAllObjects: async (schema: string, field: string, objectId: string) => {
    return [];
  },
  getAllPossibleObjects: async (
    schema: string,
    field: string,
    objectId: string
  ) => {
    return [];
  },
  cloudFunction: async (
    cloudFunctionName: string,
    params: any
  ): Promise<any> => {
    return {};
  },
  objectExists: async (schema: string, field: string, objectId: string) => {
    return false;
  },
  fetchUser: async (
    value: string,
    method: string,
    includeEthAddress: boolean
  ) => {
    return [];
  },
};

const CustomMoralisContext = createContext(defaultState);

const CustomMoralisProvider = ({ children }: { children: any }) => {
  const { Moralis } = useMoralis();

  const createUserAction = async (contractAction: string): Promise<any> => {
    const action = await getFirstObject(
      "contractActions",
      "objectId",
      contractAction
    );
    if (!contractAction) return null;
    const userAction = new Moralis.Object("user_actions");
    userAction.set("contractAction", action);
    userAction.set("createdBy", Moralis.User.current());
    await userAction.save();
    return userAction;
  };

  const getFirstObject = async (
    schema: string,
    field: string,
    objectId: string
  ): Promise<any> => {
    if (!schema || !field || !objectId) return {};
    const query = new Moralis.Query(schema);
    query.equalTo(field, objectId);
    return await query.first();
  };

  const getAllObjects = async (
    schema: string,
    field: string,
    searchString: string
  ): Promise<any> => {
    if (!schema || !field || !searchString) return [];
    const query = new Moralis.Query(schema);
    query.equalTo(field, searchString);
    return await query.find();
  };

  const getAllPossibleObjects = async (
    schema: string,
    field: string,
    searchString: string
  ): Promise<any> => {
    if (!schema || !field || !searchString) return [];
    const query = new Moralis.Query(schema);
    query.contains(field, searchString);
    return await query.find();
  };

  const objectExists = async (
    schema: string,
    field: string,
    searchString: string
  ): Promise<boolean> => {
    if (!schema || !field || !searchString) return false;
    const query = await getAllObjects(schema, field, searchString);
    return query.length > 0;
  };

  const cloudFunction = async (
    cloudFunctionName: string,
    params: any
  ): Promise<any> => {
    if (!cloudFunctionName) return null;
    const result = Moralis.Cloud.run(cloudFunctionName, params);
    return await result;
  };

  const fetchUser = async (
    value: string,
    method: string,
    includeEthAddress: boolean = false
  ): Promise<any> => {
    try {
      let isUsernameValid: boolean = false;
      if (!value) return null;
      if (method === "username") {
        isUsernameValid = validateUsername(value);
      }
      if (isUsernameValid || method !== "username") {
        const results = await cloudFunction("getUser", {
          value,
          method,
          includeEthAddress,
        });
        if (results != null && results.success) {
          return results;
        }
      }
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  return (
    <CustomMoralisContext.Provider
      value={{
        createUserAction,
        getFirstObject,
        getAllObjects,
        objectExists,
        cloudFunction,
        fetchUser,
        getAllPossibleObjects,
      }}
    >
      {children}
    </CustomMoralisContext.Provider>
  );
};

const useCustomMoralis = () => useContext(CustomMoralisContext);

export { CustomMoralisProvider, useCustomMoralis };
