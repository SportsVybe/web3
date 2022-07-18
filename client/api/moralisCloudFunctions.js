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

const getObject = async (schema, field, objectId) => {
  const query = new Moralis.Query(schema);
  query.equalTo(field, objectId);
  return await query.first();
};
