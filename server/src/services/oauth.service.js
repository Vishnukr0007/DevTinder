import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

/**
 * Generate Google OAuth 2.0 Authorization URL
 */
export const getGoogleAuthUrl = () => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: process.env.GOOGLE_CALLBACK_URL || "http://localhost:8000/api/auth/google/callback",
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };

  const queryParams = new URLSearchParams(options).toString();
  return `${rootUrl}?${queryParams}`;
};

/**
 * Exchange authorization code for Google tokens and user profile
 */
export const getGoogleUser = async (code) => {
  const url = "https://oauth2.googleapis.com/token";
  const values = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_CALLBACK_URL || "http://localhost:8000/api/auth/google/callback",
    grant_type: "authorization_code",
  };

  const tokenRes = await axios.post(url, new URLSearchParams(values).toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const { id_token, access_token } = tokenRes.data;

  const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`, {
    headers: { Authorization: `Bearer ${id_token}` },
  });

  return {
    googleId: userRes.data.id,
    email: userRes.data.email,
    firstName: userRes.data.given_name || userRes.data.name?.split(" ")[0] || "Google",
    lastName: userRes.data.family_name || userRes.data.name?.split(" ").slice(1).join(" ") || "User",
    avatarUrl: userRes.data.picture,
    provider: "GOOGLE",
  };
};

/**
 * Generate GitHub OAuth 2.0 Authorization URL
 */
export const getGithubAuthUrl = () => {
  const rootUrl = "https://github.com/login/oauth/authorize";
  const options = {
    client_id: process.env.GITHUB_CLIENT_ID || "",
    redirect_uri: process.env.GITHUB_CALLBACK_URL || "http://localhost:8000/api/auth/github/callback",
    scope: "user:email read:user",
  };

  const queryParams = new URLSearchParams(options).toString();
  return `${rootUrl}?${queryParams}`;
};

/**
 * Exchange authorization code for GitHub access token and user profile
 */
export const getGithubUser = async (code) => {
  const tokenUrl = "https://github.com/login/oauth/access_token";
  const tokenRes = await axios.post(
    tokenUrl,
    {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GITHUB_CALLBACK_URL || "http://localhost:8000/api/auth/github/callback",
    },
    { headers: { Accept: "application/json" } }
  );

  const accessToken = tokenRes.data?.access_token;
  if (!accessToken) {
    throw new Error(
      `GitHub Token Exchange Failed: ${tokenRes.data?.error_description || tokenRes.data?.error || "Invalid authorization code or credentials"}`
    );
  }

  const userRes = await axios.get("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "DevTinder-App",
    },
  });

  let email = userRes.data.email;
  if (!email) {
    const emailRes = await axios.get("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "DevTinder-App",
      },
    });
    const primaryObj = emailRes.data.find((e) => e.primary) || emailRes.data[0];
    email = primaryObj ? primaryObj.email : `${userRes.data.login}@github.user`;
  }

  const nameParts = (userRes.data.name || userRes.data.login).split(" ");
  const firstName = nameParts[0] || userRes.data.login;
  const lastName = nameParts.slice(1).join(" ") || "Dev";

  return {
    githubId: String(userRes.data.id),
    email,
    firstName,
    lastName,
    avatarUrl: userRes.data.avatar_url,
    githubUrl: userRes.data.html_url,
    provider: "GITHUB",
  };
};

/**
 * Find or create user from OAuth profile
 */
export const findOrCreateOAuthUser = async (profile) => {
  const { email, googleId, githubId, firstName, lastName, avatarUrl, githubUrl, provider } = profile;

  let user = null;
  if (googleId) {
    user = await prisma.user.findUnique({ where: { googleId } });
  } else if (githubId) {
    user = await prisma.user.findUnique({ where: { githubId } });
  }

  if (user) {
    return user;
  }

  user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const updateData = {};
    if (googleId) updateData.googleId = googleId;
    if (githubId) updateData.githubId = githubId;
    if (avatarUrl && !user.avatarUrl) updateData.avatarUrl = avatarUrl;
    if (githubUrl && !user.githubUrl) updateData.githubUrl = githubUrl;

    user = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });
    return user;
  }

  user = await prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      avatarUrl,
      githubUrl,
      googleId,
      githubId,
      provider,
      isEmailVerified: true,
    },
  });

  return user;
};
