import { PeopleResultPage } from "../peopleResult";

const icon = new URL("../../../assets/images/attendance-user-day.png", import.meta.url).href;

export function ClockInDayPeoplePage() {
  return (
    <PeopleResultPage
      description="查看指定员工在某一天的打卡次数。"
      icon={icon}
      mode="day"
      title="指定人员当天打卡"
    />
  );
}
