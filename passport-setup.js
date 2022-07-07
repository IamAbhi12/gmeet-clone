const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth2').Strategy;


passport.use(new GoogleStrategy({
    clientID:'139659427493-4p1k1hse9s5g2cngqsfe8cj92tqr8cal.apps.googleusercontent.com',
    clientSecret:'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',
    callbackURL: "/auth/google/callback",
    passReqToCallback: true
},
    (request, accessToken, refreshToken, profile, done) => {
        return done(null, profile);
    }
));

passport.serializeUser((user, done) => {
    done(null, user);
})

passport.deserializeUser((user, done) => {
    done(null, user);
})
