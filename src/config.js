module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DB_URL: process.env.DB_URL || 'postgresql://dunder_mifflin@localhost/lgbtq',
    JWT_SECRET: process.env.JWT_SECRET || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE1OTE4MTkxMTgsInN1YiI6IlRVMUBnbWFpbC5jb20ifQ.IAZ2caz1Ll1uP1-mHGlb4Ti_Yr7hu4U8Rn2pAkL8Ng4',
    JWT_EXPIRY: process.env.JWT_EXPIRY || '20s'
}
