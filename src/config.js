module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET:
    process.env.JWT_SECRET ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE1OTE4MTkxMTgsInN1YiI6IlRVMUBnbWFpbC5jb20ifQ.IAZ2caz1Ll1uP1-mHGlb4Ti_Yr7hu4U8Rn2pAkL8Ng4",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "30m",
  DATABASE_URL:
    process.env.DATABASE_URL || "postgresql://dunder_mifflin@localhost/lgbtq",
  TEST_DATABASE_URL:
    process.env.TEST_DATABASE_URL ||
    "postgresql://dunder_mifflin@localhost/lgbtq-test",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:3000",
};
