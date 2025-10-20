"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { ContributionHeatmap } from "@/components/contribution-heatmap";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/lib/use-session";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface DailySummary {
  date: string;
  weight: number;
  tagWeights: { [tagId: string]: number };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const { session, loading } = useSession();
  const router = useRouter();

  const { data: summaries, isLoading: dataLoading } = useSWR<DailySummary[]>(
    "/api/daily-summary",
    fetcher
  );
  const { data: allTags, isLoading: tagsLoading } = useSWR<Tag[]>(
    "/api/tags",
    fetcher
  );

  console.log("summaries", summaries); // DEBUG

  useEffect(() => {
    if (!loading && !session?.user) {
      router.push("/login");
    }
  }, [session, loading, router]);

  const allTimeTagWeights = useMemo(() => {
    const weights: { [tagId: string]: number } = {};
    if (!summaries || !Array.isArray(summaries)) {
      return weights;
    }
    summaries.forEach((s: DailySummary) => {
      if (s.tagWeights) {
        for (const tagId in s.tagWeights) {
          weights[tagId] = (weights[tagId] || 0) + s.tagWeights[tagId];
        }
      }
    });
    console.log("allTimeTagWeights", weights);
    return weights;
  }, [summaries]);

  const { todaySummary, currentStreak } = useMemo(() => {
    if (!summaries || !Array.isArray(summaries)) {
      return { todaySummary: null, currentStreak: 0 };
    }

    const today = new Date().toISOString().split("T")[0];
    const todaySummary =
      summaries.find((s: DailySummary) => s.date === today) || null;

    let currentStreak = 0;
    const checkDate = new Date();
    const summaryMap = new Map(
      summaries.map((d: DailySummary) => [d.date, d.weight])
    );

    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (summaryMap.has(dateStr) && summaryMap.get(dateStr)! > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return { todaySummary, currentStreak };
  }, [summaries]);

  if (loading || dataLoading || tagsLoading || !session?.user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {session.user.name}
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your progress and build streaks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Today's XP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Object.values(todaySummary?.tagWeights || {}).reduce(
                  (a, b) => a + b,
                  0
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {(allTags || []).map((tag) => (
                  <div key={tag.id} className="flex justify-between">
                    <span>{tag.name}</span>
                    <span>{todaySummary?.tagWeights?.[tag.id] || 0} XP</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">All-Time XP</CardTitle>
            </CardHeader>
            <CardContent>
              {(allTags || []).map((tag) => (
                <div key={tag.id} className="flex justify-between text-sm">
                  <span>{tag.name}</span>
                  <span>{allTimeTagWeights[tag.id] || 0} XP</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{currentStreak}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Current streak days
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contribution Heatmap</CardTitle>
            <CardDescription>Your activity over the past year</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <ContributionHeatmap
              data={Array.isArray(summaries) ? summaries : []}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
