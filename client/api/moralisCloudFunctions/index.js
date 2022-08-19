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

const getAllPossibleObjects = async (schema, field, searchString) => {
  if (!schema || !field || !searchString) return [];
  const query = new Moralis.Query(schema);
  query.contains(field, searchString);
  return await query.find();
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

const getTeamObjects = async (
  schema,
  field,
  searchString,
  activeStatus = true
) => {
  if (!schema || !field || !searchString) return [];
  const query = new Moralis.Query(schema);
  query.select(
    "id",
    "teamChainId",
    "teamName",
    "teamUserName",
    "teamDescription",
    "teamPhoto",
    "teamPOS",
    "teamWinnings",
    "teamWins",
    "teamLosses",
    "teamMembers",
    "teamInvitesPending",
    "teamSportsPreferences",
    "teamAdmin",
    "isTeamActive",
    "createdAt",
    "updatedAt",
    "teamOwner.id",
    "teamOwner.username",
    "teamOwner.userDisplayName",
    "teamOwner.userPhoto",
    "teamOwner.userPOS",
    "teamOwner.userWins",
    "teamOwner.userLosses",
    "teamMembersList.id",
    "teamMembersList.username",
    "teamMembersList.userDisplayName",
    "teamMembersList.userPhoto",
    "teamMembersList.userPOS",
    "teamMembersList.userWins",
    "teamMembersList.userLosses"
  );
  if (field === "teamOwner") {
    query.equalTo(field, searchString);
  } else {
    query.contains(field, searchString);
  }
  if (activeStatus !== "all") {
    query.equalTo("isTeamActive", activeStatus);
  }
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
    "claimConfirmed",
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

const getChallengeByActionId = async (challengerActionId) => {
  if (!challengerActionId) return null;
  const result = await getAllObjects(
    "challenges",
    "challengerActionId",
    challengerActionId
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

const getChallengeObjects = async (
  schema,
  field,
  searchString,
  status = null
) => {
  if (!schema || !field || !searchString) return [];
  const query = new Moralis.Query(schema);
  query.select(
    "id",
    "createdAt",
    "updatedAt",
    "challengeChainId",
    "isClosed",
    "isCompleted",
    "isAcceptedOnChain",
    "challengeMessage",
    "challengeSport",
    "challengeAmount",
    "actionId",
    "submittedVotes",
    "confirmedVotes",
    "challengerActionId",
    "challengeTeam1_chainId",
    "challengeTeam2_chainId",
    "challengeTeam1Admin",
    "challengeTeam2Admin",
    "challengeTeam1Count",
    "challengeTeam2Count",
    "challengeEvent.id",
    "challengeEvent.status",
    "challengeEvent.eventName",
    "challengeEvent.eventDate",
    "challengeTeam1TeamMembers",
    "challengeTeam2TeamMembers",
    "challengeTeam1.teamChainId",
    "challengeTeam1.teamName",
    "challengeTeam1.teamUserName",
    "challengeTeam1.teamDescription",
    "challengeTeam1.teamPhoto",
    "challengeTeam1.teamPOS",
    "challengeTeam1.teamWinnings",
    "challengeTeam1.teamWins",
    "challengeTeam1.teamLosses",
    "challengeTeam1.teamMembers",
    "challengeTeam1.teamInvitesPending",
    "challengeTeam1.teamSportsPreferences",
    "challengeTeam1.teamAdmin",
    "challengeTeam1.isTeamActive",
    "challengeTeam1.teamOwner.id",
    "challengeTeam1.teamOwner.username",
    "challengeTeam1.teamOwner.userDisplayName",
    "challengeTeam1.teamOwner.userPhoto",
    "challengeTeam1.teamOwner.userPOS",
    "challengeTeam1.teamOwner.userWins",
    "challengeTeam1.teamOwner.userLosses",
    "challengeTeam1.teamMembersList.id",
    "challengeTeam1.teamMembersList.username",
    "challengeTeam1.teamMembersList.userDisplayName",
    "challengeTeam1.teamMembersList.userPhoto",
    "challengeTeam1.teamMembersList.userPOS",
    "challengeTeam1.teamMembersList.userWins",
    "challengeTeam1.teamMembersList.userLosses",
    "challengeTeam2.teamChainId",
    "challengeTeam2.teamName",
    "challengeTeam2.teamUserName",
    "challengeTeam2.teamDescription",
    "challengeTeam2.teamPhoto",
    "challengeTeam2.teamPOS",
    "challengeTeam2.teamWinnings",
    "challengeTeam2.teamWins",
    "challengeTeam2.teamLosses",
    "challengeTeam2.teamMembers",
    "challengeTeam2.teamInvitesPending",
    "challengeTeam2.teamSportsPreferences",
    "challengeTeam2.teamAdmin",
    "challengeTeam2.isTeamActive",
    "challengeTeam2.teamOwner.id",
    "challengeTeam2.teamOwner.username",
    "challengeTeam2.teamOwner.userDisplayName",
    "challengeTeam2.teamOwner.userPhoto",
    "challengeTeam2.teamOwner.userPOS",
    "challengeTeam2.teamOwner.userWins",
    "challengeTeam2.teamOwner.userLosses",
    "challengeTeam2.teamMembersList.id",
    "challengeTeam2.teamMembersList.username",
    "challengeTeam2.teamMembersList.userDisplayName",
    "challengeTeam2.teamMembersList.userPhoto",
    "challengeTeam2.teamMembersList.userPOS",
    "challengeTeam2.teamMembersList.userWins",
    "challengeTeam2.teamMembersList.userLosses"
  );

  if (status === "admin") {
    query.equalTo(field, searchString);
  } else {
    query.contains(field, searchString);
  }

  return await query.find({ useMasterKey: true });
};

// ----------- SVT Contract Functions ------------ //

Moralis.Cloud.afterSave("tokenApprovals", async (request) => {
  const confirmed = request.object.get("confirmed");
  const owner = request.object.get("owner");
  const amount = request.object.get("value");
  try {
    if (confirmed) {
      const user = await getAllObjects("_User", "ethAddress", owner);
      const currentAmount = user[0].get("approvedSTVAmount");
      const newAmount = Number(currentAmount) + Number(amount);
      logger.info(
        `tokenApprovals: ${owner}: ${currentAmount} + ${amount} = ${newAmount}`
      );
      if (!user[0].get("hasApprovedSVT")) {
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
        const challengeAmount = await challengeUpdate[0].get("challengeAmount");
        await challengeUpdate[0].save(
          "challengeAmount",
          String(Number(challengeAmount) * 2)
        );
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
      const challengeUpdate = await getAllObjectsData(
        "challenges",
        "challengeChainId",
        challengeId
      );
      const isAccepted = await challengeUpdate.get("isAcceptedOnChain");
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
  const challengeId = request.object.get("challenge_id");
  const teamId = request.object.get("team_id");
  logger.info(
    `contractVoteSubmit: ${confirmed} ${actionId} ${challengeId} ${teamId}`
  );

  try {
    if (confirmed) {
      const userAction = await getUserAction(actionId);
      const actionStatus = await userAction.get("actionStatus");
      if (!actionStatus) {
        await userAction.save("actionStatus", true);
        const voteUpdate = await getAllObjects("votes", "actionId", userAction);
        await voteUpdate[0].save("confirmedOnChain", true);
        const challengeUpdate = await getAllObjects(
          "challenges",
          "challengeChainId",
          challengeId
        );
        const voter = await voteUpdate[0].get("voter");
        const confirmedVotes =
          (await challengeUpdate[0].get("confirmedVotes")) || [];
        await challengeUpdate[0].save("confirmedVotes", [
          await voter.get("username"),
          ...confirmedVotes,
        ]);
        logger.info(
          `contractVoteSubmit: ${confirmed} ${actionId} ${challengeId} ${voter.get(
            "username"
          )}`
        );
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
  logger.info(
    `contractChallengeWins: Received ${confirmed} ${teamId} ${challengeId}`
  );
  try {
    if (confirmed) {
      const challengeUpdate = await getAllObjectsData(
        "challenges",
        "challengeChainId",
        challengeId
      );
      const isAccepted = await challengeUpdate.get("isAcceptedOnChain");
      if (isAccepted) {
        await challengeUpdate.save("challengeWinnerTeamId", teamId);
        await challengeUpdate.save("isCompleted", true);
      }
      const teamUpdate = await getAllObjects("teams", "teamChainId", teamId);
      const wins = await teamUpdate[0].get("teamWins");
      await teamUpdate[0].save("teamWins", Number(wins) + 1);
      logger.info(
        `contractChallengeWins: Processed ${confirmed} ${teamId} ${challengeId} ${
          Number(wins) + 1
        }`
      );
    }
  } catch (error) {
    logger.error(`contractChallengeWins: Error: ${error}`);
  }
});

Moralis.Cloud.afterSave("contractChallengeLosses", async (request) => {
  const confirmed = request.object.get("confirmed");
  const teamId = request.object.get("team_id");
  const challengeId = request.object.get("challenge_id");
  logger.info(
    `contractChallengeLosses: Received ${confirmed} ${teamId} ${challengeId}`
  );
  try {
    if (confirmed) {
      const challengeUpdate = await getAllObjectsData(
        "challenges",
        "challengeChainId",
        challengeId
      );
      const isAccepted = await challengeUpdate.get("isAcceptedOnChain");
      if (isAccepted) {
        await challengeUpdate.save("challengeLoserTeamId", teamId);
        await challengeUpdate.save("isCompleted", true);
      }
      const teamUpdate = await getAllObjects("teams", "teamChainId", teamId);
      const losses = await teamUpdate[0].get("teamLosses");
      await teamUpdate[0].save("teamLosses", Number(losses) + 1);
      logger.info(
        `contractChallengeLosses: Processed ${confirmed} ${teamId} ${challengeId} ${
          Number(losses) + 1
        }`
      );
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

Moralis.Cloud.afterSave("contractRewardClaimed", async (request) => {
  const confirmed = request.object.get("confirmed");
  const rewardId = request.object.get("reward_id");
  const claimActionId = request.object.get("claim_action_id");
  logger.info(
    `contractRewardClaimed: confirmed: ${confirmed} reward_id: ${rewardId} claim_id: ${claimActionId}`
  );

  try {
    if (confirmed) {
      const userAction = await getUserAction(claimActionId);
      const actionStatus = await userAction.get("actionStatus");
      if (!actionStatus) {
        await userAction.save("actionStatus", true);
        const result = await getAllObjects(
          "contractRewardCreated",
          "reward_id",
          rewardId
        );
        await result[0].save("claimConfirmed", true);
        logger.info(
          `contractRewardClaimed: Processed reward_id: ${rewardId} claim_id: ${claimActionId}`
        );
      }
    }
  } catch (error) {
    logger.error(`contractRewardClaimed: Error: ${error}`);
  }
});

// ----------- Cloud Functions ------------ //

// getUser: returns {user: object, success: bool, ethAddress: string | null}
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
        error: error.toString(),
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
        error: error.toString(),
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

// getUserTeams:
// requires user to be logged in
// returns { teamOwnerTeams: [], teamMemberTeams: [], success: bool, error: string }
Moralis.Cloud.define(
  "getUserTeams",
  async (request) => {
    const user = request.user;
    if (!user)
      return {
        teamOwnerTeams: [],
        teamMemberTeams: [],
        success: false,
        error: "No user object",
      };
    try {
      const teamOwnerObjs = await getTeamObjects(
        "teams",
        "teamOwner",
        user,
        "all"
      );

      const teamOwnerActiveObjs = await getTeamObjects(
        "teams",
        "teamOwner",
        user,
        true
      );

      const teamMemberObjs = await getTeamObjects(
        "teams",
        "teamMembers",
        user.get("username")
      );

      // return userRewardObjs;
      const teamOwnerTeams = teamOwnerObjs;
      const teamOwnerActiveTeams = await formatTeams(
        teamOwnerObjs,
        user,
        "active"
      );
      const teamMemberTeams = await formatTeams(
        teamMemberObjs,
        user,
        "notOwner"
      );

      return {
        teamOwnerTeams,
        teamOwnerActiveTeams,
        teamMemberTeams,
        success: true,
        error: null,
      };
    } catch (error) {
      logger.info(`getUserTeams: Error: ${error}`);
      return {
        teamOwnerTeams: [],
        teamMemberTeams: [],
        success: false,
        error: error.toString(),
      };
    }
  },
  { requireUser: true }
);

const formatTeams = async (teams, user, format) => {
  let formattedTeams = [];
  if (!teams || teams.length === 0) return formattedTeams;
  if (format === "active") {
    formattedTeams = teams.filter((team) => team.get("isTeamActive") === true);
  } else if (format === "notOwner") {
    formattedTeams = teams.filter(
      (team) => team.get("teamOwner").get("username") !== user.get("username")
    );
  } else {
    formattedTeams = teams;
  }
  return formattedTeams;
};

// getTeamByUsername:
// requires user to be logged in
// returns { team: [], teamMembers: [], success: bool, error: string }
Moralis.Cloud.define(
  "getTeamByUsername",
  async (request) => {
    const objectId = request.params.objectId;
    if (!objectId) {
      return {
        team: [],
        teamMembers: [],
        success: false,
        error: "No team id provided",
      };
    }
    try {
      const teamObjs = await getTeamObjects(
        "teams",
        "objectId",
        objectId,
        true
      );
      const team = teamObjs;
      const teamMembers = [];
      return {
        team,
        teamMembers,
        success: true,
        error: null,
      };
    } catch (error) {
      logger.info(`getTeamByUsername: Error: ${error}`);
      return {
        team: [],
        teamMembers: [],
        success: false,
        error: error.toString(),
      };
    }
  },
  {
    fields: {
      objectId: {
        type: String,
        required: true,
      },
    },
  }
);

// getUserChallenges:
// requires user to be logged in
// returns {  created: [], active: [], complete: [], success: bool, error: string }
Moralis.Cloud.define(
  "getUserChallenges",
  async (request) => {
    const user = request.user;
    if (!user)
      return {
        created: [],
        active: [],
        complete: [],
        pendingVote: [],
        success: false,
        error: "No user object",
      };
    try {
      const adminTeam1Challenges = await getChallengeObjects(
        "challenges",
        "challengeTeam1Admin",
        user.get("username"),
        "admin"
      );

      const team1Challenges = await getChallengeObjects(
        "challenges",
        "challengeTeam1TeamMembers",
        user.get("username"),
        "teamMember"
      );

      const team2Challenges = await getChallengeObjects(
        "challenges",
        "challengeTeam2TeamMembers",
        user.get("username"),
        "teamMember"
      );

      const { created, active, complete, pendingVote } = await formatChallenges(
        adminTeam1Challenges,
        team1Challenges,
        team2Challenges
      );

      return {
        created,
        active,
        complete,
        pendingVote,
        success: true,
        error: null,
      };
    } catch (error) {
      logger.info(`getUserChallenges: Error: ${error}`);
      return {
        created: [],
        active: [],
        complete: [],
        pendingVote: [],
        success: false,
        error: error.toString(),
      };
    }
  },
  { requireUser: true }
);

const formatChallenges = async (
  adminTeam1Challenges,
  team1Challenges,
  team2Challenges
) => {
  let created = [];
  let active = [];
  let pendingVote = [];
  let complete = [];

  created = adminTeam1Challenges;

  const activeTeam1Challenges = team1Challenges.filter(
    (challenge) =>
      challenge.get("isCompleted") === false &&
      challenge.get("isClosed") === false
  );
  const activeTeam2Challenges = team2Challenges.filter(
    (challenge) =>
      challenge.get("isCompleted") === false &&
      challenge.get("isClosed") === false
  );

  const completeTeam1Challenges = team1Challenges.filter(
    (challenge) =>
      challenge.get("isAcceptedOnChain") === true &&
      challenge.get("isClosed") === true
  );
  const completeTeam2Challenges = team2Challenges.filter(
    (challenge) =>
      challenge.get("isAcceptedOnChain") === true &&
      challenge.get("isClosed") === true
  );

  const pendingTeam1Challenges = team1Challenges.filter(
    (challenge) =>
      challenge.get("isCompleted") === false &&
      challenge.get("isAcceptedOnChain") === true &&
      challenge.get("isClosed") === false
  );
  const pendingTeam2Challenges = team2Challenges.filter(
    (challenge) =>
      challenge.get("isCompleted") === false &&
      challenge.get("isAcceptedOnChain") === true &&
      challenge.get("isClosed") === false
  );

  const activeChallenges = [...activeTeam1Challenges, ...activeTeam2Challenges];

  const completeChallenges = [
    ...completeTeam1Challenges,
    ...completeTeam2Challenges,
  ];

  const pendingVoteChallenges = [
    ...pendingTeam1Challenges,
    ...pendingTeam2Challenges,
  ];

  active = activeChallenges;
  complete = completeChallenges;
  pendingVote = pendingVoteChallenges;
  return { created, active, pendingVote, complete };
};
