/**
 * Cookie utility service for client-side cookie operations.
 */

import { UserProfile } from "@/types";
import { apiClient } from "./apiClient";


export async function getRole() {
  try {
    const res = await apiClient.get<any>('/api/auth/me');
    if (res.success && res.data) {
      const userData = Array.isArray(res.data) ? res.data[0] : res.data;
      return userData?.Role || null;
    }
    return null;
  } catch (err) {
    return null;
  }
}
