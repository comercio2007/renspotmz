
"use client";

import type { UserRecord } from "@/actions/user.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, BarChart2 } from "lucide-react";
import { useMemo } from "react";
import { isToday, isThisWeek, isThisMonth, isThisYear, parseISO } from "date-fns";

type UserStatsProps = {
  users: UserRecord[];
};

export function UserStats({ users }: UserStatsProps) {
  const stats = useMemo(() => {
    const now = new Date();
    let daily = 0;
    let weekly = 0;
    let monthly = 0;
    let yearly = 0;

    users.forEach(user => {
      // The lastSignInTime might be a string, so we parse it.
      const lastSignIn = new Date(user.lastSignInTime);

      if (isToday(lastSignIn)) {
        daily++;
      }
      if (isThisWeek(lastSignIn, { weekStartsOn: 1 })) { // Monday as the first day of the week
        weekly++;
      }
      if (isThisMonth(lastSignIn)) {
        monthly++;
      }
      if (isThisYear(lastSignIn)) {
        yearly++;
      }
    });

    return { daily, weekly, monthly, yearly, total: users.length };
  }, [users]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuários Totais</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ativos Hoje</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.daily}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ativos esta Semana</CardTitle>
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.weekly}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ativos este Mês</CardTitle>
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.monthly}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ativos este Ano</CardTitle>
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.yearly}</div>
        </CardContent>
      </Card>
    </div>
  );
}
