const getObject = async (schema, field, objectId) => {
  const query = new Moralis.Query(schema);
  query.equalTo(field, objectId);
  return await query.first();
};

Moralis.Cloud.afterSave("contractTeamCreated", async (request) => {
  const confirmed = request.object.get("confirmed");
  const actionId = request.object.get("action_id");
  const teamId = request.object.get("team_id");

  if (confirmed) {
    const userAction = await getObject("user_actions", "objectId", actionId);
    if (!userAction.attributes.actionStatus) {
      await userAction.save("actionStatus", true);
      const teamUpdate = await getObject("teams", "actionId", userAction);
      await teamUpdate.save("teamChainId", teamId);
    }
  }
});

Moralis.Cloud.afterSave("contractChallengePoolCreated", async (request) => {
  const confirmed = request.object.get("confirmed");
  const actionId = request.object.get("action_id");
  const challengeId = request.object.get("challenge_id");

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
});

Moralis.Cloud.afterSave("contractChallengeAccepted", async (request) => {
  const confirmed = request.object.get("confirmed");
  const actionId = request.object.get("action_id");

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
});

Moralis.Cloud.afterSave("tokenApprovals", async (request) => {
  const confirmed = request.object.get("confirmed");
  const owner = request.object.get("owner");
  const amount = request.object.get("value");

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
});
