"use client";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { destroyCookie, parseCookies, setCookie } from "nookies"; // Cookie management
import Loading from "./loading";

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    const checkAndHandleAuth = async () => {
      console.log("Auth URL:", process.env.NEXT_PUBLIC_AUTH_URL);
      try {
        const isAuthenticated = await checkAndRefreshToken(
          `${process.env.NEXT_PUBLIC_AUTH_URL}/verifyAuth`
        );

        if (!isAuthenticated) {
          console.warn("User not authenticated. Redirecting...");
          router.push("/auth/signin");
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        router.push("/auth/signin");
      }
    };

    checkAndHandleAuth();
  }, [router]);

  async function getNewAccessToken(apiUrl, refreshToken,userName ) {
    console.log("Attempting to refresh token...");
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken,username:userName }),
      });

      console.log("Token refresh response status:", response.status);

      if (!response.ok) {
        throw new Error(`Failed to refresh token. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("New tokens received:", data);

      if (!data.accessToken || !data.refreshToken) {
        throw new Error("Invalid token response from server");
      }

      setCookie(null, "accessToken", data.accessToken, { path: "/", secure: true });
      setCookie(null, "refreshToken", data.refreshToken, { path: "/", secure: true });

      return data.accessToken;
    } catch (error) {
      console.error("Session expired. Redirecting to login...", error);
      destroyCookie(null, "accessToken");
      destroyCookie(null, "refreshToken");
      return null;
    }
  }

  async function checkAndRefreshToken(apiUrl) {
    const cookies = parseCookies();
    let accessToken = cookies["accessToken"];
    const refreshToken = cookies["refreshToken"];
    const userName = cookies["userName"];


    if (!refreshToken) {
      console.warn("No refresh token found. Redirecting to login...");
      return false;
    }

    if (!accessToken) {
      console.warn("No access token found. Attempting refresh...");
      accessToken = await getNewAccessToken(apiUrl, refreshToken,userName );
      return !!accessToken;
    }

    try {
      const tokenParts = accessToken.split(".");
      if (tokenParts.length !== 3) {
        throw new Error("Malformed access token");
      }

      const tokenPayload = JSON.parse(atob(tokenParts[1]));
      if (!tokenPayload.exp) {
        throw new Error("Token does not have an expiration time");
      }

      const expiryTime = tokenPayload.exp * 1000;
      const currentTime = Date.now();

      console.log(`Token Expiry: ${new Date(expiryTime)}`);
      console.log(`Current Time: ${new Date(currentTime)}`);

      if (currentTime >= expiryTime) {
        console.warn("Access token expired. Refreshing...");
        accessToken = await getNewAccessToken(apiUrl, refreshToken,userName );
        return !!accessToken;
      }

      return true;
    } catch (error) {
      console.error("Invalid access token. Redirecting to login...", error);
      return false;
    }
  }

  useEffect(()=>{
    router.push('/dashboard')
  },[router])

  return <div><Loading/></div>;
};

export default Page;
