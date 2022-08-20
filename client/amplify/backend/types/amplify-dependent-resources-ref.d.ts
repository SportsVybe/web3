export type AmplifyDependentResourcesAttributes = {
  "function": {
    "sportsvybeFunctions": {
      "Name": "string";
      "Arn": "string";
      "Region": "string";
      "LambdaExecutionRole": "string";
    };
  };
  "api": {
    "api": {
      "RootUrl": "string";
      "ApiName": "string";
      "ApiId": "string";
    };
  };
  "storage": {
    "sportsvybeDB": {
      "Name": "string";
      "Arn": "string";
      "StreamArn": "string";
      "PartitionKeyName": "string";
      "PartitionKeyType": "string";
      "Region": "string";
    };
  };
};
