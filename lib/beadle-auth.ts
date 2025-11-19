import { fetchCurrentUser } from './serverUtils';
import { retrieveSessionToken } from './utils';

export async function checkBeadleAccess(): Promise<{
  hasAccess: boolean;
  user: any;
  message?: string;
}> {
  try {
    const token = retrieveSessionToken();
    if (!token) {
      return {
        hasAccess: false,
        user: null,
        message: "Please log in to access this page."
      };
    }

    const user = await fetchCurrentUser(token, false);
    if (!user) {
      return {
        hasAccess: false,
        user: null,
        message: "Please log in to access this page."
      };
    }

    const roles = user.roles || [];
    const isBeadle = roles.includes('beadle');

    if (!isBeadle) {
      return {
        hasAccess: false,
        user,
        message: "You are not assigned as a beadle. Contact your form supervisor if you believe this is an error."
      };
    }

    return {
      hasAccess: true,
      user
    };
  } catch (error) {
    console.error("Error checking beadle access:", error);
    return {
      hasAccess: false,
      user: null,
      message: "An error occurred while checking your access."
    };
  }
}
