"use client";

import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles } from "lucide-react";

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

interface ContributionHeatmapProps {
  data: DailySummary[];
}

export function ContributionHeatmap({ data }: ContributionHeatmapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [weeks, setWeeks] = useState<Array<Array<DailySummary | null>>>([]);
  const [monthLabels, setMonthLabels] = useState<
    Array<{ name: string; weekIndex: number }>
  >([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchTags = async () => {
      const res = await fetch("/api/tags");
      const data = await res.json();
      setAllTags(data);
    };
    fetchTags();
  }, []);

  useEffect(() => {
    if (!isMounted || !Array.isArray(data)) return; // Don't run on server or if data is not an array

    const dataMap = new Map(data.map((d) => [d.date, d]));
    const today = new Date();
    const startDate = new Date(today);
    startDate.setFullYear(startDate.getFullYear() - 1);

    const firstDate = new Date(startDate);
    const day = firstDate.getDay();
    const diff = firstDate.getDate() - day;
    firstDate.setDate(diff);

    const allWeeks: Array<Array<DailySummary | null>> = [];
    const currentDate = new Date(firstDate);

    while (currentDate <= today) {
      const currentWeek: Array<DailySummary | null> = [];
      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toISOString().split("T")[0];
        if (currentDate >= startDate && currentDate <= today) {
          const summary = dataMap.get(dateStr);
          currentWeek.push(
            summary || { date: dateStr, weight: 0, tagWeights: {} }
          );
        } else {
          currentWeek.push(null);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      allWeeks.push(currentWeek);
    }

    setWeeks(allWeeks);

    let lastMonth = -1;
    const labels = allWeeks
      .map((week, i) => {
        const firstDay = week.find((d) => d);
        if (!firstDay) return null;
        const month = new Date(firstDay.date).getMonth();
        if (month !== lastMonth) {
          lastMonth = month;
          return {
            name: new Date(firstDay.date).toLocaleString("default", {
              month: "short",
            }),
            weekIndex: i,
          };
        }
        return null;
      })
      .filter((l) => l) as Array<{ name: string; weekIndex: number }>;

    setMonthLabels(labels);
  }, [data, isMounted]);

  const getColor = (day: DailySummary | null) => {
    if (!day || !day.tagWeights) return "bg-muted";
    const total = Object.values(day.tagWeights).reduce((a, b) => a + b, 0);
    if (total === 0) return "bg-muted";
    if (total <= 2) return "bg-green-200 dark:bg-green-900";
    if (total <= 5) return "bg-green-400 dark:bg-green-700";
    if (total <= 8) return "bg-green-600 dark:bg-green-600";
    return "bg-green-800 dark:bg-green-500";
  };
  if (!isMounted) {
    return null; // or a skeleton loader
  }

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        <div className="flex gap-1">
          <div className="flex flex-col gap-1 pt-8">
            {dayLabels.map((label) => (
              <div
                key={label}
                className="w-8 h-8 flex items-center justify-center text-xs text-muted-foreground"
              >
                {label}
              </div>
            ))}
          </div>

          <div className="flex flex-col">
            <div className="flex" style={{ paddingLeft: "4px" }}>
              {monthLabels.map((month, index) => {
                const nextMonthWeekIndex =
                  monthLabels[index + 1]?.weekIndex || weeks.length;
                const monthWidth =
                  (nextMonthWeekIndex - month.weekIndex) * (32 + 4) - 4;
                return (
                  <div
                    key={month.name}
                    style={{ minWidth: monthWidth }}
                    className="text-xs text-muted-foreground mb-1"
                  >
                    {month.name}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <Popover key={`${weekIndex}-${dayIndex}`}>
                      <PopoverTrigger asChild>
                        <div
                          className={`w-8 h-8 rounded border border-border cursor-pointer transition-all hover:ring-2 hover:ring-primary ${getColor(
                            day
                          )}`}
                        />
                      </PopoverTrigger>
                      {day && day.weight > 0 && (
                        <PopoverContent className="w-80">
                          <Card>
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                              <Sparkles className="h-8 w-8 text-yellow-400" />
                              <div>
                                <CardTitle className="text-xl font-bold">
                                  Level Up!
                                </CardTitle>
                                <CardDescription>
                                  You earned{" "}
                                  {Object.values(day.tagWeights || {}).reduce(
                                    (a, b) => a + b,
                                    0
                                  )}{" "}
                                  XP on{" "}
                                  {new Date(day.date).toLocaleDateString()}
                                </CardDescription>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <p className="font-bold">XP Breakdown:</p>
                                {Object.entries(day.tagWeights || {}).map(
                                  ([tagId, weight]) => {
                                    const tag = allTags.find(
                                      (t) => t.id === tagId
                                    );
                                    if (!tag) return null;
                                    const percentage =
                                      (weight / day.weight) * 100;
                                    return (
                                      <div key={tagId}>
                                        <div className="flex justify-between text-sm mb-1">
                                          <span className="font-medium">
                                            {tag.name}
                                          </span>
                                          <span>{weight} XP</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-primary/20 overflow-hidden">
                                          <div
                                            className="h-full rounded-full transition-all"
                                            style={{
                                              width: `${percentage}%`,
                                              backgroundColor: tag.color,
                                            }}
                                          />
                                        </div>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                              <div className="mt-4 text-center text-xs text-muted-foreground italic">
                                "The journey of a thousand miles begins with a
                                single step."
                              </div>
                            </CardContent>
                          </Card>
                        </PopoverContent>
                      )}
                    </Popover>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded bg-muted" />
            <div className="w-3 h-3 rounded bg-green-200 dark:bg-green-900" />
            <div className="w-3 h-3 rounded bg-green-400 dark:bg-green-700" />
            <div className="w-3 h-3 rounded bg-green-600 dark:bg-green-600" />
            <div className="w-3 h-3 rounded bg-green-800 dark:bg-green-500" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
