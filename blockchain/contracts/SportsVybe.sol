// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/*
@Description: SportsVybe 
Main contract for the SportsVybe platform.
*/

// ----- Contract errors -------- //
error NotFound(string);
error MissingActionId();

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
error ChallengePoolUnauthorized(uint256);

// ----- Vote errors -------- //
error VoteUnauthorized(uint256, address);
error VoteDuplicate(uint256, address);

// ----- Reward errors -------- //
error RewardInvalid(string, uint256);
error RewardInsufficientAmount(string, uint256, uint256);
error RewardAlreadyClaimed(string, uint256, uint256);
error RewardsNotFound(address);

contract SportsVybe is Ownable {
  IERC20 public sportsVybeToken;

  constructor(address payable _sportsVybeToken) {
    sportsVybeToken = IERC20(_sportsVybeToken);
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
    uint256 team_1_votes;
    uint256 team_2_votes;
    address[] team_1_members;
    address[] team_2_members;
  }

  // ----- Reward struts -------- //

  struct Reward {
    string action_id;
    uint256 reward_id;
    uint256 challenge_id;
    uint256 team_id;
    uint256 amount;
    bool isClaimed;
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

  // ----- Reward events -------- //
  event RewardCreated(
    string action_id,
    uint256 reward_id,
    uint256 challenge_id,
    uint256 team_id,
    uint256 amount,
    bool isClaimed,
    address user
  );

  event RewardClaimed(
    string claim_action_id,
    string reward_action_id,
    uint256 reward_id,
    uint256 challenge_id,
    uint256 team_id,
    uint256 amount,
    bool isClaimed,
    // uint256 claimed_at,
    address claimed_by
  );

  // ----- Team variables -------- //
  mapping(uint256 => address[]) public teamMembers; // mapped by team_id
  mapping(address => uint256) public sportsmanship; //mapped by msg.sender
  mapping(uint256 => TeamMate[]) public team_membership_request; // mapped by team_id
  mapping(uint256 => address payable) public team_owner; // mapped by team_id
  mapping(uint256 => uint256) private team_sportsmanship; // mapped by team_id
  mapping(uint256 => uint256) private teamCount; // mapped by team_id

  // new counter openzepplin
  using Counters for Counters.Counter;
  Counters.Counter private team_id_counter;
  // TODO: use chainlink VRF for unique Identifier -> team_id

  Counters.Counter private challenge_id_counter;
  // TODO: use chainlink VRF for unique Identifier -> challenge_id

  Counters.Counter private reward_id_counter;
  // TODO: use chainlink VRF for unique Identifier -> reward_id

  // ----- Challenge variables -------- //
  mapping(uint256 => ChallengePool) public challengePools; // mapped by challenge_id
  mapping(uint256 => address[]) private challengePoolTeamMembers; // mapped by challenge_id
  uint256[] public pending_challenge_pool_ids; // deprecated

  // ----- Vote variables -------- //
  mapping(address => ChallengeVote[]) public votes;

  // ----- Reward variables -------- //
  mapping(address => Reward[]) public challengeRewards;

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
    if (msg.sender == user) {
      revert TeamMembershipRequestUnauthorized(team_id, msg.sender);
    }

    uint256 duplicateInvite = 0;
    for (uint256 i = 0; i < team_membership_request[team_id].length; i++) {
      if (team_membership_request[team_id][i].user == user) {
        duplicateInvite = 1;
        break;
      }
    }

    if (duplicateInvite == 1) {
      revert TeamMemberDuplicate(user);
    }

    team_membership_request[team_id].push(TeamMate(user));
    emit TeamMembershipRequestSent(action_id, team_id, user, msg.sender);
    return true;
  }

  function acceptTeamMembershipRequest(string memory action_id, uint256 team_id)
    external
    newSportsmanship
    hasActionId(action_id)
    returns (bool)
  {
    if (msg.sender == team_owner[team_id]) {
      revert TeamMembershipRequestUnauthorized(team_id, msg.sender);
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
    // TODO: remove interval
    uint256 _interval = 5;
    uint256 new_challenge_id = 900 + challenge_id_counter.current();
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

  function getAllChallengePoolTeamMembers(uint256 challenge_id)
    public
    view
    returns (address[] memory)
  {
    return challengePoolTeamMembers[challenge_id];
  }

  function getChallengePoolTeamMembersByTeam(
    uint256 challenge_id,
    uint256 team_id
  ) public view returns (address[] memory) {
    address[] memory members;
    if (team_id == challengePools[challenge_id].team2) {
      members = challengePools[challenge_id].team_2_members;
    }
    if (team_id == challengePools[challenge_id].team1) {
      members = challengePools[challenge_id].team_1_members;
    }
    return members;
  }

  function totalChallengePoolVotes(uint256 challenge_id)
    private
    view
    returns (uint256)
  {
    return
      challengePools[challenge_id].team_1_votes +
      challengePools[challenge_id].team_2_votes;
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
    //increase vote count for team ID
    if (challengePools[challenge_id].team1 == team_id) {
      challengePools[challenge_id].team_1_votes += 1;
    } else if (challengePools[challenge_id].team2 == team_id) {
      challengePools[challenge_id].team_2_votes += 1;
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
      revert ChallengePoolUnauthorized(challenge_id);
    }

    uint256 winner = 0;
    uint256 loser = 0;
    uint256 team1 = challengePools[challenge_id].team1;
    uint256 team2 = challengePools[challenge_id].team2;

    if (
      challengePools[challenge_id].team_1_votes ==
      challengePools[challenge_id].team_2_votes
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
        createReward(challenge_id, team1, team2);
      }
    } else if (
      challengePools[challenge_id].team_1_votes >
      challengePools[challenge_id].team_2_votes
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

        createReward(challenge_id, winner, loser);
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

  // ----- Reward functions -------- //
  function createReward(
    uint256 challenge_id,
    uint256 winner_team_id,
    uint256 loser_team_id
  ) private {
    if (
      !challengePools[challenge_id].isAccepted ||
      challengePools[challenge_id].isCompleted ||
      (totalChallengePoolVotes(challenge_id) !=
        challengePoolTeamMemberCount(challenge_id))
    ) {
      revert ChallengePoolUnauthorized(challenge_id);
    }

    if (
      (winner_team_id != challengePools[challenge_id].team1 ||
        loser_team_id != challengePools[challenge_id].team2) &&
      (loser_team_id != challengePools[challenge_id].team1 ||
        winner_team_id != challengePools[challenge_id].team2)
    ) {
      revert ChallengePoolUnauthorized(challenge_id);
    }

    if (
      challengePools[challenge_id].team_1_votes ==
      challengePools[challenge_id].team_2_votes &&
      (totalChallengePoolVotes(challenge_id) ==
        challengePoolTeamMemberCount(challenge_id))
    ) {
      address team_1_owner = team_owner[winner_team_id];
      address team_2_owner = team_owner[loser_team_id];
      uint256 amount = challengePools[challenge_id].amount / 2;

      // TODO: reward for team owners only since they opened the challenge
      if (challengeRewards[team_1_owner].length == 0) {
        challengeRewards[team_1_owner].push(Reward("0", 0, 0, 0, 0, true));
      }
      challengeRewards[team_1_owner].push(
        Reward(
          challengePools[challenge_id].action_id,
          reward_id_counter.current(),
          challenge_id,
          winner_team_id,
          amount,
          false
        )
      );
      emit RewardCreated(
        challengePools[challenge_id].action_id,
        reward_id_counter.current(),
        challenge_id,
        winner_team_id,
        amount,
        false,
        team_1_owner
      );

      reward_id_counter.increment();
      if (challengeRewards[team_2_owner].length == 0) {
        challengeRewards[team_2_owner].push(Reward("0", 0, 0, 0, 0, true));
      }
      challengeRewards[team_2_owner].push(
        Reward(
          challengePools[challenge_id].action_id,
          reward_id_counter.current(),
          challenge_id,
          loser_team_id,
          amount,
          false
        )
      );

      emit RewardCreated(
        challengePools[challenge_id].action_id,
        reward_id_counter.current(),
        challenge_id,
        loser_team_id,
        amount,
        false,
        team_2_owner
      );

      reward_id_counter.increment();

      // complete challenge
      challengePools[challenge_id].isCompleted = true;
    } else if (
      (challengePools[challenge_id].team_1_votes !=
        challengePools[challenge_id].team_2_votes) &&
      (totalChallengePoolVotes(challenge_id) ==
        challengePoolTeamMemberCount(challenge_id))
    ) {
      address[] memory members = getChallengePoolTeamMembersByTeam(
        challenge_id,
        winner_team_id
      );
      uint256 owner_amount = challengePools[challenge_id].amount / 2;
      uint256 team_amount = owner_amount / members.length;

      // TODO: reward owner first
      address winner_owner = team_owner[winner_team_id];
      if (challengeRewards[winner_owner].length == 0) {
        challengeRewards[winner_owner].push(Reward("0", 0, 0, 0, 0, true));
      }
      challengeRewards[winner_owner].push(
        Reward(
          challengePools[challenge_id].action_id,
          reward_id_counter.current(),
          challenge_id,
          winner_team_id,
          owner_amount,
          false
        )
      );
      emit RewardCreated(
        challengePools[challenge_id].action_id,
        reward_id_counter.current(),
        challenge_id,
        winner_team_id,
        owner_amount,
        false,
        winner_owner
      );
      reward_id_counter.increment();

      // TODO: reward winning teammembers

      for (uint256 i; i < members.length; i++) {
        if (challengeRewards[members[i]].length == 0) {
          challengeRewards[members[i]].push(Reward("0", 0, 0, 0, 0, true));
        }
        challengeRewards[members[i]].push(
          Reward(
            challengePools[challenge_id].action_id,
            reward_id_counter.current(),
            challenge_id,
            winner_team_id,
            owner_amount,
            false
          )
        );
        emit RewardCreated(
          challengePools[challenge_id].action_id,
          reward_id_counter.current(),
          challenge_id,
          winner_team_id,
          team_amount,
          false,
          members[i]
        );
        reward_id_counter.increment();
      }
    }
  }

  function claimReward(
    string memory claim_action_id,
    string memory reward_action_id,
    uint256 reward_id,
    uint256 challenge_id
  )
    public
    payable
    hasRewards(msg.sender)
    hasActionId(claim_action_id)
    returns (bool)
  {
    // TODO: deduct POS fee when claimed

    (Reward storage _userReward, bool isValidReward) = getUserChallengeReward(
      reward_action_id,
      reward_id,
      challenge_id
    );

    if (!isValidReward) {
      revert RewardInvalid(reward_action_id, reward_id);
    }

    if (!compareStrings(_userReward.action_id, reward_action_id))
      revert MissingActionId();
    if (_userReward.amount == 0)
      revert RewardInsufficientAmount(
        reward_action_id,
        reward_id,
        _userReward.amount
      );
    if (_userReward.isClaimed)
      revert RewardAlreadyClaimed(reward_action_id, reward_id, challenge_id);

    if (
      isValidReward &&
      _userReward.amount != 0 &&
      !_userReward.isClaimed &&
      compareStrings(_userReward.action_id, reward_action_id)
    ) {
      sportsVybeToken.approve(address(this), _userReward.amount);

      sportsVybeToken.transferFrom(
        address(this),
        msg.sender,
        _userReward.amount
      );

      _userReward.isClaimed = true;
      // uint256 claimed_at = block.timestamp;

      emit RewardClaimed(
        claim_action_id,
        reward_action_id,
        reward_id,
        challenge_id,
        _userReward.team_id,
        _userReward.amount,
        _userReward.isClaimed,
        msg.sender
      );

      return true;
    } else {
      revert RewardsNotFound(msg.sender);
    }
  }

  function getAllUserChallengeRewards(address user)
    public
    view
    returns (Reward[] memory)
  {
    return challengeRewards[user];
  }

  function getUserChallengeReward(
    string memory reward_action_id,
    uint256 reward_id,
    uint256 challenge_id
  ) private view returns (Reward storage, bool) {
    Reward[] storage _allUserRewards = challengeRewards[msg.sender];
    Reward storage _userReward = _allUserRewards[0];
    bool isValidReward = false;

    for (uint256 i = 1; i < _allUserRewards.length; i++) {
      if (
        compareStrings(_allUserRewards[i].action_id, reward_action_id) &&
        _allUserRewards[i].challenge_id == challenge_id &&
        _allUserRewards[i].reward_id == reward_id
      ) {
        _userReward = _allUserRewards[i];
        isValidReward = true;
      }
    }
    return (_userReward, isValidReward);
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
    if (compareStrings(action_id, " ")) revert MissingActionId();
    if (bytes(action_id).length <= 0) revert MissingActionId();
    _;
  }

  // hasRewards: Ensure the msg.sender has rewards to claim
  modifier hasRewards(address user) {
    if (challengeRewards[user].length == 0) {
      revert RewardsNotFound(msg.sender);
    }
    _;
  }
}
