const request = require("supertest");
const app = require("../../src/app");
const { sequelize } = require("../../src/models");

async function createUser(payload) {
  const response = await request(app).post("/users").send(payload);
  return response;
}

describe("Splitwise MVP API", () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("POST /users", () => {
    it("creates a user with unique email", async () => {
      const response = await createUser({
        email: "alice@example.com",
        password: "StrongPass123",
        defaultCurrency: "inr"
      });

      expect(response.statusCode).toBe(201);
      expect(response.body.data).toMatchObject({
        email: "alice@example.com",
        defaultCurrency: "INR"
      });
      expect(response.body.data).not.toHaveProperty("password");
      expect(response.body.data).not.toHaveProperty("passwordHash");
    });

    it("returns conflict for duplicate email", async () => {
      await createUser({
        email: "bob@example.com",
        password: "StrongPass123",
        defaultCurrency: "USD"
      });

      const duplicateResponse = await createUser({
        email: "bob@example.com",
        password: "AnotherPass123",
        defaultCurrency: "USD"
      });

      expect(duplicateResponse.statusCode).toBe(409);
      expect(duplicateResponse.body.error.code).toBe("CONFLICT");
    });
  });

  describe("POST /expenses", () => {
    it("creates expense, deduplicates members, and splits amount deterministically", async () => {
      const user1 = (await createUser({
        email: "u1@example.com",
        password: "StrongPass123",
        defaultCurrency: "INR"
      })).body.data;
      const user2 = (await createUser({
        email: "u2@example.com",
        password: "StrongPass123",
        defaultCurrency: "INR"
      })).body.data;
      const user3 = (await createUser({
        email: "u3@example.com",
        password: "StrongPass123",
        defaultCurrency: "INR"
      })).body.data;

      const response = await request(app)
        .post("/expenses")
        .set("x-user-id", String(user1.id))
        .send({
          name: "Team Lunch",
          value: "100.00",
          currency: "INR",
          members: [user3.id, user2.id, user1.id, user2.id],
          paidByUserId: user1.id,
          date: "2026-04-01"
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.data.totalAmountMinor).toBe(10000);
      expect(response.body.data.members).toEqual([
        { userId: user1.id, shareAmountMinor: 3334 },
        { userId: user2.id, shareAmountMinor: 3333 },
        { userId: user3.id, shareAmountMinor: 3333 }
      ]);
    });

    it("fails when amount is invalid", async () => {
      const creator = (await createUser({
        email: "creator@example.com",
        password: "StrongPass123",
        defaultCurrency: "USD"
      })).body.data;

      const response = await request(app)
        .post("/expenses")
        .set("x-user-id", String(creator.id))
        .send({
          name: "Invalid Expense",
          value: "0",
          currency: "USD",
          members: [creator.id],
          paidByUserId: creator.id,
          date: "2026-04-02"
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("fails when payer is not part of members", async () => {
      const creator = (await createUser({
        email: "creator2@example.com",
        password: "StrongPass123",
        defaultCurrency: "USD"
      })).body.data;
      const payer = (await createUser({
        email: "payer@example.com",
        password: "StrongPass123",
        defaultCurrency: "USD"
      })).body.data;

      const response = await request(app)
        .post("/expenses")
        .set("x-user-id", String(creator.id))
        .send({
          name: "Taxi",
          value: "18.00",
          currency: "USD",
          members: [creator.id],
          paidByUserId: payer.id,
          date: "2026-04-03"
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("GET /balances", () => {
    it("returns net balances between users from expense records", async () => {
      const userA = (await createUser({
        email: "a@example.com",
        password: "StrongPass123",
        defaultCurrency: "INR"
      })).body.data;
      const userB = (await createUser({
        email: "b@example.com",
        password: "StrongPass123",
        defaultCurrency: "INR"
      })).body.data;

      await request(app)
        .post("/expenses")
        .set("x-user-id", String(userA.id))
        .send({
          name: "Dinner",
          value: "100.00",
          currency: "INR",
          members: [userA.id, userB.id],
          paidByUserId: userA.id,
          date: "2026-04-05"
        });

      await request(app)
        .post("/expenses")
        .set("x-user-id", String(userB.id))
        .send({
          name: "Cab",
          value: "30.00",
          currency: "INR",
          members: [userA.id, userB.id],
          paidByUserId: userB.id,
          date: "2026-04-06"
        });

      await request(app)
        .post("/expenses")
        .set("x-user-id", String(userA.id))
        .send({
          name: "Solo Coffee",
          value: "10.00",
          currency: "INR",
          members: [userA.id],
          paidByUserId: userA.id,
          date: "2026-04-07"
        });

      const response = await request(app)
        .get("/balances")
        .set("x-user-id", String(userA.id));

      expect(response.statusCode).toBe(200);
      expect(response.body.data.userId).toBe(userA.id);
      expect(response.body.data.balances).toHaveLength(1);
      expect(response.body.data.balances[0]).toMatchObject({
        withUserId: userB.id,
        currency: "INR",
        netAmountMinor: 3500,
        absoluteAmountMinor: 3500,
        direction: "you_are_owed"
      });
    });

    it("requires user context", async () => {
      const response = await request(app).get("/balances");

      expect(response.statusCode).toBe(401);
      expect(response.body.error.code).toBe("UNAUTHORIZED");
    });
  });
});
