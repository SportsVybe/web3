const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

function generateActionId() {
  return Math.random().toString(36).substring(2, 15);
}

describe("SportsVybe Contract", function () {
  async function deployFixture() {
    const [owner, addr1, addr2, addr3, addr4, addr5] =
      await ethers.getSigners();
    const SportsVybeToken = await ethers.getContractFactory("SportsVybeToken");
    const Token = await SportsVybeToken.deploy();
    await Token.deployed();

    const SportsVybeContract = await ethers.getContractFactory("SportsVybe");
    const Contract = await SportsVybeContract.deploy(Token.address);
    await Contract.deployed();

    console.log("team0", owner.address);
    console.log("team1", addr1.address);
    console.log("team2", addr2.address);
    console.log("team3", addr3.address);
    console.log("team4", addr4.address);
    console.log("team5", addr5.address);

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
    const team0_value = 0;

    const team1 = await Contract.connect(addr1).createTeam(actionId);
    const team1_value = 1;

    const team2 = await Contract.connect(addr2).createTeam(actionId);
    const team2_value = 2;

    const team3 = await Contract.connect(addr3).createTeam(actionId);
    const team3_value = 3;

    const team4 = await Contract.connect(addr4).createTeam(actionId);
    const team4_value = 4;

    const team5 = await Contract.connect(addr5).createTeam(actionId);
    const team5_value = 5;

    return {
      team0,
      team1,
      team2,
      team3,
      team4,
      team5,
      team0_value,
      team1_value,
      team2_value,
      team3_value,
      team4_value,
      team5_value,
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

  async function transferAndApproveAmount(Contract, Token, account, amount) {
    await Token.transfer(account.address, amount);
    expect(await Token.balanceOf(account.address)).to.equal(amount);
    await Token.connect(account).approve(Contract.address, amount);
    expect(await Token.allowance(account.address, Contract.address)).to.equal(
      amount
    );
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
    account,
    actionId,
    creatorTeam,
    challengerTeam,
    amount
  ) {
    return Contract.connect(account).createChallengePool(
      actionId,
      creatorTeam,
      challengerTeam,
      amount
    );
  }

  async function acceptChallenge(
    Contract,
    account,
    actionId,
    teamId,
    amount,
    challengeId
  ) {
    return Contract.connect(account).acceptChallengePool(
      actionId,
      challengeId,
      teamId,
      amount
    );
  }

  describe("Token Deployment", function () {
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

      it("Should emit TeamCreated - 0", async function () {
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
        const { team0_value } = await getTeams();
        await expect(
          sendRequest(
            Contract,
            addr2,
            generateActionId(),
            team0_value,
            addr3.address
          )
        ).to.be.revertedWith(`TeamUnauthorized(${team0_value})`);
      });

      it("Should revert if sent to self", async function () {
        const { addr2, Contract } = await loadFixture(deployFixture);
        const { team2_value } = await getTeams();
        await expect(
          sendRequest(
            Contract,
            addr2,
            generateActionId(),
            team2_value,
            addr2.address
          )
        ).to.be.revertedWith("Cannot send an invite to yourself");
      });

      it("Should emit TeamMembershipRequestSent (team0 > 0 > team2)", async function () {
        const { Contract, addr3, addr2 } = await loadFixture(deployFixture);
        const { team3, team3_value } = await getTeams();
        const actionId = generateActionId();
        await expect(
          sendRequest(Contract, addr3, actionId, team3_value, addr2.address)
        )
          .to.emit(Contract, "TeamMembershipRequestSent")
          .withArgs(actionId, team3_value, addr2.address, team3.from);
      });
    });

    describe("acceptTeamMembershipRequest", function () {
      it("Should revert if no membership found", async function () {
        const { addr4, Contract } = await loadFixture(deployFixture);
        const { team1_value } = await getTeams();
        await expect(
          acceptRequest(Contract, addr4, generateActionId(), team1_value)
        ).to.be.revertedWith(
          `TeamMembershipRequestNotFound(${team1_value}, "${addr4.address}")`
        );
      });

      it("Should emit TeamMembershipRequestAccept (team1 > 1 > team4)", async function () {
        const { addr1, addr4, Contract } = await loadFixture(deployFixture);
        const { team1_value } = await getTeams();
        const actionId = generateActionId();
        await sendRequest(
          Contract,
          addr1,
          actionId,
          team1_value,
          addr4.address
        );
        await expect(acceptRequest(Contract, addr4, actionId, team1_value))
          .to.emit(Contract, "TeamMembershipRequestAccept")
          .withArgs(actionId, team1_value, addr4.address);
      });
    });
  });

  describe("\nChallenge Functions", function () {
    describe("createChallengePool", function () {
      it("Should revert if not the team owner", async function () {
        const { owner, Contract } = await loadFixture(deployFixture);
        const { team2_value, team1_value } = await getTeams();
        const amount = 0;
        await expect(
          createChallenge(
            Contract,
            owner,
            generateActionId(),
            team1_value,
            team2_value,
            amount
          )
        ).to.be.revertedWith(`TeamUnauthorized(${team1_value})`);
      });

      it("Should revert if challenging self", async function () {
        const { owner, Contract } = await loadFixture(deployFixture);
        const { team0_value } = await getTeams();
        const amount = 0;
        await expect(
          createChallenge(
            Contract,
            owner,
            generateActionId(),
            team0_value,
            team0_value,
            amount
          )
        ).to.be.revertedWith(
          `ChallengePoolCreationUnauthorized(${team0_value})`
        );
      });

      it("Should revert with 0 amount", async function () {
        const { owner, Contract } = await loadFixture(deployFixture);
        const { team0_value, team1_value } = await getTeams();
        const amount = 0;
        await expect(
          createChallenge(
            Contract,
            owner,
            generateActionId(),
            team0_value,
            team1_value,
            amount
          )
        ).to.be.reverted;
      });

      it("Should revert if sender balance is insufficient", async function () {
        const { addr1, Contract, Token } = await loadFixture(deployFixture);
        const { team1_value, team2_value } = await getTeams();
        const amount = 100;
        await transferAndApproveAmount(Contract, Token, addr1, 50);
        await expect(
          createChallenge(
            Contract,
            addr1,
            generateActionId(),
            team1_value,
            team2_value,
            amount
          )
        ).to.be.reverted;
      });

      it("Should emit ChallengePoolCreated (creator = 3 | challenger = 1 > 900)", async function () {
        const { addr3, Contract, Token } = await loadFixture(deployFixture);
        const { team3_value, team1_value } = await getTeams();

        const actionId = generateActionId();
        const amount = 10;

        await transferAndApproveAmount(Contract, Token, addr3, amount);

        await expect(
          createChallenge(
            Contract,
            addr3,
            actionId,
            team3_value,
            team1_value,
            amount
          )
        )
          .to.emit(Contract, "ChallengePoolCreated")
          .withArgs(actionId, 900, amount, team3_value, team1_value);
      });
    });

    describe("acceptChallengePool", function () {
      it("Should revert if not the team owner", async function () {
        const { owner, addr1, addr2, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team0_value, team1_value } = await getTeams();

        const actionId = generateActionId();
        const amount = 10;
        const challengeId = 900;
        await approveAmount(Contract, Token, owner, amount);
        await transferAndApproveAmount(Contract, Token, addr1, amount);

        await createChallenge(
          Contract,
          owner,
          actionId,
          team0_value,
          team1_value,
          amount
        );

        await expect(
          acceptChallenge(
            Contract,
            addr2,
            actionId,
            team1_value,
            amount,
            challengeId
          )
        ).to.be.revertedWith(`TeamUnauthorized(${team1_value})`);
      });

      it("Should revert if accepting team is not authorized", async function () {
        const { owner, addr1, addr3, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team0_value, team1_value, team3_value } = await getTeams();

        const actionId = generateActionId();
        const amount = 10;
        const challengeId = 900;
        await approveAmount(Contract, Token, owner, amount);
        await transferAndApproveAmount(Contract, Token, addr1, amount);

        await createChallenge(
          Contract,
          owner,
          actionId,
          team0_value,
          team1_value,
          amount
        );

        await expect(
          acceptChallenge(
            Contract,
            addr3,
            actionId,
            team3_value,
            amount,
            challengeId
          )
        ).to.be.revertedWith(`TeamUnauthorized(${team3_value})`);
      });

      it("Should emit ChallengePoolAccepted (challenger = 1 | creator = 0 | 900)", async function () {
        const { owner, addr1, Token, Contract } = await loadFixture(
          deployFixture
        );
        const { team0_value, team1_value } = await getTeams();

        const actionId = generateActionId();
        const amount = 10;
        const challengeId = 900;
        await approveAmount(Contract, Token, owner, amount);
        await transferAndApproveAmount(Contract, Token, addr1, amount);

        await createChallenge(
          Contract,
          owner,
          actionId,
          team0_value,
          team1_value,
          amount
        );

        await expect(
          acceptChallenge(
            Contract,
            addr1,
            actionId,
            team1_value,
            amount,
            challengeId
          )
        )
          .to.emit(Contract, "ChallengePoolAccepted")
          .withArgs(actionId, 900, team0_value, team1_value);
      });
    });
  });
});
