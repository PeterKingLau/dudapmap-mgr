import { PeopleResultPage } from "../peopleResult";

const icon = new URL("../../../assets/images/attendance-user-month.png", import.meta.url).href;

export function ClockInMonthPeoplePage() {
  return (
    <PeopleResultPage
      description="查看指定员工在某一月份的打卡明细。"
      icon={icon}
      mode="month"
      title="指定人员当月打卡明细"
    />
  );
}
