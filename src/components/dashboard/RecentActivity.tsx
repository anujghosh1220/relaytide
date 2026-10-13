"use client";

import { ActivityTimeline } from "./ActivityTimeline";

export const RecentActivity = () => {
  return <ActivityTimeline limit={10} />;
};

export default RecentActivity;