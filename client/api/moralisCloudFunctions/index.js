const logger = Moralis.Cloud.getLogger();

const getObject = async (schema, field, objectId) => {
  if (!schema || !field || !searchString) return null;
  const query = new Moralis.Query(schema);
  query.equalTo(field, objectId);
  return await query.first();
};

const getAllObjects = async (schema, field, searchString) => {
  if (!schema || !field || !searchString) return [];
  const query = new Moralis.Query(schema);
  query.equalTo(field, searchString);
  return await query.find({ useMasterKey: true });
};

Moralis.Cloud.afterSave("contractTeamCreated", async (request) => {
  const confirmed = request.object.get("confirmed");
  const actionId = request.object.get("action_id");
  const teamId = request.object.get("team_id");
  logger.info(`contractTeamCreated: ${confirmed} ${actionId} ${teamId}`);
  try {
    if (confirmed) {
      const userAction = await getAllObjects(
        "user_actions",
        "objectId",
        actionId
      );
      const actionStatus = await userAction[0].get("actionStatus");
      if (!actionStatus) {
        await userAction[0].save("actionStatus", true);
        const contractAction = await userAction[0].get("contractAction");

        const getContractAction = await getAllObjects(
          "contractActions",
          "objectId",
          contractAction.id
        );
        const actionName = await getContractAction[0].get("actionName");
        if (actionName === "createTeam") {
          const teamUpdate = await getAllObjects(
            "teams",
            "actionId",
            userAction[0]
          );
          await teamUpdate[0].save("teamChainId", teamId);
        } else if (actionName === "createTeamForUser") {
          const userUpdate = await getAllObjects(
            "users",
            "actionId",
            userAction[0]
          );
          await userUpdate[0].save("userChainId", teamId);
          await userUpdate[0].save("createTeamsAvailable", true);
          await userUpdate[0].save("userPOS", 100);
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
});

Moralis.Cloud.define("teatContractTeamCreated", async (request) => {
  const confirmed = true;
  const actionId = request.params.actionId;
  let userAction = null;
  let teamId = "4";
  let contractAction = null;
  let actionName = null;
  let teamUpdate = null;
  let userUpdate = null;
  try {
    if (confirmed) {
      userAction = await getAllObjects("user_actions", "objectId", actionId);
      const actionStatus = await userAction[0].get("actionStatus");
      if (!actionStatus) {
        await userAction[0].save("actionStatus", true);
        contractAction = await userAction[0].get("contractAction");

        getContractAction = await getAllObjects(
          "contractActions",
          "objectId",
          contractAction.id
        );
        actionName = await getContractAction[0].get("actionName");
        if (actionName === "createTeam") {
          teamUpdate = await getAllObjects("teams", "actionId", userAction[0]);
          await teamUpdate[0].save("teamChainId", teamId);
        } else if (actionName === "createTeamForUser") {
          userUpdate = await getAllObjects("users", "actionId", userAction[0]);
          await userUpdate[0].save("userChainId", teamId);
          await userUpdate[0].save("createTeamsAvailable", true);
          await userUpdate[0].save("userPOS", 100);
        }
      }
      return {
        userAction,
        contractAction,
        getContractAction,
        actionStatus,
        actionName,
        teamUpdate,
        userUpdate,
      };
    }
  } catch (error) {
    console.error(error);
    return { error };
  }
});

Moralis.Cloud.afterSave("contractChallengePoolCreated", async (request) => {
  const confirmed = request.object.get("confirmed");
  const actionId = request.object.get("action_id");
  const challengeId = request.object.get("challenge_id");
  logger.info(
    `contractChallengePoolCreated: ${confirmed} ${actionId} ${challengeId}`
  );
  try {
    if (confirmed) {
      const userAction = await getObject("user_actions", "objectId", actionId);
      if (!userAction.attributes.actionStatus) {
        await userAction.save("actionStatus", true);
        const challengeUpdate = await getObject(
          "challenges",
          "actionId",
          userAction
        );
        await challengeUpdate.save("challengeChainId", challengeId);
      }
    }
  } catch (error) {
    console.error(error);
  }
});

Moralis.Cloud.afterSave("contractChallengeAccepted", async (request) => {
  const confirmed = request.object.get("confirmed");
  const actionId = request.object.get("action_id");
  logger.info(`contractChallengeAccepted: ${confirmed} ${actionId}`);
  try {
    if (confirmed) {
      const userAction = await getObject("user_actions", "objectId", actionId);
      if (!userAction.attributes.actionStatus) {
        await userAction.save("actionStatus", true);
        const challengeUpdate = await getObject(
          "challenges",
          "challengerActionId",
          userAction
        );
        await challengeUpdate.save("isAccepted", true);
      }
    }
  } catch (error) {
    console.error(error);
  }
});

Moralis.Cloud.afterSave("contractVoteSubmit", async (request) => {
  const confirmed = request.object.get("confirmed");
  const actionId = request.object.get("action_id");
  logger.info(`contractVoteSubmit: ${confirmed} ${actionId}`);

  try {
    if (confirmed) {
      const userAction = await getObject("user_actions", "objectId", actionId);
      if (!userAction.attributes.actionStatus) {
        await userAction.save("actionStatus", true);
        const voteUpdate = await getObject("votes", "actionId", userAction);
        await voteUpdate.save("confirmedOnChain", true);
      }
    }
  } catch (error) {
    console.error(error);
  }
});

Moralis.Cloud.afterSave("tokenApprovals", async (request) => {
  const confirmed = request.object.get("confirmed");
  const owner = request.object.get("owner");
  const amount = request.object.get("value");
  try {
    if (confirmed) {
      const user = await getObject("_User", "ethAddress", owner);
      const currentAmount = user.attributes.approvedSTVAmount;
      if (!user.attributes.hasApprovedSVT) {
        await user.save("hasApprovedSVT", true);
      }
      await user.save(
        "approvedSTVAmount",
        Number(currentAmount) + Number(amount)
      );
    }
  } catch (error) {
    console.error(error);
  }
});

Moralis.Cloud.define(
  "getUser",
  async (request) => {
    const value = request.params.value;
    const method = request.params.method;
    const includeEthAddress = request.params.includeEthAddress;
    let ethAddress = null;
    try {
      const user = await getAllObjects("_User", method, value);
      if (user.length > 0) {
        if (includeEthAddress) {
          ethAddress = user[0].get("ethAddress");
        }
        const result = await getAllObjects("users", "userAccount", user[0]);
        if (result && result.length > 0) {
          return {
            user: result[0],
            ethAddress: ethAddress,
            success: true,
          };
        }
      }
      return null;
    } catch (error) {
      logger.info(error);
      return null;
    }
  },
  {
    fields: {
      value: {
        required: true,
        type: String,
        options: (val) => {
          return val.length > 3;
        },
        error: "Value must be more than 3 characters",
      },
      method: {
        required: true,
        type: String,
        options: (val) => {
          return (
            val === "username" || val === "ethAddress" || val === "objectId"
          );
        },
        error: "Username must be more than 3 characters",
      },
      includeEthAddress: {
        required: true,
        type: Boolean,
      },
    },
  }
);

Moralis.Cloud.afterSave("contractTeamMembershipSent", async (request) => {
  const confirmed = request.object.get("confirmed");
  const actionId = request.object.get("action_id");
  logger.info(`contractTeamMembershipSent: ${confirmed} ${actionId}`);

  try {
    if (confirmed) {
      const userAction = await getObject("user_actions", "objectId", actionId);
      if (!userAction.attributes.actionStatus) {
        await userAction.save("actionStatus", true);
        const result = await getObject(
          "db_TeamMembershipRequests",
          "sentActionId",
          userAction
        );
        await result.save("sentOnChain", true);
      }
    }
  } catch (error) {
    console.error(error);
  }
});

Moralis.Cloud.afterSave("contractTeamMembershipAccept", async (request) => {
  const confirmed = request.object.get("confirmed");
  const actionId = request.object.get("action_id");
  logger.info(`contractTeamMembershipAccept: ${confirmed} ${actionId}`);

  try {
    if (confirmed) {
      const userAction = await getObject("user_actions", "objectId", actionId);
      if (!userAction.attributes.actionStatus) {
        await userAction.save("actionStatus", true);
        const result = await getObject(
          "db_TeamMembershipRequests",
          "acceptActionId",
          userAction
        );
        await result.save("acceptOnChain", true);
      }
    }
  } catch (error) {
    console.error(error);
  }
});
