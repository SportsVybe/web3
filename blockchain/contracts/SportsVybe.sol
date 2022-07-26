// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

/*
@Description: SportsVybe 
Main contract for the SportsVybe platform.
*/

//TODO: use chainlink VRF for unique Identifier -> challenge_id, team_id

// ----- Contract errors -------- //
error NotFound(string);
error MissingActionId();
error Unauthorized(uint256);

// ----- Team errors -------- //
error TeamMembershipRequestNotFound(uint256, address);
error TeamMembershipRequestUnauthorized(uint256, address);
error TeamMemberDuplicate(address);
error TeamUnauthorized(uint256);
error TeamInvalid(uint256);

// ----- Challenge errors -------- //
error ChallengePoolInsufficientAmount(uint256, uint256);
error ChallengePoolTeamImbalance(uint256, uint256);
error ChallengePoolCreationUnauthorized(uint256);
error ChallengePoolAlreadyAccepted(uint256);
error ChallengePoolAlreadyClosed(uint256);
error SenderInsufficientBalance(uint256, uint256);

// ----- Vote errors -------- //
error VoteUnauthorized(uint256, address);
error VoteDuplicate(uint256, address);

contract SportsVybe is Ownable, KeeperCompatibleInterface {
  IERC20 public sportsVybeToken;

  constructor(address payable _sportsVybeToken) {
    sportsVybeToken = IERC20(_sportsVybeToken);
    console.log("\n//-------- Deployed SportsVybe Contract --------//");
  }

  // ----- Team structs -------- //
  struct TeamMate {
    address user;
  }

  // ----- Challenge structs -------- //
  struct ChallengeVote {
    uint256 challenge_id;
  }

  struct ChallengePool {
    string action_id;
    uint256 team1;
    uint256 team2;
    uint256 amount;
    bool isAccepted;
    bool isClosed;
    bool isCompleted;
    uint256 createdAt;
    uint256 interval;
    uint256 team1_count;
    uint256 team2_count;
    address[] team_1_members;
    address[] team_2_members;
  }

  // ----- Team events -------- //
  event TeamCreated(string action_id, uint256 team_id);
  event TeamMembershipRequestAccept(
    string action_id,
    uint256 team_id,
    address user
  );
  event TeamMembershipRequestSent(
    string action_id,
    uint256 team_id,
    address requested,
    address requester
  );

  // ----- Challenge events -------- //
  event ChallengePoolCreated(
    string action_id,
    uint256 challenge_id,
    uint256 amount,
    uint256 team_id,
    uint256 challenged_team_id
  );

  event ChallengePoolAccepted(
    string action_id,
    uint256 challenge_id,
    uint256 team1,
    uint256 team2
  );

  event ChallengePoolClosed(uint256 challenge_id);

  // ----- Vote events -------- //
  event VoteSubmit(
    string action_id,
    address user,
    uint256 challenge_id,
    uint256 team_id
  );

  event Win(uint256 challenge_id, uint256 team_id);
  event Lose(uint256 challenge_id, uint256 team_id);
  event Tie(uint256 challenge_id, uint256 team1_id, uint256 team2_id);

  // ----- Chainlink variables -------- //
  uint256 upkeepCounter = 0; // deprecated

  // ----- Team variables -------- //
  mapping(uint256 => address[]) public teamMembers; // mapped by team_id
  mapping(address => uint256) public sportsmanship; //mapped by msg.sender
  mapping(uint256 => TeamMate[]) public team_membership_request; // mapped by team_id
  mapping(uint256 => address payable) public team_owner; // mapped by team_id
  mapping(uint256 => uint256) private team_sportsmanship; // mapped by team_id
  mapping(uint256 => uint256) private teamCount; // mapped by team_id

  // new counter openzepplin
  using Counters for Counters.Counter;
  Counters.Counter public team_id_counter;
  // TODO: use chainlink VRF for unique Identifier -> team_id

  // ----- Challenge variables -------- //
  mapping(uint256 => ChallengePool) public challengePools; // mapped by challenge_id
  mapping(uint256 => address[]) private challengePoolTeamMembers; // mapped by challenge_id
  uint256[] public pending_challenge_pool_ids; // deprecated

  Counters.Counter public challenge_id_counter;
  // TODO: use chainlink VRF for unique Identifier -> challenge_id

  // ----- Vote variables -------- //
  mapping(address => ChallengeVote[]) public votes;

  // ----- Team functions -------- //
  function createTeam(string memory action_id)
    external
    newSportsmanship
    hasActionId(action_id)
    returns (uint256)
  {
    uint256 new_team_id = team_id_counter.current();

    team_owner[new_team_id] = payable(msg.sender);

    teamCount[new_team_id] = 1;

    team_sportsmanship[new_team_id] = 100;

    teamMembers[new_team_id].push(msg.sender);

    emit TeamCreated(action_id, new_team_id);

    //increment the team id
    team_id_counter.increment();
    return new_team_id;
  }

  function sendTeamMembershipRequest(
    string memory action_id,
    uint256 team_id,
    address user
  )
    external
    newSportsmanship
    teamOwner(team_id)
    hasActionId(action_id)
    returns (bool)
  {
    // TODO: revert sending an invite to self
    if (msg.sender == user) {
      revert("Cannot send an invite to yourself");
    }
    team_membership_request[team_id].push(TeamMate(user));
    emit TeamMembershipRequestSent(action_id, team_id, user, msg.sender);
    return true;
  }

  function acceptTeamMembershipRequest(string memory action_id, uint256 team_id)
    public
    newSportsmanship
    hasActionId(action_id)
    returns (bool)
  {
    // TODO: revert accepting an invite to self
    if (msg.sender == team_owner[team_id]) {
      revert("Cannot accept an invite to yourself");
    }

    uint256 found = 0;
    for (uint256 i = 0; i < team_membership_request[team_id].length; i++) {
      if (team_membership_request[team_id][i].user == msg.sender) {
        found = 1;
        break;
      }
    }

    if (found == 0) {
      revert TeamMembershipRequestNotFound(team_id, msg.sender);
    }

    teamMembers[team_id].push(msg.sender);
    teamCount[team_id] = teamCount[team_id] + 1;
    team_sportsmanship[team_id] = team_sportsmanship[team_id] + 100;

    emit TeamMembershipRequestAccept(action_id, team_id, msg.sender);
    return true;
  }

  function getTeamMates(uint256 team_id)
    public
    view
    returns (address[] memory)
  {
    return teamMembers[team_id];
  }

  function getTeamCount(uint256 team_id) external view returns (uint256) {
    return teamCount[team_id];
  }

  // ----- Challenge functions -------- //
  function createChallengePool(
    string memory action_id,
    uint256 team_id,
    uint256 challenged_team_id,
    uint256 amount
  )
    external
    payable
    newSportsmanship
    teamOwner(team_id)
    notTeamOwner(challenged_team_id)
    hasActionId(action_id)
    returns (uint256)
  {
    // TODO: remove interval and upkeep
    uint256 _interval = 5;
    uint256 new_challenge_id = 900 + challenge_id_counter.current();
    if (compareStrings(action_id, "log")) {
      console.log(
        "C - createChallengePool: new_challenge_id: %d, creator_id: %d, challenger_id: %d",
        new_challenge_id,
        team_id,
        challenged_team_id
      );
    }
    if (amount == 0) {
      revert ChallengePoolInsufficientAmount(0, amount);
    }

    // TODO: Ensure that team cannot compete with a team that has a player on both teams.
    uint256 senderBalance = sportsVybeToken.balanceOf(msg.sender);

    //Ensure that team owner has funds to create challenge
    if (amount > senderBalance) {
      revert SenderInsufficientBalance(senderBalance, amount);
    }

    //move funds to smart contract
    sportsVybeToken.transferFrom(msg.sender, address(this), amount);

    address[] memory _team_1_members = teamMembers[team_id];

    // create challenge pool
    challengePools[new_challenge_id] = ChallengePool(
      action_id,
      team_id,
      challenged_team_id,
      amount,
      false,
      false,
      false,
      block.timestamp,
      _interval,
      0,
      0,
      _team_1_members,
      new address[](0)
    );

    pending_challenge_pool_ids.push(new_challenge_id);

    // complete: Add the members of the team to challenge pool
    for (uint256 i = 0; i < teamMembers[team_id].length; i++) {
      challengePoolTeamMembers[new_challenge_id].push(teamMembers[team_id][i]);
    }

    // increment challenge_id_counter
    challenge_id_counter.increment();

    emit ChallengePoolCreated(
      action_id,
      new_challenge_id,
      amount,
      team_id,
      challenged_team_id
    );
    return new_challenge_id;
  }

  function acceptChallengePool(
    string memory action_id,
    uint256 challenge_id,
    uint256 team_id,
    uint256 amount
  ) external payable teamOwner(team_id) hasActionId(action_id) returns (bool) {
    //if challenge is already accepted then reject
    if (challengePools[challenge_id].isAccepted) {
      revert ChallengePoolAlreadyAccepted(challenge_id);
    }

    if (compareStrings(action_id, "log")) {
      console.log(
        "C - acceptChallenge_id: %d, creator_id: %d, challenger_id: %d",
        challenge_id,
        challengePools[challenge_id].team1,
        challengePools[challenge_id].team2
      );
    }

    //Ensure that team id has been challenged to participate in the challenge pool
    if (challengePools[challenge_id].team2 != team_id) {
      revert TeamUnauthorized(team_id);
    }

    //Ensure the team owner has the required amount for participation
    uint256 challenge_amount = challengePools[challenge_id].amount;

    if (amount != challenge_amount) {
      revert ChallengePoolInsufficientAmount(challenge_id, challenge_amount);
    }

    uint256 team_1_id = challengePools[challenge_id].team1;

    address[] memory team_1_members = challengePools[challenge_id]
      .team_1_members;
    address[] memory team_2_members = teamMembers[team_id];

    //Ensure that team cannot accept challenge with more or less players than in challengePool
    uint256 team_1_count = team_1_members.length;
    uint256 team_2_count = team_2_members.length;

    if (team_1_count != team_2_count) {
      revert ChallengePoolTeamImbalance(team_1_count, team_2_count);
    }

    //Ensure that team cannot accept challenge with a team that has a player on both teams.
    for (uint256 i = 0; i < team_1_members.length; i++) {
      for (uint256 j = 0; j < team_2_members.length; j++) {
        if (team_1_members[i] == team_2_members[j]) {
          revert TeamMemberDuplicate(team_1_members[i]);
        }
      }
    }

    //Receive SVT token of the challenge
    sportsVybeToken.transfer(address(this), amount);

    challengePools[challenge_id].amount += amount;

    challengePools[challenge_id].isAccepted = true;

    challengePools[challenge_id].team_2_members = team_2_members;

    // Add team members to the challenge pool team members
    for (uint256 i = 0; i < teamMembers[team_id].length; i++) {
      challengePoolTeamMembers[challenge_id].push(teamMembers[team_id][i]);
    }

    //emit event created
    emit ChallengePoolAccepted(action_id, challenge_id, team_1_id, team_id);

    return true;
  }

  //TODO: decline challenge no consequence to the team

  function declineChallenge(uint256 challenge_id, uint256 team_id)
    external
    teamOwner(team_id)
    returns (bool)
  {
    challengePools[challenge_id].isAccepted = false;
    closeChallenge(challenge_id);
    return true;
  }

  // TODO: cancel challenge - if cancel after interval, then no POS reduction
  // TODO: cancel challenge - if cancel before interval, then POS reduction
  // TODO: cancel challenge --- reduce sportsmanship if within 48 hrs of challenge creation

  function closeChallenge(uint256 challenge_id) internal {
    ChallengePool memory _challenge_pool = challengePools[challenge_id];

    //close the challenge
    _challenge_pool.isClosed = true;

    //team owner
    address _owner = team_owner[_challenge_pool.team1];

    //move ether back to the challenge pool creator
    sportsVybeToken.transfer(_owner, _challenge_pool.amount);

    emit ChallengePoolClosed(challenge_id);
  }

  function getChallengePoolTeamMembers(uint256 challenge_id)
    public
    view
    returns (address[] memory)
  {
    return challengePoolTeamMembers[challenge_id];
  }

  function getChallengePoolTeam1Members(uint256 challenge_id)
    public
    view
    returns (address[] memory)
  {
    return challengePools[challenge_id].team_1_members;
  }

  function getChallengePoolTeam2Members(uint256 challenge_id)
    public
    view
    returns (address[] memory)
  {
    return challengePools[challenge_id].team_2_members;
  }

  function totalChallengePoolVotes(uint256 challenge_id)
    private
    view
    returns (uint256)
  {
    return
      challengePools[challenge_id].team1_count +
      challengePools[challenge_id].team2_count;
  }

  function challengePoolTeamMemberCount(uint256 challenge_id)
    private
    view
    returns (uint256)
  {
    return challengePoolTeamMembers[challenge_id].length;
  }

  // ----- Vote functions -------- //
  function submitVote(
    string memory action_id,
    uint256 challenge_id,
    uint256 team_id
  ) public hasActionId(action_id) {
    // complete: Close vote when challenge is closed
    if (challengePools[challenge_id].isClosed) {
      revert ChallengePoolAlreadyClosed(challenge_id);
    }

    // check if voter is on a team
    if (!authorizedToVote(challenge_id)) {
      revert VoteUnauthorized(challenge_id, msg.sender);
    }

    //revert, Already voted!
    if (isVoteDuplicate(challenge_id)) {
      revert VoteDuplicate(challenge_id, msg.sender);
    }
    if (compareStrings(action_id, "log")) {
      console.log("team1_count %d", challengePools[challenge_id].team1_count);
      console.log("team2_count %d", challengePools[challenge_id].team2_count);
    }
    //increase vote count for team ID
    if (challengePools[challenge_id].team1 == team_id) {
      challengePools[challenge_id].team1_count += 1;
    } else if (challengePools[challenge_id].team2 == team_id) {
      challengePools[challenge_id].team2_count += 1;
    } else {
      revert TeamInvalid(team_id);
    }

    // add votes to ChallengeVote[]
    votes[msg.sender].push(ChallengeVote(challenge_id));

    emit VoteSubmit(action_id, msg.sender, challenge_id, team_id);

    // if
    if (
      totalChallengePoolVotes(challenge_id) ==
      challengePoolTeamMemberCount(challenge_id)
    ) {
      challengePools[challenge_id].isClosed = true;
      emit ChallengePoolClosed(challenge_id);
      //=======check if it's due to give out reward========
      checkForWinner(challenge_id);
    }
  }

  function checkForWinner(uint256 challenge_id) private returns (uint256) {
    if (
      challengePools[challenge_id].isCompleted ||
      !challengePools[challenge_id].isAccepted ||
      totalChallengePoolVotes(challenge_id) !=
      challengePoolTeamMemberCount(challenge_id)
    ) {
      revert Unauthorized(challenge_id);
    }

    uint256 winner = 0;
    uint256 loser = 0;
    uint256 team1 = challengePools[challenge_id].team1;
    uint256 team2 = challengePools[challenge_id].team2;
    bool logMe = false;

    if (logMe) {
      console.log("Here");
    }

    if (
      challengePools[challenge_id].team1_count ==
      challengePools[challenge_id].team2_count
    ) {
      // tie reduce sportsmanship of both teams
      handleSportsmanship("tie", team1);
      handleSportsmanship("tie", team2);

      //Give back the challenge reward to team owner divided by sportsmanship % of the team

      emit Tie(challenge_id, team1, team2);

      if (
        !challengePools[challenge_id].isCompleted ||
        !challengePools[challenge_id].isClosed
      ) {
        // TODO: create reward workflow
      }
    } else if (
      challengePools[challenge_id].team1_count >
      challengePools[challenge_id].team2_count
    ) {
      winner = team1;
      loser = team2;
    } else {
      winner = team2;
      loser = team1;
    }

    //move ether back to the challenge pool creator
    if (winner != 0) {
      handleSportsmanship("win", winner);
      handleSportsmanship("lose", loser);
      emit Lose(challenge_id, loser);
      if (
        !challengePools[challenge_id].isCompleted ||
        !challengePools[challenge_id].isClosed
      ) {
        // TODO: create reward workflow

        challengePools[challenge_id].isCompleted = true;
        emit Win(challenge_id, winner);
      }
    }

    return challenge_id;
  }

  function authorizedToVote(uint256 challenge_id) internal view returns (bool) {
    for (
      uint256 i = 0;
      i < challengePoolTeamMembers[challenge_id].length;
      i++
    ) {
      if (challengePoolTeamMembers[challenge_id][i] == msg.sender) return true;
    }
    return false;
  }

  function isVoteDuplicate(uint256 challenge_id) private view returns (bool) {
    ChallengeVote[] memory _address_votes = votes[msg.sender];
    bool isDup = false;
    if (_address_votes.length > 0) {
      for (uint256 i = 0; i < _address_votes.length; i++) {
        //lookup for the challenge
        if (_address_votes[i].challenge_id == challenge_id) {
          isDup = true;
        }
      }
    }
    return isDup;
  }

  // ----- Token functions -------- //

  function getSVTBalance() public view returns (uint256) {
    return sportsVybeToken.balanceOf(msg.sender);
  }

  function getSVTAllowance() public view returns (uint256) {
    return sportsVybeToken.allowance(msg.sender, address(this));
  }

  // ----- Helper functions -------- //
  function compareStrings(string memory a, string memory b)
    private
    pure
    returns (bool)
  {
    return (keccak256(abi.encodePacked((a))) ==
      keccak256(abi.encodePacked((b))));
  }

  // ----- Reward functions -------- //
  function createReward(uint256 challenge_id) private {}

  function claimReward(uint256 challenge_id) public payable {
    // address payable team_1_owner = team_owner[team1];
    // address payable team_2_owner = team_owner[team2];
    // sportsVybeToken.transferFrom(
    //   address(this),
    //   team_1_owner,
    //   challengePools[challenge_id].amount / 2
    // );
    // sportsVybeToken.transferFrom(
    //   address(this),
    //   team_2_owner,
    //   challengePools[challenge_id].amount / 2
    // );
    //  payable(team_1_owner).transfer(challengePools[challenge_id].amount);
    //  payable(team_2_owner).transfer(challengePools[challenge_id].amount);
    // address payable winner_team_owner = team_owner[winner];
    // sportsVybeToken.transferFrom(
    //     address(this),
    //     winner_team_owner,
    //     challengePools[challenge_id].amount
    // );
    // payable(winner_team_owner).transfer(
    //   challengePools[challenge_id].amount
    // );
  }

  // ----- POS functions -------- //
  function handleSportsmanship(string memory reason, uint256 team_id) private {
    /* Cases for sportmanship changes
            1. Did not show up for a challege (team_sportsmanship -= 5)
            2. Tie Votes (team_sportsmanship -= 1)
            3. Won a challenge (team_sportsmanship += 0.50)
            4. Lost a challenge (team_sportsmanship += 0.25)
        */

    // TODO: limit sportsmanship to 100

    if (compareStrings(reason, "tie")) {
      team_sportsmanship[team_id] -= 3;
    } else if (compareStrings(reason, "win")) {
      team_sportsmanship[team_id] += 2;
    } else if (compareStrings(reason, "lose")) {
      team_sportsmanship[team_id] += 1;
    } else if (compareStrings(reason, "cancel")) {
      team_sportsmanship[team_id] -= 5;
    } else {
      revert NotFound(reason);
    }
    // TODO: emit reason, challenge_id, team_id, team_sportsmanship[team_id]
  }

  function getTeamSportsmanship(uint256 _team_id)
    external
    view
    returns (uint256)
  {
    /*
    @description: return team's sportmanship based on the members of the team, hence; teams_sportsmanship = total players sportmanship / total number of players 
    @params: id -The team's ID
    @returns: uint
    */
    return team_sportsmanship[_team_id] / teamCount[_team_id];
  }

  // ----- Chainlink functions -------- //
  function checkUpkeep(
    bytes calldata /* checkData */
  )
    external
    view
    override
    returns (bool upkeepNeeded, bytes memory performData)
  {
    //TODO: Only check open challenge pool
    for (uint256 i = 0; i < pending_challenge_pool_ids.length; i++) {
      upkeepNeeded =
        challengePools[pending_challenge_pool_ids[i]].createdAt +
          challengePools[pending_challenge_pool_ids[i]].interval >
        block.timestamp;
      performData = abi.encode(i);
    }
    //upkeepNeeded = (block.timestamp - lastTimeStamp) > interval;

    // We don't use the checkData in this example. The checkData is defined when the Upkeep was registered.
  }

  function performUpkeep(bytes calldata performData) external override {
    //We highly recommend revalidating the upkeep in the performUpkeep function
    uint256 _id = abi.decode(performData, (uint256));
    if (
      challengePools[_id].createdAt + challengePools[_id].interval >
      block.timestamp
    ) {
      upkeepCounter = upkeepCounter + 1;
      closeChallenge(_id);
    }
    // We don't use the performData in this example. The performData is generated by the Keeper's call to your checkUpkeep function
  }

  // ----- Modifiers -------- //

  // newSportsmanship: set the POS score of a team
  modifier newSportsmanship() {
    if (sportsmanship[msg.sender] == 0) {
      sportsmanship[msg.sender] = 100;
    }
    _;
  }

  // notTeamOwner modifier: Ensure that a team cannot compete with itself.
  modifier notTeamOwner(uint256 team_id) {
    if (team_owner[team_id] == msg.sender) {
      revert ChallengePoolCreationUnauthorized(team_id);
    }
    _;
  }
  // teamOwner modifier: Ensure the team owner is the sender.
  modifier teamOwner(uint256 team_id) {
    if (team_owner[team_id] != msg.sender) {
      revert TeamUnauthorized(team_id);
    }
    _;
  }

  // hasActionId: Ensure that the action ID is valid and not empty
  modifier hasActionId(string memory action_id) {
    require(!compareStrings(action_id, ""), "Action ID cannot be empty");
    _;
  }
}
