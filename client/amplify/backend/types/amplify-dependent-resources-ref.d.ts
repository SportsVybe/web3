export type AmplifyDependentResourcesAttributes = {
  "function": {
    "web3functions": {
      "Name": "string";
      "Arn": "string";
      "Region": "string";
      "LambdaExecutionRole": "string";
    };
  };
  "api": {
    "web3api": {
      "RootUrl": "string";
      "ApiName": "string";
      "ApiId": "string";
    };
  };
};
