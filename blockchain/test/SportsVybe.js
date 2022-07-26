const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

function generateActionId() {
  return Math.random().toString(36).substring(2, 15);
}

describe("SportsVybe Contract Tests", function () {
  async function deployFixture() {
    const [owner, addr1, addr2, addr3, addr4, addr5] =
      await ethers.getSigners();
    const SportsVybeToken = await ethers.getContractFactory("SportsVybeToken");
    const Token = await SportsVybeToken.deploy();
    await Token.deployed();

    const SportsVybeContract = await ethers.getContractFactory("SportsVybe");
    const Contract = await SportsVybeContract.deploy(Token.address);
    await Contract.deployed();

    console.log("\n//-------------- Test Addresses --------------//\n");
    console.log("team0", owner.address);
    console.log("team1", addr1.address);
    console.log("team2", addr2.address);
    console.log("team3", addr3.address);
    console.log("team4", addr4.address);
    console.log("team5", addr5.address);
    console.log("\n//-------------- Starting Tests --------------//\n");

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
    if (actionId === "log") {
      console.log(account.address, amount);
    }
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
      console.log(voter, actionId, challengeId, vote);
    }
    return Contract.connect(voter).submitVote(actionId, challengeId, vote);
  }

  describe("Deployment", function () {
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

  describe("\nTeam Functions", function () {
    describe("createTeam", function () {
      // it("Should revert if actionId is null", async function () {
      //   const { Contract } = await loadFixture(deployFixture);
      //   const newTeam = Contract.createTeam(" ");
      //   await expect(newTeam).to.be.reverted;
      // });

      it("Should revert if actionId is empty", async function () {
        const { Contract } = await loadFixture(deployFixture);
        const newTeam = Contract.createTeam("");
        await expect(newTeam).to.be.revertedWith("Action ID cannot be empty");
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
        ).to.be.revertedWith("Cannot send an invite to yourself");
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
          await Contract.getChallengePoolTeam1Members(challengeId).length
        ).to.be.equal(
          await Contract.getChallengePoolTeam2Members(challengeId).length
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

        const team_1_members = await Contract.getChallengePoolTeam1Members(
          challengeId
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
  });
});
