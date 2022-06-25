// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";

/*
@Description: SportsVybe 
*/

//TODO: use chainlink VRF for uquiue Identifier -> challenge_id, team_id

//Errors
error FailedEventCreation_DuplicateTeam(uint256);
error NotFound(string);
error FailedEventCreation_ChallengePoolClosed(uint256);
error NotAllowed_For_Challenge(uint256, uint256);
error Unauthorized(uint256);
error Team_Unauthorized(uint256);
error InsufficientAmount(uint256, uint256);
error Vote_Unauthorized(uint256);
error Duplicate_Vote(uint256, address);
error Invalid_Team(uint256);
error ChallengeAlreadyAccepted(uint256);
error ChallengeClosed(uint256);
error FailedChallengeCreation_ReflexiveTeam(uint256);

error NotFoundMembershipRequest(uint256, address);
error FailedEventCreation_InsufficientBalance(uint256, uint256);
error sendTeamMembershipRequest_Unauthorized(uint256, address);
error ChallengePoolCreation_Unauthorized(uint256);

contract SportsVybe is Ownable, KeeperCompatibleInterface {
    IERC20 public sportsVybeToken;

    struct TeamMate {
        address user;
    }

    struct ChallengeVote {
        uint256 challenge_id;
    }

    struct ChallengePool {
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
    }

    //emit this event when ever a team joins a challenge
    event TeamCreated(uint256 team_id);
    event EventCreated(uint256 challenge_id, uint256 team1, uint256 team2);
    event ChallengePoolCreated(
        uint256 challenge_id,
        uint256 amount,
        uint256 team_id,
        uint256 challenged_team_id
    );
    event ChallengePoolClosed(uint256 challenge_id);
    event NewTeamMate(uint256 team_id, address user);
    event MembershipRequestSent(uint256 team_id);
    event VoteSubmit(address user, uint256 challenge_id, uint256 team_id);
    event Tie(uint256 challenge_id, uint256 team_id);
    event Win(uint256 challenge_id, uint256 team_id);
    event Lose(uint256 challenge_id, uint256 team_id);
    event DidNotShowUp(uint256 challenge_id, uint256 team_id);

    mapping(address => ChallengeVote[]) public votes;

    mapping(address => uint256) public sportsmanship; //the sportsmanship of each users
    mapping(uint256 => TeamMate[]) public team_membership_request;
    mapping(uint256 => address payable) public team_owner; // mapping by team_id
    mapping(uint256 => uint256) private team_sportsmanship;
    mapping(uint256 => uint256) private teamCount;
    mapping(uint256 => address[]) private teamMembers;
    mapping(uint256 => ChallengePool) public challengePools; // mapping by challenge_id
    mapping(uint256 => address[]) private challengePoolTeamMembers;

    uint256[] public pending_challenge_pool_ids;

    uint256 team_id_counter = 0;

    uint256 new_challenge_id = 889;

    uint256 counter = 0;

    constructor(address _sportsVybeToken) {
        sportsVybeToken = IERC20(_sportsVybeToken);
    }

    function createTeam() external newSportsmanship returns (uint256) {
        uint256 _team_id = team_id_counter + 1;

        team_owner[_team_id] = payable(msg.sender);

        teamCount[_team_id] = 1;

        team_sportsmanship[_team_id] = 100;

        teamMembers[_team_id].push(msg.sender);

        emit TeamCreated(_team_id);

        //increment the team id
        team_id_counter++;
        return _team_id;
    }

    //TODO: Time bond(lock)

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

    function delineChallenge(uint256 challenge_id, uint256 team_id)
        external
        teamOwner(team_id)
        returns (bool)
    {
        challengePools[challenge_id].isAccepted = false;
        closeChallenge(challenge_id);
        return true;
    }

    function acceptChallenge(
        uint256 challenge_id,
        uint256 team_id,
        uint256 amount
    ) external payable teamOwner(team_id) returns (bool) {
        //if challenge is already accepted then reject
        if (challengePools[challenge_id].isAccepted) {
            revert ChallengeAlreadyAccepted(challenge_id);
        }

        //Ensure that team id has been challenged to participate in the challenge pool
        if (challengePools[challenge_id].team2 != team_id) {
            revert NotAllowed_For_Challenge(challenge_id, team_id);
        }

        //Ensure the team owner has the required amount for participation
        uint256 challenge_amount = challengePools[challenge_id].amount;

        if (amount != challenge_amount) {
            revert InsufficientAmount(challenge_id, challenge_amount);
        }

        //TODO: Ensure that team cannot accept challenge with a team that has a player on both teams.
        //TODO: Ensure that team cannot accept challenge with more or less players than in challengePool

        //Receive SVT token of the challenge
        sportsVybeToken.transfer(address(this), amount);

        challengePools[challenge_id].amount += amount;

        challengePools[challenge_id].isAccepted = true;

        // Add team members to the challenge pool team members
        for (uint256 i = 0; i < teamMembers[team_id].length; i++) {
            challengePoolTeamMembers[challenge_id].push(
                teamMembers[team_id][i]
            );
        }

        //emit event created
        emit EventCreated(
            challenge_id,
            challengePools[challenge_id].team1,
            challengePools[challenge_id].team2
        );

        return true;
    }

    function createChallengePool(
        uint256 team_id,
        uint256 challenged_team_id,
        uint256 amount
    )
        public
        payable
        newSportsmanship
        teamOwner(team_id)
        notTeamOwner(challenged_team_id)
        returns (uint256)
    {
        uint256 _interval = 5;
        uint256 challenge_id = new_challenge_id;

        if (amount == 0) {
            revert InsufficientAmount(0, amount);
        }

        // TODO: Ensure that team cannot compete with it self.
        // TODO: Ensure that team cannot compete with a team that has a player on both teams.

        //Ensure that team owner has funds to create challenge
        if (amount >= sportsVybeToken.balanceOf(msg.sender)) {
            revert FailedEventCreation_InsufficientBalance(0, amount);
        }

        //move funds to smart contract
        sportsVybeToken.transferFrom(msg.sender, address(this), amount);

        // create challenge pool
        challengePools[challenge_id] = ChallengePool(
            team_id,
            challenged_team_id,
            amount,
            false,
            false,
            false,
            block.timestamp,
            _interval,
            0,
            0
        );

        pending_challenge_pool_ids.push(challenge_id);

        // complete: Add the members of the team to challenge pool
        for (uint256 i = 0; i < teamMembers[team_id].length; i++) {
            challengePoolTeamMembers[challenge_id].push(
                teamMembers[team_id][i]
            );
        }

        // increment challenge_id
        new_challenge_id += 1;

        emit ChallengePoolCreated(
            challenge_id,
            amount,
            team_id,
            challenged_team_id
        );
        return challenge_id;
    }

    function getSVTBalance() public view returns (uint256) {
        return sportsVybeToken.balanceOf(msg.sender);
    }

    function getSVTAllowance() public view returns (uint256) {
        return sportsVybeToken.allowance(msg.sender, address(this));
    }

    function sendTeamMembershipRequest(uint256 team_id, address user)
        external
        newSportsmanship
        teamOwner(team_id)
        returns (bool)
    {
        // TODO: revert sending an invite to self

        team_membership_request[team_id].push(TeamMate(user));
        emit MembershipRequestSent(team_id);
        return true;
    }

    function acceptMembershipTeamRequest(uint256 team_id)
        public
        newSportsmanship
        returns (bool)
    {
        // TODO: revert accepting an invite to self

        uint256 found = 0;
        for (uint256 i = 0; i < team_membership_request[team_id].length; i++) {
            if (team_membership_request[team_id][i].user == msg.sender) {
                found = 1;
                break;
            }
        }

        if (found == 0) {
            revert NotFoundMembershipRequest(team_id, msg.sender);
        }

        teamMembers[team_id].push(msg.sender);
        teamCount[team_id] = teamCount[team_id] + 1;
        team_sportsmanship[team_id] = team_sportsmanship[team_id] + 100;

        emit NewTeamMate(team_id, msg.sender);
        return true;
    }

    function getTeamMates(uint256 team_id)
        public
        view
        returns (address[] memory)
    {
        return teamMembers[team_id];
    }

    function getChallengePoolTeamMembers(uint256 challenge_id)
        public
        view
        returns (address[] memory)
    {
        return challengePoolTeamMembers[challenge_id];
    }

    function getTeamCount(uint256 team_id) external view returns (uint256) {
        return teamCount[team_id];
    }

    /*
      @description: return team's sportmanship based on 
                    the members of the team, hence;
                    teams_sportsmanship = total players sportmanship / total number of players 
      @params: id -The team's ID
      @returns: uint
    */
    function getTeamSportsmanship(uint256 _team_id)
        external
        view
        returns (uint256)
    {
        return team_sportsmanship[_team_id] / teamCount[_team_id];
    }

    function authorizedToVote(uint256 challenge_id)
        internal
        view
        returns (bool)
    {
        for (
            uint256 i = 0;
            i < challengePoolTeamMembers[challenge_id].length;
            i++
        ) {
            if (challengePoolTeamMembers[challenge_id][i] == msg.sender)
                return true;
        }
        return false;
    }

    function isVoteDuplicate(uint256 challenge_id) private view returns (bool) {
        ChallengeVote[] memory _address_votes = votes[msg.sender];
        bool isDup = false;
        for (uint256 i = 0; i < _address_votes.length; i++) {
            //lookup for the challenge
            if (_address_votes[i].challenge_id == challenge_id) {
                isDup = true;
            }
        }
        return isDup;
    }

    function increaseVoteFor(uint256 challenge_id, uint256 team_id) public {
        // complete: Close vote when challenge is closed
        if (challengePools[challenge_id].isClosed) {
            revert ChallengeClosed(challenge_id);
        }

        // check if voter is on a team
        if (!authorizedToVote(challenge_id)) {
            revert Vote_Unauthorized(challenge_id);
        }

        //revert, Already voted!
        if (isVoteDuplicate(challenge_id)) {
            revert Duplicate_Vote(challenge_id, msg.sender);
        }

        //increase vote count for team ID
        if (challengePools[challenge_id].team1 == team_id) {
            challengePools[challenge_id].team1_count += 1;
        } else if (challengePools[challenge_id].team2 == team_id) {
            challengePools[challenge_id].team2_count += 1;
        } else {
            revert Invalid_Team(team_id);
        }

        // add votes to ChallengeVote[]
        votes[msg.sender].push(ChallengeVote(challenge_id));

        emit VoteSubmit(msg.sender, challenge_id, team_id);

        // if
        if (
            totalChallengePoolVotes(challenge_id) ==
            challengePoolTeamMemberCount(challenge_id)
        ) {
            //=======check if it's due to give out reward========
            checkForWinner(challenge_id);
        }
    }

    function checkForWinner(uint256 challenge_id) private returns (uint256) {
        //check for winner
        uint256 winner = 0;
        uint256 loser = 0;

        if (
            challengePools[challenge_id].team1_count ==
            challengePools[challenge_id].team2_count
        ) {
            // tie reduce sportsmanship of both teams
            handleSportsmanship(
                challenge_id,
                "tie",
                challengePools[challenge_id].team1
            );
            handleSportsmanship(
                challenge_id,
                "tie",
                challengePools[challenge_id].team2
            );

            //Give back the challenge reward to team owner divided by sportsmanship % of the team
            address team_1_owner = team_owner[
                challengePools[challenge_id].team1
            ];
            address team_2_owner = team_owner[
                challengePools[challenge_id].team2
            ];

            if (
                !challengePools[challenge_id].isCompleted ||
                !challengePools[challenge_id].isClosed
            ) {
                // sportsVybeToken.transferFrom(
                //     address(this),
                //     team_1_owner,
                //     challengePools[challenge_id].amount / 2
                // );
                // sportsVybeToken.transferFrom(
                //     address(this),
                //     team_2_owner,
                //     challengePools[challenge_id].amount / 2
                // );

                payable(team_1_owner).transfer(
                    challengePools[challenge_id].amount / 2
                );
                payable(team_2_owner).transfer(
                    challengePools[challenge_id].amount / 2
                );
            }
        } else if (
            challengePools[challenge_id].team1_count >
            challengePools[challenge_id].team2_count
        ) {
            winner = challengePools[challenge_id].team1;
            loser = challengePools[challenge_id].team2;
        } else {
            winner = challengePools[challenge_id].team2;
            loser = challengePools[challenge_id].team1;
        }

        //move ether back to the challenge pool creator
        if (winner != 0) {
            handleSportsmanship(challenge_id, "win", winner);
            handleSportsmanship(challenge_id, "lose", loser);
            address winner_team_owner = team_owner[winner];
            if (
                !challengePools[challenge_id].isCompleted ||
                !challengePools[challenge_id].isClosed
            ) {
                // sportsVybeToken.transferFrom(
                //     address(this),
                //     winner_team_owner,
                //     challengePools[challenge_id].amount
                // );
                payable(winner_team_owner).transfer(
                    challengePools[challenge_id].amount
                );
                challengePools[challenge_id].isCompleted = true;
            }
        }

        challengePools[challenge_id].isClosed = true;
        emit ChallengePoolClosed(challenge_id);

        return winner;
    }

    function handleSportsmanship(
        uint256 challenge_id,
        string memory reason,
        uint256 team_id
    ) private {
        /* Cases for sportmanship changes
      1. Did not show up for a challege (team_sportsmanship -= 5)
      2. Tie Votes (team_sportsmanship -= 1)
      3. Won a challenge (team_sportsmanship += 0.50)
      4. Lost a challenge (team_sportsmanship += 0.25)
      */

        if (compareStrings(reason, "tie")) {
            team_sportsmanship[team_id] -= 3;
            emit Tie(challenge_id, team_id);
        } else if (compareStrings(reason, "win")) {
            team_sportsmanship[team_id] += 2;
            emit Win(challenge_id, team_id);
        } else if (compareStrings(reason, "lose")) {
            team_sportsmanship[team_id] += 1;
            emit Lose(challenge_id, team_id);
        } else if (compareStrings(reason, "not_present")) {
            team_sportsmanship[team_id] -= 5;
            emit DidNotShowUp(challenge_id, team_id);
        } else {
            revert NotFound(reason);
        }
    }

    function compareStrings(string memory a, string memory b)
        private
        pure
        returns (bool)
    {
        return (keccak256(abi.encodePacked((a))) ==
            keccak256(abi.encodePacked((b))));
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
            counter = counter + 1;
            closeChallenge(_id);
        }
        // We don't use the performData in this example. The performData is generated by the Keeper's call to your checkUpkeep function
    }

    modifier newSportsmanship() {
        if (sportsmanship[msg.sender] == 0) {
            sportsmanship[msg.sender] = 100;
        }
        _;
    }

    modifier notTeamOwner(uint256 team_id) {
        if (team_owner[team_id] == msg.sender) {
            revert FailedChallengeCreation_ReflexiveTeam(team_id);
        }
        _;
    }

    modifier teamOwner(uint256 team_id) {
        if (team_owner[team_id] != msg.sender) {
            revert Team_Unauthorized(team_id);
        }
        _;
    }
}
