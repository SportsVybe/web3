// ----------- Helper Functions ------------ //

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

const getAllObjectsData = async (schema, field, searchString) => {
  if (!schema || !field || !searchString) return [];
  const query = new Moralis.Query(schema);
  query.equalTo(field, searchString);
  const result = await query.find({ useMasterKey: true });
  if (result.length === 0) return null;
  return result[0];
};

const getUserAction = async (actionId) => {
  if (!actionId) return null;
  const result = await getAllObjects("user_actions", "objectId", actionId);
  if (result.length === 0) return null;
  return result[0];
};

const getChallenge = async (challengeId) => {
  if (!challengeId) return null;
  const result = await getAllObjects(
    "challenges",
    "challengerActionId",
    challengeId
  );
  if (result.length === 0) return null;
  return result[0];
};

// ----------- SVT Contract Functions ------------ //

Moralis.Cloud.afterSave("tokenApprovals", async (request) => {
  const confirmed = request.object.get("confirmed");
  const owner = request.object.get("owner");
  const amount = request.object.get("value");
  try {
    if (confirmed) {
      const user = await getAllObjects("_User", "ethAddress", owner);
      const currentAmount = user[0].attributes.approvedSTVAmount;
      const newAmount = Number(currentAmount) + Number(amount);
      logger.info(
        `tokenApprovals: ${owner}: ${currentAmount} + ${amount} = ${newAmount}`
      );
      if (!user[0].attributes.hasApprovedSVT) {
        await user[0].save("hasApprovedSVT", true, { useMasterKey: true });
      }
      await user[0].save("approvedSTVAmount", String(newAmount), {
        useMasterKey: true,
      });
    }
  } catch (error) {
    logger.error(`tokenApprovals: Error: ${error}`);
  }
});

// ----------- SportsVybe Contract Functions ------------ //

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
    logger.error(`contractTeamCreated: Error: ${error}`);
  }
});

Moralis.Cloud.afterSave("contractChallengeCreated", async (request) => {
  const confirmed = request.object.get("confirmed");
  const actionId = request.object.get("action_id");
  const challengeId = request.object.get("challenge_id");
  logger.info(
    `contractChallengeCreated: ${confirmed} ${actionId} ${challengeId}`
  );
  try {
    if (confirmed) {
      const userAction = await getUserAction(actionId);
      const actionStatus = await userAction.get("actionStatus");
      if (!actionStatus) {
        await userAction.save("actionStatus", true);
        const challengeUpdate = await getAllObjects(
          "challenges",
          "actionId",
          userAction
        );
        await challengeUpdate[0].save("challengeChainId", challengeId);
      }
    }
  } catch (error) {
    logger.error(`contractChallengeCreated: Error: ${error}`);
  }
});

Moralis.Cloud.afterSave("contractChallengeAccepted", async (request) => {
  const confirmed = request.object.get("confirmed");
  const actionId = request.object.get("action_id");
  logger.info(`contractChallengeAccepted: ${confirmed} ${actionId}`);
  try {
    if (confirmed) {
      const userAction = await getUserAction(actionId);
      const actionStatus = await userAction.get("actionStatus");
      if (!actionStatus) {
        await userAction.save("actionStatus", true);
        const challengeUpdate = await getAllObjects(
          "challenges",
          "challengerActionId",
          userAction
        );
        await challengeUpdate[0].save("isAcceptedOnChain", true);
      }
    }
  } catch (error) {
    logger.error(`contractChallengeAccepted: Error: ${error}`);
  }
});

Moralis.Cloud.afterSave("contractChallengeClosed", async (request) => {
  const confirmed = request.object.get("confirmed");
  const challengeId = request.object.get("challenge_id");
  logger.info(`contractChallengeClosed: ${confirmed} ${challengeId}`);
  try {
    if (confirmed) {
      const challengeUpdate = await getChallenge(challengeId);
      const isAccepted = await challengeUpdate.isAcceptedOnChain;
      if (!isAccepted) {
        await challengeUpdate.save("isClosed", true);
      }
    }
  } catch (error) {
    logger.error(`contractChallengeClosed: Error: ${error}`);
  }
});

Moralis.Cloud.afterSave("contractVoteSubmit", async (request) => {
  const confirmed = request.object.get("confirmed");
  const actionId = request.object.get("action_id");
  logger.info(`contractVoteSubmit: ${confirmed} ${actionId}`);

  try {
    if (confirmed) {
      const userAction = await getUserAction(actionId);
      const actionStatus = await userAction.get("actionStatus");
      if (!actionStatus) {
        await userAction.save("actionStatus", true);
        const voteUpdate = await getAllObjects("votes", "actionId", userAction);
        await voteUpdate[0].save("confirmedOnChain", true);
      }
    }
  } catch (error) {
    logger.error(`contractVoteSubmit: Error: ${error}`);
  }
});

Moralis.Cloud.afterSave("contractChallengeWins", async (request) => {
  const confirmed = request.object.get("confirmed");
  const teamId = request.object.get("team_id");
  const challengeId = request.object.get("challenge_id");
  logger.info(`contractChallengeWins: ${confirmed} ${teamId} ${challengeId}`);
  try {
    if (confirmed) {
      const challengeUpdate = await getChallenge(challengeId);
      const isAccepted = await challengeUpdate.isAcceptedOnChain;
      if (!isAccepted) {
        await challengeUpdate.save("challengeWinnerTeamId", teamId);
        await challengeUpdate.save("isCompleted", true);
      }
    }
  } catch (error) {
    logger.error(`contractChallengeWins: Error: ${error}`);
  }
});

Moralis.Cloud.afterSave("contractChallengeLosses", async (request) => {
  const confirmed = request.object.get("confirmed");
  const teamId = request.object.get("team_id");
  const challengeId = request.object.get("challenge_id");
  logger.info(`contractChallengeLosses: ${confirmed} ${teamId} ${challengeId}`);

  try {
    if (confirmed) {
      const challengeUpdate = await getChallenge(challengeId);
      const isAccepted = await challengeUpdate.isAcceptedOnChain;
      if (!isAccepted) {
        await challengeUpdate.save("challengeLoserTeamId", teamId);
        await challengeUpdate.save("isCompleted", true);
      }
    }
  } catch (error) {
    logger.error(`contractChallengeLosses: Error: ${error}`);
  }
});

Moralis.Cloud.afterSave("contractTeamMembershipSent", async (request) => {
  const confirmed = request.object.get("confirmed");
  const actionId = request.object.get("action_id");
  logger.info(`contractTeamMembershipSent: ${confirmed} ${actionId}`);

  try {
    if (confirmed) {
      const userAction = await getUserAction(actionId);
      const actionStatus = await userAction.get("actionStatus");
      if (!actionStatus) {
        await userAction.save("actionStatus", true);
        const result = await getAllObjects(
          "db_TeamMembershipRequests",
          "sentActionId",
          userAction
        );
        await result[0].save("sentOnChain", true);
      }
    }
  } catch (error) {
    logger.error(`contractTeamMembershipSent: Error: ${error}`);
  }
});

Moralis.Cloud.afterSave("contractTeamMembershipAccept", async (request) => {
  const confirmed = request.object.get("confirmed");
  const actionId = request.object.get("action_id");
  logger.info(`contractTeamMembershipAccept: ${confirmed} ${actionId}`);

  try {
    if (confirmed) {
      const userAction = await getUserAction(actionId);
      const actionStatus = await userAction.get("actionStatus");
      if (!actionStatus) {
        await userAction.save("actionStatus", true);
        const result = await getAllObjects(
          "db_TeamMembershipRequests",
          "acceptActionId",
          userAction
        );
        await result[0].save("acceptOnChain", true);
      }
    }
  } catch (error) {
    logger.error(`contractTeamMembershipAccept: Error: ${error}`);
  }
});

// ----------- Cloud Functions ------------ //

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

// getUser: returns {user: object, success: bool, ethAddress?: string}
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
      logger.info(`getUser: Error: ${error}`);
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
