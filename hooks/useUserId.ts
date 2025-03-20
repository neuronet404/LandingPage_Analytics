import { useState, useEffect } from "react";
import { parseCookies } from "nookies";

const useUserId = () => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const cookies = parseCookies();
    setUserId(cookies?.userSub || null);
  }, []);

  return userId;
};

export default useUserId;
