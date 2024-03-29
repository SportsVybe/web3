const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { constants } = require("ethers");

const MOCK_SUBSCRIPTION_ID = 0;
//const MOCK_LINK = constants.AddressZero;

function generateActionId() {
  return Math.random().toString(36).substring(2, 15);
}

describe("SportsVybe Contract - Test Cases", function () {
  async function deployFixture() {
    const [owner, addr1, addr2, addr3, addr4, addr5, addr6] = await ethers.getSigners();


    const SportsVybeToken = await ethers.getContractFactory("SportsVybeToken");
    const Token = await SportsVybeToken.deploy();
    await Token.deployed();

    const vrfCoordFactory = await ethers.getContractFactory( "MockVRFCoordinator" );
    const mockVrfCoordinator = await vrfCoordFactory.deploy();

    const SportsVybeContract = await ethers.getContractFactory("SportsVybe");
    const Contract = await SportsVybeContract.deploy(Token.address, mockVrfCoordinator.address, MOCK_SUBSCRIPTION_ID);
    await Contract.deployed();

    //await Contract.connect(owner).initVRF();

    // Fixtures can return anything you consider useful for your tests
    return {
      SportsVybeToken,
      Token,
      SportsVybeContract,
      Contract,
      owner,
      addr1,
      addr2,
      addr3,
      addr4,
      addr5,
      addr6,
    };
  }

  async function getTeams() {
    const { Contract, owner, addr1, addr2, addr3, addr4, addr5 } =
      await loadFixture(deployFixture);
    const actionId = generateActionId();

    const team0 = await Contract.createTeam(actionId);
    const team0_id = 0;

    const team1 = await Contract.connect(addr1).createTeam(actionId);
    const team1_id = 1;

    const team2 = await Contract.connect(addr2).createTeam(actionId);
    const team2_id = 2;

    const team3 = await Contract.connect(addr3).createTeam(actionId);
    const team3_id = 3;

    const team4 = await Contract.connect(addr4).createTeam(actionId);
    const team4_id = 4;

    const team5 = await Contract.connect(addr5).createTeam(actionId);
    const team5_id = 5;

    return {
      team0,
      team1,
      team2,
      team3,
      team4,
      team5,
      team0_id,
      team1_id,
      team2_id,
      team3_id,
      team4_id,
      team5_id,
    };
  }

  async function transferAmount(Token, account, amount) {
    await Token.transfer(account.address, amount);
    expect(await Token.balanceOf(account.address)).to.equal(amount);
  }

  async function approveAmount(Contract, Token, account, amount) {
    await Token.connect(account).approve(Contract.address, amount);
    expect(await Token.allowance(account.address, Contract.address)).to.equal(
      amount
    );
  }

  async function transferAndApproveAmount(
    Contract,
    Token,
    account,
    amount,
    actionId
  ) {
    await transferAmount(Token, account, amount);
    await approveAmount(Contract, Token, account, amount);
  }

  async function sendRequest(
    Contract,
    account,
    actionId,
    teamId,
    inviteAddress
  ) {
    return Contract.connect(account).sendTeamMembershipRequest(
      actionId,
      teamId,
      inviteAddress
    );
  }

  async function acceptRequest(Contract, account, actionId, teamId) {
    return Contract.connect(account).acceptTeamMembershipRequest(
      actionId,
      teamId
    );
  }

  async function sendAndAcceptRequest(
    Contract,
    account,
    actionId,
    teamId,
    inviteAccount
  ) {
    await sendRequest(
      Contract,
      account,
      actionId,
      teamId,
      inviteAccount.address
    );
    await acceptRequest(Contract, inviteAccount, actionId, teamId);
  }

  async function createChallenge(
    Contract,
    creator,
    actionId,
    creatorTeam,
    challengerTeam,
    amount
  ) {
    if (actionId === "log") {
      console.log(
        "createChallenge",
        creator.address,
        actionId,
        creatorTeam,
        challengerTeam,
        amount
      );
    }
    return Contract.connect(creator).createChallengePool(
      actionId,
      creatorTeam,
      challengerTeam,
      amount
    );
  }

  async function acceptChallenge(
    Contract,
    challenger,
    actionId,
    challengerTeam,
    amount,
    challengeId
  ) {
    if (actionId === "log") {
      console.log(
        "acceptChallenge",
        challenger.address,
        actionId,
        challengerTeam,
        amount,
        challengeId
      );
    }
    return Contract.connect(challenger).acceptChallengePool(
      actionId,
      challengeId,
      challengerTeam,
      amount
    );
  }

  async function createAndAcceptChallenge(
    Contract,
    Token,
    creator,
    challenger,
    actionId,
    creatorTeam,
    challengerTeam,
    amount,
    allowance,
    challengeId
  ) {
    if (actionId === "log") {
      console.log(
        "TESTS: createAndAcceptChallenge",
        creator.address,
        challenger.address,
        actionId,
        creatorTeam,
        challengerTeam,
        amount,
        allowance,
        challengeId
      );
    }

    await transferAndApproveAmount(Contract, Token, creator, amount, actionId);
    await transferAndApproveAmount(
      Contract,
      Token,
      challenger,
      amount,
      actionId
    );
    await createChallenge(
      Contract,
      creator,
      actionId,
      creatorTeam,
      challengerTeam,
      amount
    );
    await acceptChallenge(
      Contract,
      challenger,
      actionId,
      challengerTeam,
      amount,
      challengeId
    );
  }

  async function submitVote(Contract, voter, actionId, challengeId, vote) {
    if (actionId === "log") {
      console.log(voter.address, actionId, challengeId, vote);
    }
    return Contract.connect(voter).submitVote(actionId, challengeId, vote);
  }

  describe("Deployment", function () {
    it("Should deploy contract", async function () {
      const { Contract } = await loadFixture(deployFixture);
      expect(Contract).to.include(Contract);
    });

    // it("Should generate unquie IDs", async function () {
    //     const { Contract, owner } = await loadFixture(deployFixture);

    //     const initVRF = await Contract.connect(owner).requestRandomWords();

    //     const numWords = 50; //Contract.numWords;
    //     expect(await Contract.getVrfLength()).to.equal(numWords);
    // });


    it("Should match signers to team.from addresses", async function () {
      const { owner, addr1, addr2, addr3, addr4, addr5 } = await loadFixture(
        deployFixture
      );
      const { team0, team1, team2, team3, team4, team5 } = await getTeams();
      expect(owner.address).to.equal(team0.from);

      expect(addr1.address).to.equal(team1.from);

      expect(addr2.address).to.equal(team2.from);

      expect(addr3.address).to.equal(team3.from);

      expect(addr4.address).to.equal(team4.from);

      expect(addr5.address).to.equal(team5.from);
    });

    describe("Token", function () {
      it("Should assign the total supply of tokens to the owner", async function () {
        const { Token, owner } = await loadFixture(deployFixture);
        const ownerBalance = await Token.balanceOf(owner.address);
        expect(await Token.totalSupply()).to.equal(ownerBalance);
      });

      it("Should transfer tokens between accounts", async function () {
        const { Token, addr1, addr2 } = await loadFixture(deployFixture);

        // Transfer 50 tokens from owner to addr1
        await Token.transfer(addr1.address, 50);
        expect(await Token.balanceOf(addr1.address)).to.equal(50);

        // Transfer 50 tokens from addr1 to addr2
        await Token.connect(addr1).transfer(addr2.address, 50);
        expect(await Token.balanceOf(addr2.address)).to.equal(50);
      });
    });
  });

  describe("\nTeam Functions", function () {
    describe("createTeam", function () {
      it("Should revert if actionId is empty/missing", async function () {
        const { Contract } = await loadFixture(deployFixture);
        await expect(Contract.createTeam(" ")).to.be.revertedWith(
          "MissingActionId()"
        );
        await expect(Contract.createTeam("")).to.be.revertedWith(
          "MissingActionId()"
        );

        await expect(Contract.createTeam()).to.be.reverted;
      });

      it("Should emit TeamCreated", async function () {
        const { Contract } = await loadFixture(deployFixture);
        const actionId = generateActionId();
        const newTeam = await Contract.createTeam(actionId);
        await expect(newTeam)
          .to.emit(Contract, "TeamCreated")
          .withArgs(actionId, 0);
      });
    });

    describe("sendTeamMembershipRequest", function () {
      it("Should revert if not the team owner", async function () {
        const { addr2, addr3, Contract } = await loadFixture(deployFixture);
        const { team0_id } = await getTeams();
        await expect(
          sendRequest(
            Contract,
            addr2,
            generateActionId(),
            team0_id,
            addr3.address
          )
        ).to.be.revertedWith(`TeamUnauthorized(${team0_id})`);
      });

      it("Should revert if sent to self", async function () {
        const { addr2, Contract } = await loadFixture(deployFixture);
        const { team2_id } = await getTeams();
        await expect(
          sendRequest(
            Contract,
            addr2,
            generateActionId(),
            team2_id,
            addr2.address
          )
        ).to.be.revertedWith(
          `TeamMembershipRequestUnauthorized(${team2_id}, "${addr2.address}")`
        );
      });

      it("Should revert if already sent to a user", async function () {
        const { addr2, addr1, Contract } = await loadFixture(deployFixture);
        const { team2_id } = await getTeams();
        await sendRequest(
          Contract,
          addr2,
          generateActionId(),
          team2_id,
          addr1.address
        );
        await expect(
          sendRequest(
            Contract,
            addr2,
            generateActionId(),
            team2_id,
            addr1.address
          )
        ).to.be.revertedWith(`TeamMemberDuplicate("${addr1.address}")`);
      });

      it("Should emit TeamMembershipRequestSent", async function () {
        const { Contract, addr3, addr2 } = await loadFixture(deployFixture);
        const { team3, team3_id } = await getTeams();
        const actionId = generateActionId();
        await expect(
          sendRequest(Contract, addr3, actionId, team3_id, addr2.address)
        )
          .to.emit(Contract, "TeamMembershipRequestSent")
          .withArgs(actionId, team3_id, addr2.address, team3.from);
      });
    });

    describe("acceptTeamMembershipRequest", function () {
      it("Should revert if no membership found", async function () {
        const { addr4, Contract } = await loadFixture(deployFixture);
        const { team1_id } = await getTeams();
        await expect(
          acceptRequest(Contract, addr4, generateActionId(), team1_id)
        ).to.be.revertedWith(
          `TeamMembershipRequestNotFound(${team1_id}, "${addr4.address}")`
        );
      });

      it("Should emit TeamMembershipRequestAccept", async function () {
        const { addr1, addr4, Contract } = await loadFixture(deployFixture);
        const { team1_id } = await getTeams();
        const actionId = generateActionId();
        await sendRequest(Contract, addr1, actionId, team1_id, addr4.address);
        await expect(acceptRequest(Contract, addr4, actionId, team1_id))
          .to.emit(Contract, "TeamMembershipRequestAccept")
          .withArgs(actionId, team1_id, addr4.address);
      });
    });
  });

  describe("\nChallenge Functions", function () {
    describe("createChallengePool", function () {
      it("Should revert if not the team owner", async function () {
        const { owner, Contract } = await loadFixture(deployFixture);
        const { team2_id, team1_id } = await getTeams();
        const amount = 0;
        await expect(
          createChallenge(
            Contract,
            owner,
            generateActionId(),
            team1_id,
            team2_id,
            amount
          )
        ).to.be.revertedWith(`TeamUnauthorized(${team1_id})`);
      });

      it("Should revert if challenging self", async function () {
        const { owner, Contract } = await loadFixture(deployFixture);
        const { team0_id } = await getTeams();
        const amount = 0;
        await expect(
          createChallenge(
            Contract,
            owner,
            generateActionId(),
            team0_id,
            team0_id,
            amount
          )
        ).to.be.revertedWith(`ChallengePoolCreationUnauthorized(${team0_id})`);
      });

      it("Should revert with 0 amount", async function () {
        const { owner, Contract } = await loadFixture(deployFixture);
        const { team0_id, team1_id } = await getTeams();
        const amount = 0;
        await expect(
          createChallenge(
            Contract,
            owner,
            generateActionId(),
            team0_id,
            team1_id,
            amount
          )
        ).to.be.reverted;
      });

      it("Should revert if sender balance is insufficient", async function () {
        const { addr1, Contract, Token } = await loadFixture(deployFixture);
        const { team1_id, team2_id } = await getTeams();
        const amount = 100;
        await transferAndApproveAmount(Contract, Token, addr1, 50);
        await expect(
          createChallenge(
            Contract,
            addr1,
            generateActionId(),
            team1_id,
            team2_id,
            amount
          )
        ).to.be.reverted;
      });

      it("Should reduce team SVT balance after challenging", async function () {
        const { addr2, addr1, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team2_id, team1_id } = await getTeams();

        const actionId = generateActionId();
        const amount = 10;
        const allowance = 50;
        await transferAndApproveAmount(Contract, Token, addr1, allowance);

        await createChallenge(
          Contract,
          addr1,
          actionId,
          team1_id,
          team2_id,
          amount
        );

        expect(await Contract.connect(addr1).getSVTBalance()).to.be.equal(
          allowance - amount
        );
      });

      it("Should emit ChallengePoolCreated", async function () {
        const { addr3, Contract, Token } = await loadFixture(deployFixture);
        const { team3_id, team1_id } = await getTeams();

        const actionId = generateActionId();
        const amount = 10;

        await transferAndApproveAmount(Contract, Token, addr3, amount);

        await expect(
          createChallenge(Contract, addr3, actionId, team3_id, team1_id, amount)
        )
          .to.emit(Contract, "ChallengePoolCreated")
          .withArgs(actionId, 900, amount, team3_id, team1_id);
      });
    });

    describe("acceptChallengePool", function () {
      it("Should revert if not the team owner", async function () {
        const { owner, addr1, addr2, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team0_id, team1_id } = await getTeams();

        const actionId = generateActionId();
        const amount = 10;
        const challengeId = 900;
        await approveAmount(Contract, Token, owner, amount);
        await transferAndApproveAmount(Contract, Token, addr1, amount);

        await createChallenge(
          Contract,
          owner,
          actionId,
          team0_id,
          team1_id,
          amount
        );

        await expect(
          acceptChallenge(
            Contract,
            addr2,
            actionId,
            team1_id,
            amount,
            challengeId
          )
        ).to.be.revertedWith(`TeamUnauthorized(${team1_id})`);
      });

      it("Should revert if challenge is already accepted", async function () {
        const { owner, addr1, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team0_id, team1_id } = await getTeams();

        const actionId = generateActionId();
        const amount = 10;
        const challengeId = 900;
        await approveAmount(Contract, Token, owner, amount);
        await transferAndApproveAmount(Contract, Token, addr1, amount);
        await createChallenge(
          Contract,
          owner,
          actionId,
          team0_id,
          team1_id,
          amount
        );
        await acceptChallenge(
          Contract,
          addr1,
          actionId,
          team1_id,
          amount,
          challengeId
        );

        expect((await Contract.challengePools(challengeId)).isAccepted).to.be
          .true;

        await expect(
          acceptChallenge(
            Contract,
            addr1,
            actionId,
            team1_id,
            amount,
            challengeId
          )
        ).to.be.revertedWith(`ChallengePoolAlreadyAccepted(${challengeId})`);
      });

      it("Should revert if accepting team is not authorized", async function () {
        const { owner, addr1, addr3, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team0_id, team1_id, team3_id } = await getTeams();

        const actionId = generateActionId();
        const amount = 10;
        const challengeId = 900;
        await approveAmount(Contract, Token, owner, amount);
        await transferAndApproveAmount(Contract, Token, addr1, amount);

        await createChallenge(
          Contract,
          owner,
          actionId,
          team0_id,
          team1_id,
          amount
        );

        await expect(
          acceptChallenge(
            Contract,
            addr3,
            actionId,
            team3_id,
            amount,
            challengeId
          )
        ).to.be.revertedWith(`TeamUnauthorized(${team3_id})`);
      });

      it("Should revert if insufficient amount", async function () {
        const { owner, addr1, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team0_id, team1_id } = await getTeams();

        const actionId = generateActionId();
        const amount = 10;
        const challengeId = 900;
        await approveAmount(Contract, Token, owner, amount);
        await transferAndApproveAmount(Contract, Token, addr1, amount);

        await createChallenge(
          Contract,
          owner,
          actionId,
          team0_id,
          team1_id,
          amount
        );

        await expect(
          acceptChallenge(Contract, addr1, actionId, team1_id, 5, challengeId)
        ).to.be.revertedWith(
          `ChallengePoolInsufficientAmount(${challengeId}, ${amount})`
        );
      });

      it("Should equal the same number of players on both teams", async function () {
        const { owner, addr1, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team0_id, team1_id } = await getTeams();

        const actionId = generateActionId();
        const amount = 10;
        const challengeId = 900;
        await approveAmount(Contract, Token, owner, amount);
        await transferAndApproveAmount(Contract, Token, addr1, amount);
        await createChallenge(
          Contract,
          owner,
          actionId,
          team0_id,
          team1_id,
          amount
        );
        await acceptChallenge(
          Contract,
          addr1,
          actionId,
          team1_id,
          amount,
          challengeId
        );

        expect(
          await Contract.getChallengePoolTeamMembersByTeam(
            challengeId,
            team0_id
          ).length
        ).to.be.equal(
          await Contract.getChallengePoolTeamMembersByTeam(
            challengeId,
            team1_id
          ).length
        );
      });

      it("Should revert if number of players are imbalanced", async function () {
        const { addr4, addr3, addr1, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team4_id, team1_id } = await getTeams();

        const amount = 10;
        const challengeId = 900;
        await transferAndApproveAmount(Contract, Token, addr4, amount);
        await transferAndApproveAmount(Contract, Token, addr1, amount);
        await sendRequest(
          Contract,
          addr1,
          generateActionId(),
          team1_id,
          addr3.address
        );
        await acceptRequest(Contract, addr3, generateActionId(), team1_id);
        await createChallenge(
          Contract,
          addr4,
          generateActionId(),
          team4_id,
          team1_id,
          amount
        );

        const team_1_members = await Contract.getChallengePoolTeamMembersByTeam(
          challengeId,
          team4_id
        );

        const team_2_members = await Contract.getTeamMates(team1_id);
        await expect(
          acceptChallenge(
            Contract,
            addr1,
            generateActionId(),
            team1_id,
            amount,
            challengeId
          )
        ).to.be.revertedWith(
          `'ChallengePoolTeamImbalance(${team_1_members.length}, ${team_2_members.length})'`
        );
      });

      it("Should revert if a player is on both sides", async function () {
        const { addr4, addr3, addr1, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team4_id, team1_id } = await getTeams();

        const amount = 10;
        const challengeId = 900;
        await transferAndApproveAmount(Contract, Token, addr4, amount);
        await transferAndApproveAmount(Contract, Token, addr1, amount);
        await sendRequest(
          Contract,
          addr4,
          generateActionId(),
          team4_id,
          addr3.address
        );
        await acceptRequest(Contract, addr3, generateActionId(), team4_id);
        await createChallenge(
          Contract,
          addr4,
          generateActionId(),
          team4_id,
          team1_id,
          amount
        );

        await sendRequest(
          Contract,
          addr1,
          generateActionId(),
          team1_id,
          addr3.address
        );
        await acceptRequest(Contract, addr3, generateActionId(), team1_id);
        await expect(
          acceptChallenge(
            Contract,
            addr1,
            generateActionId(),
            team1_id,
            amount,
            challengeId
          )
        ).to.be.revertedWith(`'TeamMemberDuplicate("${addr3.address}")'`);
      });

      it("Should reduce SVT balance after accepting", async function () {
        const { addr2, addr1, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team2_id, team1_id } = await getTeams();

        const actionId = generateActionId();
        const amount = 10;
        const allowance = 50;
        const challengeId = 900;
        await transferAndApproveAmount(Contract, Token, addr1, allowance);
        await transferAndApproveAmount(Contract, Token, addr2, allowance);

        await createChallenge(
          Contract,
          addr2,
          actionId,
          team2_id,
          team1_id,
          amount
        );

        acceptChallenge(
          Contract,
          addr1,
          actionId,
          team1_id,
          amount,
          challengeId
        );

        expect(await Contract.connect(addr2).getSVTBalance()).to.be.equal(
          allowance - amount
        );
      });

      it("Should emit ChallengePoolAccepted", async function () {
        const { owner, addr1, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team0_id, team1_id } = await getTeams();

        const actionId = generateActionId();
        const amount = 10;
        const challengeId = 900;
        await approveAmount(Contract, Token, owner, amount);
        await transferAndApproveAmount(Contract, Token, addr1, amount);

        await createChallenge(
          Contract,
          owner,
          actionId,
          team0_id,
          team1_id,
          amount
        );

        await expect(
          acceptChallenge(
            Contract,
            addr1,
            actionId,
            team1_id,
            amount,
            challengeId
          )
        )
          .to.emit(Contract, "ChallengePoolAccepted")
          .withArgs(actionId, 900, team0_id, team1_id);
      });
    });
  });

  describe("\nVote Functions", function () {
    describe("submitVote", function () {
      it("Should revert if voter is not on a team", async function () {
        const { addr4, addr1, addr2, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team4_id, team1_id } = await getTeams();
        const actionId = generateActionId();
        const amount = 10;
        const allowance = 50;
        const challengeId = 900;

        if (actionId === "log") {
          console.log(
            // Contract,
            // Token,
            addr1.address,
            addr4.address,
            actionId,
            team1_id,
            team4_id,
            amount,
            allowance,
            challengeId
          );
        }

        await createAndAcceptChallenge(
          Contract,
          Token,
          addr1,
          addr4,
          actionId,
          team1_id,
          team4_id,
          amount,
          allowance,
          challengeId
        );

        await expect(
          submitVote(Contract, addr2, actionId, challengeId, team1_id)
        ).to.be.revertedWith(
          `VoteUnauthorized(${challengeId}, "${addr2.address}")`
        );
      });

      it("Should revert if duplicate vote", async function () {
        const { addr4, addr1, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team4_id, team1_id } = await getTeams();
        const actionId = generateActionId();
        const amount = 10;
        const allowance = 50;
        const challengeId = 900;

        await createAndAcceptChallenge(
          Contract,
          Token,
          addr1,
          addr4,
          actionId,
          team1_id,
          team4_id,
          amount,
          allowance,
          challengeId
        );
        await submitVote(Contract, addr4, actionId, challengeId, team4_id);

        await expect(
          submitVote(Contract, addr4, actionId, challengeId, team4_id)
        ).to.be.revertedWith(
          `VoteDuplicate(${challengeId}, "${addr4.address}")`
        );
      });

      it("Should revert if vote for a invalid team", async function () {
        const { addr4, addr1, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team4_id, team1_id, team2_id } = await getTeams();
        const actionId = generateActionId();
        const amount = 10;
        const allowance = 50;
        const challengeId = 900;

        await createAndAcceptChallenge(
          Contract,
          Token,
          addr1,
          addr4,
          actionId,
          team1_id,
          team4_id,
          amount,
          allowance,
          challengeId
        );

        await expect(
          submitVote(Contract, addr4, actionId, challengeId, team2_id)
        ).to.be.revertedWith(`TeamInvalid(${team2_id})`);
      });

      it("Should emit VoteSubmit", async function () {
        const { addr4, addr1, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team4_id, team1_id } = await getTeams();
        const actionId = generateActionId();
        const amount = 10;
        const allowance = 50;
        const challengeId = 900;

        await createAndAcceptChallenge(
          Contract,
          Token,
          addr1,
          addr4,
          actionId,
          team1_id,
          team4_id,
          amount,
          allowance,
          challengeId
        );

        await expect(
          submitVote(Contract, addr4, actionId, challengeId, team4_id)
        )
          .to.emit(Contract, "VoteSubmit")
          .withArgs(actionId, addr4.address, challengeId, team4_id);
      });

      it("Should revert if challenge is already closed", async function () {
        const { addr5, addr3, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team5_id, team3_id } = await getTeams();
        const actionId = generateActionId();
        const amount = 70;
        const allowance = 80;
        const challengeId = 900;

        await createAndAcceptChallenge(
          Contract,
          Token,
          addr3,
          addr5,
          actionId,
          team3_id,
          team5_id,
          amount,
          allowance,
          challengeId
        );

        await submitVote(Contract, addr3, actionId, challengeId, team3_id);
        await submitVote(Contract, addr5, actionId, challengeId, team3_id);
        expect((await Contract.challengePools(challengeId)).isClosed).to.be
          .true;
        await expect(
          submitVote(Contract, addr3, actionId, challengeId, team3_id)
        ).to.be.revertedWith(`ChallengePoolAlreadyClosed(${challengeId})`);
      });

      it("Should emit ChallengePoolClosed", async function () {
        const { addr5, addr3, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team5_id, team3_id } = await getTeams();
        const actionId = generateActionId();
        const amount = 70;
        const allowance = 80;
        const challengeId = 900;

        await createAndAcceptChallenge(
          Contract,
          Token,
          addr3,
          addr5,
          actionId,
          team3_id,
          team5_id,
          amount,
          allowance,
          challengeId
        );

        await submitVote(Contract, addr3, actionId, challengeId, team3_id);
        await expect(
          submitVote(Contract, addr5, actionId, challengeId, team3_id)
        )
          .to.emit(Contract, "ChallengePoolClosed")
          .withArgs(challengeId);
      });

      it("Should emit 'Tie' when votes are even", async function () {
        const { addr5, addr3, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team5_id, team3_id } = await getTeams();
        const actionId = generateActionId();
        const amount = 70;
        const allowance = 80;
        const challengeId = 900;

        await createAndAcceptChallenge(
          Contract,
          Token,
          addr3,
          addr5,
          actionId,
          team3_id,
          team5_id,
          amount,
          allowance,
          challengeId
        );

        await submitVote(Contract, addr3, actionId, challengeId, team3_id);
        await expect(
          submitVote(Contract, addr5, actionId, challengeId, team5_id)
        )
          .to.emit(Contract, "Tie")
          .withArgs(challengeId, team3_id, team5_id);
      });

      it("Should emit 'Win' when team1 wins", async function () {
        const { addr5, addr3, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team5_id, team3_id } = await getTeams();
        const actionId = generateActionId();
        const amount = 70;
        const allowance = 80;
        const challengeId = 900;

        await createAndAcceptChallenge(
          Contract,
          Token,
          addr3,
          addr5,
          actionId,
          team3_id,
          team5_id,
          amount,
          allowance,
          challengeId
        );

        const challengeTeam1 = (await Contract.challengePools(challengeId))
          .team1;

        await submitVote(Contract, addr3, actionId, challengeId, team3_id);
        await expect(
          submitVote(Contract, addr5, actionId, challengeId, team3_id)
        )
          .to.emit(Contract, "Win")
          .withArgs(challengeId, challengeTeam1);
      });

      it("Should emit 'Lose' when team2 loses", async function () {
        const { addr5, addr3, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team5_id, team3_id } = await getTeams();
        const actionId = generateActionId();
        const amount = 70;
        const allowance = 80;
        const challengeId = 900;

        await createAndAcceptChallenge(
          Contract,
          Token,
          addr3,
          addr5,
          actionId,
          team3_id,
          team5_id,
          amount,
          allowance,
          challengeId
        );

        const challengeTeam1 = (await Contract.challengePools(challengeId))
          .team1;
        const challengeTeam2 = (await Contract.challengePools(challengeId))
          .team2;

        await submitVote(Contract, addr3, actionId, challengeId, team3_id);

        await expect(
          submitVote(Contract, addr5, actionId, challengeId, team3_id)
        )
          .to.emit(Contract, "Lose")
          .withArgs(challengeId, challengeTeam2);
      });
    });

    describe("createReward", function () {
      it("Should set the challenge as completed", async function () {
        const { addr5, addr3, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team5_id, team3_id } = await getTeams();
        const actionId = generateActionId();
        const amount = 70;
        const allowance = 80;
        const challengeId = 900;

        await createAndAcceptChallenge(
          Contract,
          Token,
          addr3,
          addr5,
          actionId,
          team3_id,
          team5_id,
          amount,
          allowance,
          challengeId
        );

        await submitVote(Contract, addr3, actionId, challengeId, team3_id);
        await submitVote(Contract, addr5, actionId, challengeId, team5_id);
        expect((await Contract.challengePools(challengeId)).isCompleted).to.be
          .true;
      });

      it("Should create a challengeReward for the winner (1 player team)", async function () {
        const { addr5, addr3, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team5_id, team3_id } = await getTeams();
        const actionId = generateActionId();
        const amount = 70;
        const allowance = 80;
        const challengeId = 900;

        await createAndAcceptChallenge(
          Contract,
          Token,
          addr3,
          addr5,
          actionId,
          team3_id,
          team5_id,
          amount,
          allowance,
          challengeId
        );

        await submitVote(Contract, addr3, actionId, challengeId, team3_id);
        await submitVote(Contract, addr5, actionId, challengeId, team3_id);

        expect(
          await Contract.getAllUserChallengeRewards(addr3.address)
        ).to.have.length(3);

        expect((await Contract.challengePools(challengeId)).isCompleted).to.be
          .true;
      });

      it("Should create a challengeReward for both team owners", async function () {
        const { addr5, addr3, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team5_id, team3_id } = await getTeams();
        const actionId = generateActionId();
        const amount = 70;
        const allowance = 80;
        const challengeId = 900;

        await createAndAcceptChallenge(
          Contract,
          Token,
          addr3,
          addr5,
          actionId,
          team3_id,
          team5_id,
          amount,
          allowance,
          challengeId
        );

        await submitVote(Contract, addr3, actionId, challengeId, team3_id);
        await submitVote(Contract, addr5, actionId, challengeId, team5_id);

        expect(
          await Contract.getAllUserChallengeRewards(addr3.address)
        ).to.have.length(2);

        expect(
          await Contract.getAllUserChallengeRewards(addr5.address)
        ).to.have.length(2);

        expect((await Contract.challengePools(challengeId)).isCompleted).to.be
          .true;
      });

      it("Should create a challengeReward for all players on winning team", async function () {
        const { addr1, addr2, addr3, addr4, addr5, addr6, Token, Contract } =
          await loadFixture(deployFixture);
        const { team5_id, team3_id } = await getTeams();
        const actionId = generateActionId();
        const amount = 70;
        const allowance = 80;
        const challengeId = 900;
        await transferAndApproveAmount(
          Contract,
          Token,
          addr1,
          allowance,
          actionId
        );
        await transferAndApproveAmount(
          Contract,
          Token,
          addr2,
          allowance,
          actionId
        );
        await transferAndApproveAmount(
          Contract,
          Token,
          addr4,
          allowance,
          actionId
        );
        await transferAndApproveAmount(
          Contract,
          Token,
          addr6,
          allowance,
          actionId
        );
        await sendAndAcceptRequest(Contract, addr3, actionId, team3_id, addr1);
        await sendAndAcceptRequest(Contract, addr3, actionId, team3_id, addr2);
        await sendAndAcceptRequest(Contract, addr5, actionId, team5_id, addr4);
        await sendAndAcceptRequest(Contract, addr5, actionId, team5_id, addr6);
        await createAndAcceptChallenge(
          Contract,
          Token,
          addr3,
          addr5,
          actionId,
          team3_id,
          team5_id,
          amount,
          allowance,
          challengeId
        );

        await submitVote(Contract, addr1, actionId, challengeId, team3_id);
        await submitVote(Contract, addr2, actionId, challengeId, team3_id);
        await submitVote(Contract, addr3, actionId, challengeId, team3_id);
        await submitVote(Contract, addr4, actionId, challengeId, team5_id);
        await submitVote(Contract, addr5, actionId, challengeId, team5_id);
        await submitVote(Contract, addr6, actionId, challengeId, team3_id);
        expect(
          await Contract.getAllUserChallengeRewards(addr1.address)
        ).to.have.length(2);

        expect(
          await Contract.getAllUserChallengeRewards(addr2.address)
        ).to.have.length(2);

        // owner of team3
        expect(
          await Contract.getAllUserChallengeRewards(addr3.address)
        ).to.have.length(3);
      });

      it("Should emit RewardCreated both Teams in a Tie", async function () {
        const { addr5, addr3, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team5_id, team3_id } = await getTeams();
        const actionId = generateActionId();
        const amount = 70;
        const allowance = 80;
        const challengeId = 900;

        await createAndAcceptChallenge(
          Contract,
          Token,
          addr3,
          addr5,
          actionId,
          team3_id,
          team5_id,
          amount,
          allowance,
          challengeId
        );

        await submitVote(Contract, addr3, actionId, challengeId, team3_id);
        const secondVote = await submitVote(
          Contract,
          addr5,
          actionId,
          challengeId,
          team5_id
        );
        await expect(secondVote)
          .to.emit(Contract, "RewardCreated")
          .withArgs(
            actionId,
            0,
            challengeId,
            team3_id,
            amount,
            false,
            addr3.address
          );
        await expect(secondVote)
          .to.emit(Contract, "RewardCreated")
          .withArgs(
            actionId,
            1,
            challengeId,
            team5_id,
            amount,
            false,
            addr5.address
          );
      });

      it("Should emit RewardCreated for Winning Team", async function () {
        const { addr5, addr3, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team5_id, team3_id } = await getTeams();
        const actionId = generateActionId();
        const amount = 70;
        const allowance = 80;
        const challengeId = 900;

        await createAndAcceptChallenge(
          Contract,
          Token,
          addr3,
          addr5,
          actionId,
          team3_id,
          team5_id,
          amount,
          allowance,
          challengeId
        );

        await submitVote(Contract, addr3, actionId, challengeId, team3_id);
        const secondVote = await submitVote(
          Contract,
          addr5,
          actionId,
          challengeId,
          team3_id
        );

        await expect(secondVote)
          .to.emit(Contract, "RewardCreated")
          .withArgs(
            actionId,
            0,
            challengeId,
            team3_id,
            amount,
            false,
            addr3.address
          );

        await expect(secondVote)
          .to.emit(Contract, "RewardCreated")
          .withArgs(
            actionId,
            1,
            challengeId,
            team3_id,
            amount,
            false,
            addr3.address
          );
      });
    });

    describe("claimReward", function () {
      it("Should revert if the reward is invalid", async function () {
        const { addr5, addr3, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team5_id, team3_id } = await getTeams();
        const rewardActionId = generateActionId();
        const claimActionId = generateActionId();

        const amount = 70;
        const allowance = 80;
        const challengeId = 900;
        const rewardId = 0;

        await createAndAcceptChallenge(
          Contract,
          Token,
          addr3,
          addr5,
          rewardActionId,
          team3_id,
          team5_id,
          amount,
          allowance,
          challengeId
        );

        await submitVote(
          Contract,
          addr3,
          rewardActionId,
          challengeId,
          team3_id
        );
        await submitVote(
          Contract,
          addr5,
          rewardActionId,
          challengeId,
          team3_id
        );

        expect(
          await Contract.getAllUserChallengeRewards(addr3.address)
        ).to.have.length(3);

        expect((await Contract.challengePools(challengeId)).isCompleted).to.be
          .true;

        await Contract.connect(addr3).claimReward(
          claimActionId,
          rewardActionId,
          rewardId,
          challengeId
        );

        await expect(
          Contract.connect(addr3).claimReward(
            claimActionId,
            rewardActionId,
            5, // invalid index
            challengeId
          )
        ).to.be.revertedWith(`RewardInvalid("${rewardActionId}", ${5})`);
      });

      it("Should revert if the reward is already claimed", async function () {
        const { addr5, addr3, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team5_id, team3_id } = await getTeams();
        const rewardActionId = generateActionId();
        const claimActionId = generateActionId();

        const amount = 70;
        const allowance = 80;
        const challengeId = 900;

        await createAndAcceptChallenge(
          Contract,
          Token,
          addr3,
          addr5,
          rewardActionId,
          team3_id,
          team5_id,
          amount,
          allowance,
          challengeId
        );

        await submitVote(
          Contract,
          addr3,
          rewardActionId,
          challengeId,
          team3_id
        );
        await submitVote(
          Contract,
          addr5,
          rewardActionId,
          challengeId,
          team3_id
        );

        expect(
          await Contract.getAllUserChallengeRewards(addr3.address)
        ).to.have.length(3);

        expect((await Contract.challengePools(challengeId)).isCompleted).to.be
          .true;

        await Contract.connect(addr3).claimReward(
          claimActionId,
          rewardActionId,
          0,
          challengeId
        );

        await expect(
          Contract.connect(addr3).claimReward(
            claimActionId,
            rewardActionId,
            0,
            challengeId
          )
        ).to.be.revertedWith(
          `RewardAlreadyClaimed("${rewardActionId}", ${0}, ${challengeId})`
        );
      });

      it("Should revert if user has no rewards", async function () {
        const { addr5, addr3, Token, Contract } = await loadFixture(
          deployFixture
        );

        await transferAndApproveAmount(
          Contract,
          Token,
          addr3,
          100,
          generateActionId()
        );

        await expect(
          Contract.connect(addr3).claimReward(
            generateActionId(),
            generateActionId(),
            0,
            900
          )
        ).to.be.revertedWith(`RewardsNotFound("${addr3.address}")`);
      });

      it("Should emit RewardClaimed", async function () {
        const { addr5, addr3, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team5_id, team3_id } = await getTeams();
        const rewardActionId = generateActionId();
        const claimActionId = generateActionId();

        const amount = 70;
        const allowance = 80;
        const challengeId = 900;

        await createAndAcceptChallenge(
          Contract,
          Token,
          addr3,
          addr5,
          rewardActionId,
          team3_id,
          team5_id,
          amount,
          allowance,
          challengeId
        );

        await submitVote(
          Contract,
          addr3,
          rewardActionId,
          challengeId,
          team3_id
        );
        await submitVote(
          Contract,
          addr5,
          rewardActionId,
          challengeId,
          team3_id
        );

        expect(
          await Contract.getAllUserChallengeRewards(addr3.address)
        ).to.have.length(3);

        expect((await Contract.challengePools(challengeId)).isCompleted).to.be
          .true;

        expect(
          await Contract.connect(addr3).claimReward(
            claimActionId,
            rewardActionId,
            0,
            challengeId
          )
        )
          .to.emit(Contract, "RewardClaimed")
          .withArgs(
            claimActionId,
            rewardActionId,
            1,
            challengeId,
            team3_id,
            amount,
            false,
            0,
            addr3.address
          );
      });

      it("Should transfer SVT to user", async function () {
        const { addr5, addr3, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team5_id, team3_id } = await getTeams();
        const rewardActionId = generateActionId();
        const claimActionId = generateActionId();

        const amount = 70;
        const allowance = 80;
        const challengeId = 900;

        await createAndAcceptChallenge(
          Contract,
          Token,
          addr3,
          addr5,
          rewardActionId,
          team3_id,
          team5_id,
          amount,
          allowance,
          challengeId
        );

        await submitVote(
          Contract,
          addr3,
          rewardActionId,
          challengeId,
          team3_id
        );

        const balanceBeforeClaim = await Token.balanceOf(addr3.address);

        await submitVote(
          Contract,
          addr5,
          rewardActionId,
          challengeId,
          team3_id
        );

        expect(
          await Contract.getAllUserChallengeRewards(addr3.address)
        ).to.have.length(3);

        expect((await Contract.challengePools(challengeId)).isCompleted).to.be
          .true;

        await expect(
          Contract.connect(addr3).claimReward(
            claimActionId,
            rewardActionId,
            0,
            challengeId
          )
        )
          .to.emit(Contract, "RewardClaimed")
          .withArgs(
            claimActionId,
            rewardActionId,
            0,
            challengeId,
            team3_id,
            amount,
            true,
            addr3.address
          );

        const balanceAfterClaim = await Token.balanceOf(addr3.address);

        expect(balanceAfterClaim.sub(balanceBeforeClaim)).to.be.equal(amount);

        expect(await balanceAfterClaim.toNumber()).to.be.greaterThan(
          await balanceBeforeClaim.toNumber()
        );
      });
    });
  });

  // describe("\nContract Functions", function () {
  //   describe("public", function () {
  //     it("Should show teamMembers", async function () {
  //       console.log("teamMembers");
  //     });

  //     it("Should show sportsmanship", async function () {
  //       console.log("sportsmanship");
  //     });

  //     it("team_membership_request", async function () {
  //       console.log("team_membership_request");
  //     });

  //     it("Should show team_owner", async function () {
  //       console.log("team_owner");
  //     });

  //     it("Should show pending_challenge_pool_ids", async function () {
  //       console.log("pending_challenge_pool_ids ");
  //     });

  //     it("Should show challengePools", async function () {
  //       console.log("challengePools");
  //     });

  //     it("Should show votes", async function () {
  //       console.log("votes");
  //     });

  //     it("Should show getTeamMates", async function () {
  //       console.log("getTeamMates");
  //     });

  //     it("Should show getChallengePoolTeamMembers", async function () {
  //       console.log("getChallengePoolTeamMembers");
  //     });

  //     it("Should show getChallengePoolTeamMembersByTeam", async function () {
  //       console.log("getChallengePoolTeamMembersByTeam");
  //     });

  //     it("Should show getChallengePoolTeam2Members", async function () {
  //       console.log("getChallengePoolTeam2Members");
  //     });

  //     it("Should show getSVTBalance", async function () {
  //       console.log("getSVTBalance");
  //     });

  //     it("Should show getSVTAllowance", async function () {
  //       console.log("getSVTAllowance");
  //     });
  //   });
  // });
});
