// ----------- Helper Functions ------------ //

const logger = Moralis.Cloud.getLogger();

const getObject = async (schema, field, objectId) => {
  if (!schema || !field || !searchString) return null;
  const query = new Moralis.Query(schema);
  query.equalTo(field, objectId);
  return await query.first({ useMasterKey: true });
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

const getInviteObjects = async (schema, field, searchString) => {
  if (!schema || !field || !searchString) return [];
  const query = new Moralis.Query(schema);
  query.select(
    "id",
    "acceptOnChain",
    "sentOnChain",
    "status",
    "createdAt",
    "sentUser.id",
    "sentUser.username",
    "sentUser.userDisplayName",
    "sentUser.userPhoto",
    "sentUser.userPOS",
    "sentUser.userWins",
    "sentUser.userLosses",
    "acceptUser.id",
    "acceptUser.username",
    "acceptUser.userDisplayName",
    "acceptUser.userPhoto",
    "acceptUser.userPOS",
    "acceptUser.userWins",
    "acceptUser.userLosses",
    "team.id",
    "team.teamName",
    "team.teamPhoto",
    "team.teamPOS",
    "team.teamWins",
    "team.teamLosses",
    "team.teamMembers",
    "team.teamSportsPreferences",
    "team.teamAdmin",
    "team.teamChainId"
  );
  query.equalTo(field, searchString);
  return await query.find({ useMasterKey: true });
};

const getRewardObjects = async (schema, field, searchString) => {
  if (!schema || !field || !searchString) return [];
  const query = new Moralis.Query(schema);
  query.select(
    "id",
    "action_id",
    "amount",
    "challenge_id",
    "createdAt",
    "confirmed",
    "isClaimed",
    "reward_id",
    "transaction_hash",
    "updatedAt",
    "user",
    "team_id"
  );
  query.equalTo(field, searchString);
  return await query.find({ useMasterKey: true });
};

const getUserAction = async (actionId) => {
  if (!actionId) return null;
  const result = await getAllObjects("user_actions", "objectId", actionId);
  if (result.length === 0) return null;
  return result[0];
};

const getChallengeByActionId = async (challengeId) => {
  if (!challengeId) return null;
  const result = await getAllObjects(
    "challenges",
    "challengerActionId",
    challengeId
  );
  if (result.length === 0) return null;
  return result[0];
};

const getContractActionName = async (contractActionId) => {
  const contractAction = await contractActionId.get("contractAction");
  const getContractAction = await getAllObjects(
    "contractActions",
    "objectId",
    contractAction.id
  );
  return await getContractAction[0].get("actionName");
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
      const challengeUpdate = await getChallengeByActionId(challengeId);
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
      const challengeUpdate = await getChallengeByActionId(challengeId);
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
      const challengeUpdate = await getChallengeByActionId(challengeId);
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
        await result[0].save("status", "accepted");

        // TODO: add user to the teamMembers array
      }
    }
  } catch (error) {
    logger.error(`contractTeamMembershipAccept: Error: ${error}`);
  }
});

// ----------- Cloud Functions ------------ //

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

// getUserInvites:
// requires user to be logged in
// returns { sent: [], accepted: [], pending: [], success: bool, error: string }
Moralis.Cloud.define(
  "getUserInvites",
  async (request) => {
    const user = request.user;
    if (!user) return { fromUser: null, toUser: null, success: false };
    try {
      const userObj = await getAllObjectsData("users", "userAccount", user);

      const fromUser = await getInviteObjects(
        "db_TeamMembershipRequests",
        "sentUser",
        userObj
      );
      const toUser = await getInviteObjects(
        "db_TeamMembershipRequests",
        "acceptUser",
        userObj
      );

      const { sent, pending, accepted } = await formatInvites({
        fromUser,
        toUser,
      });
      // return { fromUser, toUser, success: true };
      return { sent, pending, accepted, success: true, error: null };
    } catch (error) {
      logger.info(`getUserInvites: Error: ${error}`);
      return {
        sent: [],
        accepted: [],
        pending: [],
        success: false,
        error: error,
      };
    }
  },
  { requireUser: true }
);

const formatInvites = async (invites) => {
  const { fromUser, toUser } = invites;
  const sentInvites = fromUser;
  const acceptedInvites = toUser.filter(
    (invite) => invite.get("acceptOnChain") === true
  );
  const pendingInvites = toUser.filter(
    (invite) => invite.get("acceptOnChain") === false
  );
  const formattedInvites = {
    sent: sentInvites,
    accepted: acceptedInvites,
    pending: pendingInvites,
  };
  return formattedInvites;
};

// getUserRewards:
// requires user to be logged in
// returns { available: [], claimed: [], success: bool, error: string }
Moralis.Cloud.define(
  "getUserRewards",
  async (request) => {
    const user = request.user;
    if (!user)
      return {
        available: [],
        claimed: [],
        success: false,
        error: "No user object",
      };
    try {
      const userRewardObjs = await getRewardObjects(
        "contractRewardCreated",
        "user",
        user.get("ethAddress")
      );

      // return userRewardObjs;
      const { available, claimed } = await formatRewards(userRewardObjs);

      return { available, claimed, success: true, error: null };
    } catch (error) {
      logger.info(`getUserRewards: Error: ${error}`);
      return {
        available: [],
        claimed: [],
        success: false,
        error: error,
      };
    }
  },
  { requireUser: true }
);

const formatRewards = async (userRewards) => {
  let available = [];
  let claimed = [];
  if (!userRewards || userRewards.length === 0) return { available, pending };

  available = userRewards.filter((reward) => reward.get("isClaimed") === false);
  claimed = userRewards.filter((reward) => reward.get("isClaimed") === true);

  return { available, claimed };
};

Moralis.Cloud.define(
  "testFunction",
  async (request) => {
    const user = request.user;
    if (!user)
      return {
        available: [],
        claimed: [],
        success: false,
        error: "No user object",
      };
    try {
      const userRewardObjs = await getRewardObjects(
        "contractRewardCreated",
        "user",
        user.get("ethAddress")
      );

      // return userRewardObjs;
      const { available, claimed, challenges } = await formatRewards(
        userRewardObjs
      );

      return { available, claimed, challenges, success: true, error: null };
    } catch (error) {
      logger.info(`getUserRewards: Error: ${error}`);
      return {
        available: [],
        claimed: [],
        success: false,
        error: error,
      };
    }
  },
  { requireUser: true }
);
